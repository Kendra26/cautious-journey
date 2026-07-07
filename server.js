// Render deploy: a tiny Express server that
//   1) serves the static frontend from /public
//   2) proxies /api/baserow calls to Baserow using server-side env vars
//
// Configure these in your Render service's Environment settings:
//   BASEROW_URL       (optional, defaults to https://api.baserow.io)
//   BASEROW_TABLE_ID  (required) - the numeric ID of your Baserow table
//   BASEROW_TOKEN     (required) - a Baserow database token
//
// Table needs two text fields: "label" and "content".

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getConfig() {
  const {
    BASEROW_URL = 'https://api.baserow.io',
    BASEROW_TABLE_ID,
    BASEROW_TOKEN,
  } = process.env;
  return { base: BASEROW_URL.replace(/\/$/, ''), tableId: BASEROW_TABLE_ID, token: BASEROW_TOKEN };
}

function headersFor(token) {
  return { Authorization: `Token ${token}`, 'Content-Type': 'application/json' };
}

app.get('/api/baserow', async (req, res) => {
  const { base, tableId, token } = getConfig();
  if (!tableId || !token) return res.status(500).json({ error: 'Server is missing BASEROW_TABLE_ID or BASEROW_TOKEN environment variables.' });
  try {
    const r = await fetch(`${base}/api/database/rows/table/${tableId}/?user_field_names=true&order_by=id&size=200`, { headers: headersFor(token) });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/baserow', async (req, res) => {
  const { base, tableId, token } = getConfig();
  if (!tableId || !token) return res.status(500).json({ error: 'Server is missing BASEROW_TABLE_ID or BASEROW_TOKEN environment variables.' });
  try {
    const r = await fetch(`${base}/api/database/rows/table/${tableId}/?user_field_names=true`, {
      method: 'POST',
      headers: headersFor(token),
      body: JSON.stringify(req.body || {}),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/baserow', async (req, res) => {
  const { base, tableId, token } = getConfig();
  const id = req.query.id;
  if (!tableId || !token) return res.status(500).json({ error: 'Server is missing BASEROW_TABLE_ID or BASEROW_TOKEN environment variables.' });
  if (!id) return res.status(400).json({ error: 'Missing row id (?id=)' });
  try {
    const r = await fetch(`${base}/api/database/rows/table/${tableId}/${id}/?user_field_names=true`, {
      method: 'PATCH',
      headers: headersFor(token),
      body: JSON.stringify(req.body || {}),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/baserow', async (req, res) => {
  const { base, tableId, token } = getConfig();
  const id = req.query.id;
  if (!tableId || !token) return res.status(500).json({ error: 'Server is missing BASEROW_TABLE_ID or BASEROW_TOKEN environment variables.' });
  if (!id) return res.status(400).json({ error: 'Missing row id (?id=)' });
  try {
    const r = await fetch(`${base}/api/database/rows/table/${tableId}/${id}/`, {
      method: 'DELETE',
      headers: headersFor(token),
    });
    if (r.status === 204) return res.status(204).end();
    const data = await r.json().catch(() => ({}));
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ClipMaster Pro server listening on port ${PORT}`));
