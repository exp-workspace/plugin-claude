#!/usr/bin/env node
// Usage: da-config-writer --org <org> --token <token> --config '<json>'
// Writes the given config JSON to https://admin.da.live/config/<org>/
// using multipart/form-data (field name: "config"), mirroring what DA's
// saveDaConfig helper does in the browser.

import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    org:    { type: 'string' },
    token:  { type: 'string' },
    config: { type: 'string' },
  },
  strict: true,
});

const { org, token, config: configStr } = values;

if (!org || !token || !configStr) {
  console.error('Usage: da-config-writer --org <org> --token <token> --config <json>');
  process.exit(1);
}

let config;
try {
  config = JSON.parse(configStr);
} catch {
  console.error('--config value is not valid JSON');
  process.exit(1);
}

const url = `https://admin.da.live/config/${org}/`;

const formData = new FormData();
formData.append('config', JSON.stringify(config));

const res = await fetch(url, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});

if (!res.ok) {
  const body = await res.text().catch(() => '');
  console.error(`PUT ${url} failed: ${res.status} ${res.statusText}`);
  if (body) console.error(body);
  process.exit(1);
}

console.log(`Config written to ${url} (${res.status})`);
