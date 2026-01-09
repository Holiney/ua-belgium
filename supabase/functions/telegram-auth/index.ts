import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate Telegram auth data using HMAC-SHA256
async function validateTelegramAuth(data: Record<string, string>, botToken: string): Promise<boolean> {
  const { hash, ...authData } = data;

  if (!hash) return false;

  // Create data-check-string
  const checkArr = Object.keys(authData)
    .sort()
    .map((key) => `${key}=${authData[key]}`);
  const checkString = checkArr.join("\n");

  // Create secret key from bot token
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest("SHA-256", encoder.encode(botToken));

  // Calculate HMAC-SHA256
  const key = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(checkString));
  const calculatedHash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Verify hash matches
  if (calculatedHash !== hash) {
    return false;
  }

  // Check auth_date is not too old (allow 1 day)
  const authDate = parseInt(authData.auth_date);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return false;
  }

  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const jwtSecret = Deno.env.get("SUPABASE_JWT_SECRET");

    if (!botToken || !supabaseUrl || !supabaseServiceKey || !jwtSecret) {
      throw new Error("Missing environment variables");
    }

    const { telegramData } = await req.json();

    if (!telegramData || !telegramData.id) {
      return new Response(
        JSON.stringify({ error: "Missing Telegram data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert telegramData to string values for validation
    const dataForValidation: Record<string, string> = {};
    for (const [key, value] of Object.entries(telegramData)) {
      if (value !== undefined && value !== null && value !== "") {
        dataForValidation[key] = String(value);
      }
    }

    // Validate Telegram auth
    const isValid = await validateTelegramAuth(dataForValidation, botToken);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid Telegram authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const telegramId = String(telegramData.id);
    const fullName = `${telegramData.first_name || ""}${telegramData.last_name ? " " + telegramData.last_name : ""}`.trim() || "Користувач";

    // Check if user exists by telegram_id in profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("telegram_id", parseInt(telegramId))
      .single();

    let userId: string;

    if (existingProfile) {
      // User exists
      userId = existingProfile.id;

      // Update profile with latest Telegram data
      await supabase
        .from("profiles")
        .update({
          telegram_username: telegramData.username || null,
          name: fullName,
          avatar_url: telegramData.photo_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    } else {
      // Create new user
      const email = `telegram-${telegramId}@telegram.users.local`;

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          name: fullName,
          username: telegramData.username,
          photo_url: telegramData.photo_url,
        },
      });

      if (createError || !newUser.user) {
        console.error("Create user error:", createError);
        throw new Error("Failed to create user");
      }

      userId = newUser.user.id;

      // Create profile
      await supabase.from("profiles").upsert({
        id: userId,
        telegram_id: parseInt(telegramId),
        telegram_username: telegramData.username || null,
        name: fullName,
        avatar_url: telegramData.photo_url || null,
      });
    }

    // Generate JWT token
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24 * 7; // 7 days

    const payload = {
      aud: "authenticated",
      exp: getNumericDate(exp),
      iat: getNumericDate(now),
      iss: `${supabaseUrl}/auth/v1`,
      sub: userId,
      email: `telegram-${telegramId}@telegram.users.local`,
      role: "authenticated",
      user_metadata: {
        telegram_id: telegramId,
        name: fullName,
        username: telegramData.username,
        photo_url: telegramData.photo_url,
      },
    };

    // Import JWT secret key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(jwtSecret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const token = await create({ alg: "HS256", typ: "JWT" }, payload, cryptoKey);

    // Get profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return new Response(
      JSON.stringify({
        access_token: token,
        token_type: "bearer",
        expires_in: 60 * 60 * 24 * 7,
        user: {
          id: userId,
          email: `telegram-${telegramId}@telegram.users.local`,
          user_metadata: payload.user_metadata,
        },
        profile,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
