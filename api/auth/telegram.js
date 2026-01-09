export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  const url = new URL(request.url);
  const params = url.searchParams.toString();

  // Redirect to main page with Telegram auth params
  const redirectUrl = params ? `/?${params}` : '/';

  return Response.redirect(new URL(redirectUrl, url.origin), 302);
}
