'use strict';

const http = require('node:http');
const https = require('node:https');

function isLoopback(input) {
  const host = typeof input === 'string'
    ? input
    : input?.hostname || input?.host || input?.headers?.host || '';
  const normalized = String(host).replace(/^\[|\]$/g, '').split(':')[0].toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

for (const client of [http, https]) {
  const originalRequest = client.request;
  client.request = function guardedRequest(...args) {
    const first = args[0];
    const second = args[1];
    const destination = typeof first === 'string' || first instanceof URL ? first : second || first;
    if (!isLoopback(destination)) throw new Error('OCR evaluation blocked a non-local network request.');
    return originalRequest.apply(this, args);
  };
}

const originalFetch = globalThis.fetch;
if (originalFetch) {
  globalThis.fetch = function guardedFetch(input, ...args) {
    const destination = typeof input === 'string' ? input : input?.url;
    if (!isLoopback(new URL(destination).hostname)) throw new Error('OCR evaluation blocked a non-local fetch.');
    return originalFetch.call(this, input, ...args);
  };
}
