import crypto from 'crypto';

export default function handler(req, res) {
  const data = req.query;

  // Extract hash from data
  const { hash, ...rest } = data;

  if (!hash) {
    return res.status(400).send('Missing hash');
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return res.status(500).send('Server configuration error');
  }

  // Verify Telegram hash
  const secret = crypto
    .createHash('sha256')
    .update(botToken)
    .digest();

  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n');

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');

  if (hmac !== hash) {
    console.error('Invalid Telegram hash');
    return res.status(403).send('Invalid Telegram auth');
  }

  // Check auth_date is not too old (max 1 day)
  const authDate = parseInt(rest.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return res.status(403).send('Auth data expired');
  }

  // Telegram verified - redirect back to app with auth data
  const params = new URLSearchParams(data);
  const redirectUrl = `/?${params.toString()}`;

  res.redirect(302, redirectUrl);
}
