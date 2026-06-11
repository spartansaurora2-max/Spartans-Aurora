/**
 * Auth proxy for Spartans Aurora.
 *
 * Validates login email + password against the "Users" sheet of a SharePoint
 * Excel workbook, read server-side via Microsoft Graph (client-credentials flow).
 * Passwords never reach the browser.
 *
 * Required env (in .env, NOT prefixed with VITE_ so they stay server-only):
 *   GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, USERS_SHARE_URL
 * Optional: USERS_SHEET_NAME (default "Users"), AUTH_SERVER_PORT (default 8787)
 *
 * The Azure AD app registration needs the application permission
 * Files.Read.All (or Sites.Read.All) with admin consent granted.
 *
 * Run with: npm run server
 */
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || process.env.AUTH_SERVER_PORT || 8787;
const TENANT = process.env.GRAPH_TENANT_ID;
const CLIENT_ID = process.env.GRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.GRAPH_CLIENT_SECRET;
const SHARE_URL = process.env.USERS_SHARE_URL;
const SHEET = process.env.USERS_SHEET_NAME || "Users";

// SharePoint/OneDrive sharing URL -> Graph "shares" token.
function encodeShareUrl(url) {
  const b64 = Buffer.from(url, "utf8").toString("base64");
  return "u!" + b64.replace(/=+$/, "").replace(/\//g, "_").replace(/\+/g, "-");
}

async function getToken() {
  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

async function graph(token, path) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Graph ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Cache the sheet briefly so each login attempt doesn't re-download the workbook.
let cache = { values: null, at: 0 };
const CACHE_MS = 60 * 1000;

async function loadUsers() {
  if (cache.values && Date.now() - cache.at < CACHE_MS) {
    return cache.values;
  }
  const token = await getToken();
  const encoded = encodeShareUrl(SHARE_URL);
  const item = await graph(
    token,
    `/shares/${encoded}/driveItem?$select=id,parentReference`
  );
  const driveId = item.parentReference?.driveId;
  const itemId = item.id;
  if (!driveId || !itemId) {
    throw new Error("Could not resolve the shared workbook from USERS_SHARE_URL.");
  }
  const range = await graph(
    token,
    `/drives/${driveId}/items/${itemId}/workbook/worksheets('${encodeURIComponent(
      SHEET
    )}')/usedRange(valuesOnly=true)?$select=values`
  );
  cache = { values: range.values || [], at: Date.now() };
  return cache.values;
}

function findCol(headers, candidates) {
  const norm = headers.map((h) => String(h).trim().toLowerCase());
  let i = norm.findIndex((h) => candidates.includes(h));
  if (i === -1) {
    i = norm.findIndex((h) => candidates.some((c) => h.includes(c)));
  }
  return i;
}

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (!TENANT || !CLIENT_ID || !CLIENT_SECRET || !SHARE_URL) {
    return res.status(500).json({
      error:
        "Auth server is not configured. Set GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET and USERS_SHARE_URL.",
    });
  }
  try {
    const values = await loadUsers();
    if (!values.length) {
      return res.status(500).json({ error: "The Users sheet is empty or unreadable." });
    }
    const headers = values[0];
    const emailCol = findCol(headers, ["email", "e-mail"]);
    const passCol = findCol(headers, ["password", "pass"]);
    const nameCol = findCol(headers, ["name"]);
    if (emailCol === -1 || passCol === -1) {
      return res
        .status(500)
        .json({ error: "Could not find 'Email'/'Password' columns in the Users sheet." });
    }

    const inputEmail = String(email).trim().toLowerCase();
    const row = values
      .slice(1)
      .find((r) => String(r[emailCol] ?? "").trim().toLowerCase() === inputEmail);

    if (!row || String(row[passCol] ?? "") !== String(password)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const name = nameCol !== -1 ? String(row[nameCol] ?? "").trim() : "";
    return res.json({ name: name || email, email });
  } catch (err) {
    console.error("Login error:", err.message);
    const msg = err.message || "";
    if (msg.includes(" 401") || msg.includes(" 403")) {
      return res.status(502).json({
        error:
          "The auth app can't read the workbook. Grant the Azure app the application permission Files.Read.All and admin consent.",
      });
    }
    if (msg.includes("ItemNotFound") || msg.includes(" 404")) {
      return res.status(502).json({
        error: "Workbook or 'Users' sheet not found. Check USERS_SHARE_URL and USERS_SHEET_NAME.",
      });
    }
    return res
      .status(502)
      .json({ error: "Unable to validate against the user directory." });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
