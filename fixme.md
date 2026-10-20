# fixme

Known broken things that are not part of current work.

## `/signin/`, `/signup/`, `/signout/` return 404

Found 2026-10-20. The theme's header and footer link to these paths, but
Ghost serves member authentication through Portal (`#/portal/signin`),
which the homepage already uses. All three return Ghost's own themed 404
page, so this is routing, not Cloudflare.

They appear in Google Search Console under **Not found (404)**, three of
the seven listed for the property.

Fix is presumably to point those links at the Portal routes, but it
touches the shared header and footer partials rather than anything
guide-specific, so it has been left alone.
