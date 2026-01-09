export default function handler(req, res) {
  // Simply redirect to main page with all Telegram auth params
  // Validation will happen in the Edge Function
  const params = new URLSearchParams(req.query);
  const redirectUrl = `/?${params.toString()}`;
  res.redirect(302, redirectUrl);
}
