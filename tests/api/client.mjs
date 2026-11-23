const defaultBaseURL = process.env.TTP_BASE_URL || 'http://127.0.0.1:3002';

function assertLocalTarget(baseURL) {
  const url = new URL(baseURL);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('Stage 2B test API client only permits an approved loopback target.');
  }
}

export async function requestExistingEndpoint(pathname, options = {}) {
  const { baseURL: configuredBaseURL, ...requestOptions } = options;
  const baseURL = configuredBaseURL || defaultBaseURL;
  assertLocalTarget(baseURL);
  if (!pathname.startsWith('/')) throw new Error('API request paths must begin with /.');
  const requestURL = new URL(pathname, baseURL);
  if (requestURL.origin !== new URL(baseURL).origin) {
    throw new Error('API request path must resolve to the configured loopback origin.');
  }
  const response = await fetch(requestURL, requestOptions);
  return {
    status: response.status,
    headers: response.headers,
    text: () => response.text(),
    json: () => response.json()
  };
}
