import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function validateTelegramAuth(data: Record<string, string>, botToken: string): Promise<boolean> {
  const { hash, ...authData } = data;
  if (!hash) return false;

  const checkArr = Object.keys(authData).sort().map((key) => `${key}=${authData[key]}`);
  const checkString = checkArr.join("\n");

  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest("SHA-256", encoder.encode(botToken));
  const key = await crypto.subtle.importKey("raw", secretKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(checkString));
  const calculatedHash = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");

  if (calculatedHash !== hash) return false;
  const authDate = parseInt(authData.auth_date);
  if (Math.floor(Date.now() / 1000) - authDate > 86400) return false;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!botToken || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const { telegramData } = await req.json();
    if (!telegramData?.id) {
      return new Response(JSON.stringify({ error: "Missing Telegram data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const dataForValidation: Record<string, string> = {};
    for (const [key, value] of Object.entries(telegramData)) {
      if (value !== undefined && value !== null && value !== "") {
        dataForValidation[key] = String(value);
      }
    }

    const isValid = await validateTelegramAuth(dataForValidation, botToken);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid Telegram authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const telegramId = String(telegramData.id);
    const fullName = `${telegramData.first_name || ""}${telegramData.last_name ? " " + telegramData.last_name : ""}`.trim() || "Користувач";
    const email = `tg${telegramId}@telegram.local`;
    const password = `tg_${telegramId}_${botToken.slice(-10)}`;

    // Check if user exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("telegram_id", parseInt(telegramId))
      .single();

    let userId: string;

    if (existingProfile) {
      // User exists
      userId = existingProfile.id;

      // Update profile
      await supabase.from("profiles").update({
        telegram_username: telegramData.username || null,
        name: fullName,
        avatar_url: telegramData.photo_url || null,
      }).eq("id", userId);

      return new Response(JSON.stringify({
        success: true,
        user_id: userId,
        telegram_id: telegramId,
        email: email,
        password: password,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          name: fullName,
          username: telegramData.username,
          photo_url: telegramData.photo_url
        },
      });

      if (createError) throw createError;
      userId = newUser.user!.id;

      // Create profile
      await supabase.from("profiles").upsert({
        id: userId,
        telegram_id: parseInt(telegramId),
        telegram_username: telegramData.username || null,
        name: fullName,
        avatar_url: telegramData.photo_url || null,
      });

      return new Response(JSON.stringify({
        success: true,
        user_id: userId,
        telegram_id: telegramId,
        email: email,
        password: password,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
