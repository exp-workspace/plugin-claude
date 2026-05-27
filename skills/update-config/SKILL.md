---
name: Update DA Config
description: >
  Update the DA (Document Authoring) site configuration to open the experience workspace
  canvas editor instead of the default DA editor. Authenticates against Adobe IMS using a
  cached token, the da-auth-helper CLI, a DA MCP server, or manual token paste as fallback.
  Reads the current config from admin.da.live, and — if the editor.path key is missing —
  PUTs the updated config with the canvas editor path for the given org/site.
---

This skill defines how to update the configuration in DA to use the experience workspace editor instead of the default DA editor.

## Login

### Step 1: Check for a Cached Token

Before triggering a browser login, check whether a valid token is already cached.

```bash
DA_TOKEN=$(node -e "
  const fs = require('fs');
  const p = process.env.HOME + '/.aem/da-token.json';
  try {
    const t = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (t.expires_at > Date.now() + 60000) process.stdout.write(t.access_token);
  } catch {}
")
```

If `DA_TOKEN` is non-empty, skip to **Step 3**.

### Step 2: Obtain a Token *(login required)*

Choose the option that fits the environment:

**Option A (preferred) — `da-auth-helper` CLI:**

The `da-auth-helper` tool handles the full IMS OAuth 2.0 implicit flow, caches the token at `~/.aem/da-token.json`, and prints the token to stdout.

```bash
# Run directly without a global install
DA_TOKEN=$(npx github:adobe-rnd/da-auth-helper token)
```

If `npx` is unavailable or slow, install globally first:

```bash
npm install -g github:adobe-rnd/da-auth-helper
DA_TOKEN=$(da-auth-helper token)
```

This opens a browser window. Instruct the user:

> Please complete the Adobe IMS login in the browser window that just opened. The token will be captured automatically once you log in.

Success: `DA_TOKEN` is a non-empty JWT string starting with `eyJ`.

**Option B — DA MCP server:**

If a DA MCP server is configured in the session, use its authentication tool to start the OAuth flow and retrieve the token from the response.

**Option C — Manual paste *(last resort)*:**

> I need an Adobe IMS access token to push content to DA. You can copy one from your browser:
> 1. Open [da.live](https://da.live) and log in
> 2. Open DevTools → Network tab → find any request to `admin.da.live`
> 3. Copy the `Authorization: Bearer <token>` value (without the `Bearer ` prefix)
> 4. Paste it here

## Step 3: Verify the Token Works

Confirm the token is accepted by the DA API before proceeding:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer {{DA_TOKEN}}" \
  "https://admin.da.live/list/{{ORG}}/{{SITE}}"
```

Success: HTTP `200`. The token is valid — `DA_TOKEN` is ready for use by the calling skill.

# Write to config

## Step 1: Read config

Perform a GET request to https://admin.da.live/config/<org>/ using curl with the Authorization header set to the bearer token obtained before.

We need to check the following:

Case A: The returned JSON contains an array called `data`
Case B: The returned JSOn contains an object called `data`, with an array called `data`

In both cases, we care about the ARRAY, not the object.

Check whether there is already an objet inside the `data` array with the following:

{
  "key": "editor.path",
  "value": "/<org>/<site>/=https://da.live/canvas#"
}

(Make sure to subsititue <org> and <site>!)

If it doesn't exist, add a new entry to the array as defined above and PUT using curl.

Make sure to correctly encode the body as mutlipart form data, using the curl -F flag.

PUT https://admin.da.live/config/<org>/
Content-Type: multipart/form-data