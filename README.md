# MS TEXTILE storefront

The storefront is served by a small Node.js server so settings and admin access are handled on the server, not in browser storage. No package installation is required; the server uses Node.js built-in modules.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and replace `ADMIN_PASSWORD` with a unique password of at least 12 characters.
3. From this folder, run `node server.js`.
4. Open `http://127.0.0.1:3000` for the storefront and `http://127.0.0.1:3000/admin` for admin sign-in.

The server refuses to start when the password is missing or too short. Admin passwords are checked on the server using scrypt. Login uses an HttpOnly, SameSite cookie, CSRF checks, and throttling after repeated failed attempts. In production, put the server behind HTTPS, set `NODE_ENV=production`, and configure the host and port for your server.

## Admin panel and GitHub

The admin interface lives in `private-admin/`; `.gitignore` excludes that entire folder, `.env`, and `.local-data/`. The old tracked admin files and empty `.env` have been removed from the Git index, so the next commit removes them from the current repository tree. The admin UI files remain on this computer and are not part of regular Git pushes.

Storefront settings and uploaded images are written to `.local-data/site-settings.json`, which is also ignored. Back it up securely if you need to preserve your live configuration.

GitHub Pages cannot run this Node.js server. Deploy the public site and `server.js` to a Node-capable host. Because the admin UI is intentionally ignored by Git, transfer `private-admin/` separately to the server using a private deployment method. Do not put real passwords or settings files in GitHub.
