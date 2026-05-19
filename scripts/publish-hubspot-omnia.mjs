#!/usr/bin/env node
/**
 * Upload OMNIA HubSpot theme and create/publish the home site page.
 *
 * Requires: HubSpot CLI (`hs`) authenticated for account stefan-cursor-hubspot
 * Optional: HUBSPOT_ACCESS_TOKEN (overrides CLI token for page API)
 *
 * Usage:
 *   node scripts/publish-hubspot-omnia.mjs
 *   node scripts/publish-hubspot-omnia.mjs --slug omnia --name "OMNIA Home"
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const THEME_SRC = join(ROOT, "hubspot-cms/omnia-theme");
const THEME_DEST = "omnia-theme";
const ACCOUNT = "stefan-cursor-hubspot";
const TEMPLATE_PATH = "omnia-theme/templates/home.html";

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    slug: "home",
    name: "OMNIA — Home",
    publish: true,
    skipUpload: false,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--slug") out.slug = args[++i];
    if (args[i] === "--name") out.name = args[++i];
    if (args[i] === "--draft") out.publish = false;
    if (args[i] === "--skip-upload") out.skipUpload = true;
  }
  return out;
}

function getTokenFromConfig() {
  if (process.env.HUBSPOT_ACCESS_TOKEN) return process.env.HUBSPOT_ACCESS_TOKEN;
  const configPath = join(homedir(), ".hscli/config.yml");
  const yaml = readFileSync(configPath, "utf8");
  const accountBlock = yaml.split(`name: ${ACCOUNT}`)[1];
  if (!accountBlock) throw new Error(`Account ${ACCOUNT} not found in ~/.hscli/config.yml`);
  const tokenMatch = accountBlock.match(/accessToken:\s*>\-\s*\n\s*([A-Za-z0-9_\-]+)/);
  if (!tokenMatch) throw new Error("Could not read access token from HubSpot CLI config");
  return tokenMatch[1];
}

function uploadTheme() {
  console.log("Uploading theme to HubSpot Design Manager…");
  execSync(
    `hs cms upload "${THEME_SRC}" "${THEME_DEST}" -a ${ACCOUNT} -m publish --force`,
    { stdio: "inherit", cwd: ROOT },
  );
}

async function findExistingPage(token, slug) {
  const url = new URL("https://api.hubapi.com/cms/v3/pages/site-pages");
  url.searchParams.set("limit", "100");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`List pages failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return (data.results || []).find((p) => p.slug === slug);
}

async function createOrUpdatePage(token, { slug, name, publish }) {
  const existing = await findExistingPage(token, slug);
  const body = {
    name,
    slug,
    templatePath: TEMPLATE_PATH,
    htmlTitle: "OMNIA — Cinematic Immersive Environments",
    metaDescription:
      "Cinematic spaces for collective experience. Narrative-led environments across culture, hospitality, entertainment, and public realm.",
  };

  if (existing) {
    console.log(`Updating page id ${existing.id} (${slug})…`);
    const res = await fetch(`https://api.hubapi.com/cms/v3/pages/site-pages/${existing.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Update page failed: ${res.status} ${await res.text()}`);
    const page = await res.json();
    if (publish) await publishPage(token, page.id);
    return page;
  }

  console.log(`Creating site page "${name}" at /${slug}…`);
  const res = await fetch("https://api.hubapi.com/cms/v3/pages/site-pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Create page failed: ${res.status} ${await res.text()}`);
  const page = await res.json();
  if (publish) await publishPage(token, page.id);
  return page;
}

async function publishPage(token, pageId) {
  console.log(`Publishing page ${pageId}…`);
  const res = await fetch(
    `https://api.hubapi.com/cms/v3/pages/site-pages/${pageId}/publish-action`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "schedule-publish" }),
    },
  );
  if (!res.ok) {
    const draft = await fetch(
      `https://api.hubapi.com/cms/v3/pages/site-pages/${pageId}/draft`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!draft.ok) {
      console.warn("Publish endpoint returned:", res.status, await res.text());
    }
  }
}

async function main() {
  const opts = parseArgs();
  if (!opts.skipUpload) uploadTheme();
  const token = getTokenFromConfig();
  try {
    const page = await createOrUpdatePage(token, opts);
    console.log("\nDone.");
    console.log(`  Page ID: ${page.id}`);
    console.log(`  Slug: /${page.slug || opts.slug}`);
    console.log(`  Template: ${TEMPLATE_PATH}`);
    console.log("\nOpen HubSpot → Marketing → Website → Website Pages to assign a domain and review.");
  } catch (err) {
    if (String(err.message || err).includes("403") || String(err.message || err).includes("MISSING_SCOPES")) {
      console.warn("\nTheme uploaded, but API could not create the page (token needs `content` scope).");
      console.warn("Create the page manually:");
      console.warn("  Marketing → Website → Website Pages → Create → template “OMNIA · Home”");
      console.warn(`  Preview theme: https://app.hubspot.com/theme-previewer/148344698/edit/omnia-theme`);
      process.exit(0);
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
