const mailHogUrl = 'http://127.0.0.1:8025/api/v2/search';

function messageText(message) {
  const content = message?.Content || message?.content || {};
  const parts = content.MIME?.Parts || content.mime?.parts || [];
  const text = [content.Body, ...parts.map(part => part.Body || part.body)].filter(Boolean).join('\n');
  if (!/Content-Transfer-Encoding:\s*quoted-printable/i.test(text)) return text;

  const chunks = [];
  const encoded = /=\r?\n|=([A-F0-9]{2})/gi;
  let offset = 0;
  for (const match of text.matchAll(encoded)) {
    const index = match.index;
    chunks.push(Buffer.from(text.slice(offset, index), 'utf8'));
    if (match[1]) chunks.push(Buffer.from([Number.parseInt(match[1], 16)]));
    offset = index + match[0].length;
  }
  chunks.push(Buffer.from(text.slice(offset), 'utf8'));
  return Buffer.concat(chunks).toString('utf8');
}

export async function waitForDevelopmentMailLink(email, route, timeoutMs = 15_000) {
  if (!['/account/verify-email', '/account/reset-password'].includes(route)) {
    throw new Error('Only the approved local verification and password recovery routes may be read from MailHog.');
  }
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const search = new URL(mailHogUrl);
    search.searchParams.set('kind', 'to');
    search.searchParams.set('query', email);
    const response = await fetch(search);
    if (!response.ok) throw new Error(`Local MailHog search failed with HTTP ${response.status}.`);
    const data = await response.json();
    const messages = data.items || data.messages || [];
    for (const message of messages) {
      const text = messageText(message);
      const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = text.match(new RegExp(`${escapedRoute}\\?token=([A-Fa-f0-9-]{36})`));
      if (match) return `http://127.0.0.1:3002${route}?token=${match[1]}`;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`No local Development email containing ${route} arrived for the synthetic test account.`);
}

export async function completeDevelopmentEmailVerification(page, email) {
  const link = await waitForDevelopmentMailLink(email, '/account/verify-email');
  const url = new URL(link);
  if (url.origin !== 'http://127.0.0.1:3002' || url.pathname !== '/account/verify-email') {
    throw new Error('MailHog returned an unexpected verification destination.');
  }
  await page.goto(link, { waitUntil: 'networkidle' });
  const result = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/email_verify');
  await page.getByRole('button', { name: 'Verify email address' }).click();
  const response = await result;
  return { status: response.status(), token: url.searchParams.get('token') };
}
