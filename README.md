# ClipMaster Pro (Render + Baserow)

A tiny Express server (`server.js`) serves the static frontend from
`public/` and exposes `/api/baserow`, which proxies to Baserow using
server-side env vars — your Baserow token never reaches the browser.

## Deploy

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In [Render](https://dashboard.render.com), click **New +** → **Web Service**,
   connect the repo, and use:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Runtime:** Node
   (Alternatively, if this repo includes `render.yaml`, use **New +** → **Blueprint**
   to pick everything up automatically.)
3. Under **Environment**, add:

   | Name               | Value                                                |
   |--------------------|--------------------------------------------------------|
   | `BASEROW_URL`      | `https://api.baserow.io` (optional, this is default)    |
   | `BASEROW_TABLE_ID` | the numeric ID of your Baserow table                    |
   | `BASEROW_TOKEN`    | a Baserow database token with access to that table      |

4. Deploy. Render will build and run `npm start`, which boots the server
   on the `PORT` it provides automatically.

## Baserow table setup

Create a table with two **text** fields:

- `label` — the name of the paste tab (e.g. "Paste 1")
- `content` — the raw buffer text for that tab

Each row = one tab in the app.

## Local development

```bash
npm install
BASEROW_TABLE_ID=xxxx BASEROW_TOKEN=xxxx npm start
```

Then open http://localhost:3000
