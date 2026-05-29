---
name: Migrate Code to Quick Edit
description: >
  Migrate an Adobe Edge Delivery Services (EDS) codebase to support experience workspace
  quick-edit WYSIWYG capabilities. Exports the loadPage function from scripts/scripts.js,
  injects the quick-edit bootstrap snippet, and creates tools/quick-edit/quick-edit.js with
  the full DA import-map and module-loading logic. Safe to run on repos that are already
  partially migrated — skips steps that are already in place.
---

You are working with an Adobe Edge Delivery codebase.

If you don't yet know where the code is, check the setup-workspace skill for instructions on how to establish it.

Your task is to add quick-edit to the user's codebase.

Perform the following steps:

- Locate the `scripts/scripts.js` file - by default this is in the root but may be moved
  - Hint: If you can't find it, check the head.html for an alternate entry point script
- Inside scripts.js, locate a function called `loadPage`. Task: Modify `loadPage` so that it is exported from the file.
  - In some cases, a modified version of `loadPage` may already be in use in a `daPreview` context. If such a function exists, use that instead.
- Modify scipts.js to include the following code at the end:

```
(() => {
  const hasQE = new URL(window.location.href).searchParams.has('quick-edit');
  // eslint-disable-next-line import/no-cycle
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
})();
```

- Create a new file `tools/quick-edit/quick-edit.js` with the following content:
  - NOTE: Make sure to adapt the `loadPage` import to point to the correct `loadPage` function identified.

```
// eslint-disable-next-line import/no-cycle
import { loadPage } from '../../scripts/scripts.js';

const importMap = {
  imports: {
    'da-lit': 'https://da.live/deps/lit/dist/index.js',
    'da-y-wrapper': 'https://da.live/deps/da-y-wrapper/dist/index.js',
  },
};

function addImportmap() {
  const importmapEl = document.createElement('script');
  importmapEl.type = 'importmap';
  importmapEl.textContent = JSON.stringify(importMap);
  document.head.appendChild(importmapEl);
}

async function loadModule(origin, payload) {
  const { default: loadQuickEdit } = await import(`${origin}/nx/public/plugins/quick-edit/quick-edit.js`);
  loadQuickEdit(payload, loadPage);
}

function generateSidekickPayload() {
  let { hostname } = window.location;
  if (hostname === 'localhost') {
    hostname = document.querySelector('meta[property="hlx:proxyUrl"]').content;
  }
  const parts = hostname.split('.')[0].split('--');
  const [, repo, owner] = parts;

  return {
    detail: {
      config: {
        mountpoint: `https://content.da.live/${owner}/${repo}/`,
      },
      location: {
        pathname: window.location.pathname,
      },
    },
  };
}

export default function init(payload) {
  const { search } = window.location;
  const ref = new URLSearchParams(search).get('quick-edit');
  let origin;
  if (ref === 'on' || !ref) origin = 'https://da.live';
  if (ref === 'local') origin = 'http://localhost:6456';
  if (!origin) origin = `https://${ref}--da-nx--adobe.aem.live`;
  addImportmap();
  loadModule(origin, payload || generateSidekickPayload());
}
```

IMPORTANT:

If any of these files already exist, skip that step but continue anyway. Make sure that the setup is correct as defined by this skill.

