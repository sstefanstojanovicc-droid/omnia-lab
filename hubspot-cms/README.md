# OMNIA Lab — HubSpot CMS

Fully editable HubSpot CMS theme mirroring [omnia-lab.co](https://omnia-lab.co).

## Structure

| Path | Purpose |
|------|---------|
| `omnia-theme/` | Production theme (upload this) |
| `omnia-theme/templates/home.html` | Fixed-order home page (modules 1–7 + header/footer) |
| `omnia-theme/modules/omnia-01-scroll-tour` | Scroll-scrub architecture tour (repeatable beats + MP4 URLs) |
| `omnia-theme/modules/omnia-02-manifesto` … `omnia-07-contact` | Remaining page sections |
| `modules/omnia-site-embed.module` | Legacy iframe embed (superseded by theme) |

## Publish (theme + auto-create page)

```bash
node scripts/publish-hubspot-omnia.mjs
```

Uses account `stefan-cursor-hubspot` from `~/.hscli/config.yml`.

Options:

```bash
node scripts/publish-hubspot-omnia.mjs --slug omnia --name "OMNIA Home"
node scripts/publish-hubspot-omnia.mjs --draft   # create/update without publish action
```

Manual upload only:

```bash
hs cms upload hubspot-cms/omnia-theme omnia-theme -a stefan-cursor-hubspot -m publish
```

Then in HubSpot: **Marketing → Website → Website Pages → Create** → template **OMNIA · Home**.

## Editing content

1. Open the site page in the page editor.
2. Each section is a module in order (Header → Scroll tour → Manifesto → … → Footer).
3. **Scroll tour**: edit beats (index, title, headline, body, video URL). Reorder beats in the repeater to change scroll sequence.
4. **Videos**: paste HubSpot File Manager URLs, or keep defaults pointing at `https://omnia-lab.co/video/room-*.mp4`.
5. **Contact**: pick a HubSpot form in module settings.

## Notes

- Scroll-scrub runs in `omnia-01-scroll-tour.module/module.js` (simplified crossfade vs Next.js).
- For pixel-perfect parity with Next, host MP4s in HubSpot Files and tune beat copy in the editor.
- Assign your HubSpot website domain to the new page after first publish.
