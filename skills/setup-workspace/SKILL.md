---
name: Setup Experience Workspace
argument-hint: "[org/site]"
description: >
  Set up Adobe Experience Workspace for an Edge Delivery Services (EDS) project backed by DA
  (Document Authoring). Resolves the org/site/repo context, migrates the codebase to support
  quick-edit WYSIWYG (via the migrate-code skill), and configures DA to open the experience
  workspace editor (via the update-config skill). Use this as the single entry point when
  onboarding a new or existing EDS+DA project onto experience workspace.
---

## Overview

Experience workspace is an editing surface for CMS content in Adobe's Edge Delivery Services (EDS) with content stored in DA (Document Authoring or Dark Alley).

A project in Edge Delivery Services with DA consists of:
- Content stored in DA at https://da.live/#/org/site
- Code stored in github at https://github.com/org/repo

Note: often org == site, but this is not strictly always the case.

URLs of experience workspace look like https://da.live/canvas#/org/repo/path

Setting it up requires 2 steps:
- Migrating the code to support quick-edit wysiwyg capabilities (migrate-code skill)
- Configuring DA to open the new editing surface

## Tasks

Perform the following tasks:

- Establish (from context or by asking the user) which org and site they're working with
- Try to see if the directory we're in is a git repo with remote https://github.com/org/site.
  - If we are in a git repo starting with https://github.com/org but a different site, ask the user if the repo corresponds to the site
  - If not, ask the user where on the disk their code is and offer to clone the repo for them.
- With this context, execute the migrate-code skill
- Finally execute the update-config skill

