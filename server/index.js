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
// Graph app for the login/Users workbook (lives in the Intuition tenant).
const TENANT = process.env.GRAPH_TENANT_ID;
const CLIENT_ID = process.env.GRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.GRAPH_CLIENT_SECRET;
const SHARE_URL = process.env.USERS_SHARE_URL;
const SHEET = process.env.USERS_SHEET_NAME || "Users";

// Separate Graph app for sending the Join-the-Ranks email. Lives in the
// spartansaurora.ca tenant so mail is sent from a spartansaurora.ca mailbox.
// Falls back to the login app above if these aren't set.
const MAIL_TENANT = process.env.MAIL_GRAPH_TENANT_ID || TENANT;
const MAIL_CLIENT_ID = process.env.MAIL_GRAPH_CLIENT_ID || CLIENT_ID;
const MAIL_CLIENT_SECRET = process.env.MAIL_GRAPH_CLIENT_SECRET || CLIENT_SECRET;

// SharePoint/OneDrive sharing URL -> Graph "shares" token.
function encodeShareUrl(url) {
  const b64 = Buffer.from(url, "utf8").toString("base64");
  return "u!" + b64.replace(/=+$/, "").replace(/\//g, "_").replace(/\+/g, "-");
}

// Client-credentials token for a given app registration.
async function getTokenFor(tenant, clientId, clientSecret) {
  const res = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
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

// Token for the login/Users-workbook app (Intuition tenant).
function getToken() {
  return getTokenFor(TENANT, CLIENT_ID, CLIENT_SECRET);
}

// Token for the mail-sending app (spartansaurora.ca tenant).
function getMailToken() {
  return getTokenFor(MAIL_TENANT, MAIL_CLIENT_ID, MAIL_CLIENT_SECRET);
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

// ---------------------------------------------------------------------------
// YouTube community posts (the @SpartansAurora "Posts" tab).
//
// The YouTube Data API has no endpoint for community posts, and the posts page
// can't be iframed (X-Frame-Options). So we fetch the page server-side (no CORS
// there), pull the `ytInitialData` JSON the page bootstraps with, and extract
// each post's caption + image thumbnails. Fragile by nature (depends on
// YouTube's page shape), so it fails soft to an empty list.
// ---------------------------------------------------------------------------
const POSTS_URL =
  process.env.YT_POSTS_URL || "https://www.youtube.com/@SpartansAurora/posts";
let postsCache = { items: null, at: 0 };
const POSTS_CACHE_MS = 10 * 60 * 1000;

// Recursively collect every value stored under `key` anywhere in the tree.
function collectByKey(node, key, acc = []) {
  if (Array.isArray(node)) {
    for (const v of node) collectByKey(v, key, acc);
  } else if (node && typeof node === "object") {
    for (const k of Object.keys(node)) {
      if (k === key) acc.push(node[k]);
      collectByKey(node[k], key, acc);
    }
  }
  return acc;
}

function extractPost(post) {
  const id = post.postId || "";
  const text = (post.contentText?.runs || []).map((r) => r.text).join("");
  const published = post.publishedTimeText?.runs?.[0]?.text || "";
  const images = [];
  if (post.backstageAttachment) {
    for (const ir of collectByKey(post.backstageAttachment, "backstageImageRenderer")) {
      const thumbs = ir.image?.thumbnails || [];
      const best = thumbs[thumbs.length - 1];
      if (best?.url) images.push(best.url);
    }
  }
  const link = id ? `https://www.youtube.com/post/${id}` : POSTS_URL;
  return { id, text, published, images, link };
}

async function loadCommunityPosts() {
  if (postsCache.items && Date.now() - postsCache.at < POSTS_CACHE_MS) {
    return postsCache.items;
  }
  const res = await fetch(`${POSTS_URL}?hl=en`, {
    headers: {
      // A desktop UA + consent cookie keeps YouTube from serving a consent
      // interstitial (common from EU/datacenter IPs) instead of the page.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: "SOCS=CAI; CONSENT=YES+1",
    },
  });
  if (!res.ok) {
    throw new Error(`YouTube posts fetch failed: ${res.status}`);
  }
  const html = await res.text();
  const match = html.match(/ytInitialData\s*=\s*(\{.+?\})\s*;\s*<\/script>/s);
  if (!match) {
    throw new Error("Could not locate ytInitialData on the posts page.");
  }
  const data = JSON.parse(match[1]);
  const items = collectByKey(data, "backstagePostRenderer")
    .map(extractPost)
    .filter((p) => p.images.length > 0);
  postsCache = { items, at: Date.now() };
  return items;
}

app.get("/api/community-posts", async (_req, res) => {
  try {
    const items = await loadCommunityPosts();
    res.json({ items });
  } catch (err) {
    console.error("Community posts error:", err.message);
    res.status(502).json({ error: "Unable to load community posts.", items: [] });
  }
});

// ---------------------------------------------------------------------------
// "Join the Ranks" enquiry form -> email notification.
//
// Sends the submitted details to JOIN_NOTIFY_TO via Microsoft Graph, using the
// dedicated mail app (MAIL_GRAPH_* in the spartansaurora.ca tenant). That app
// needs the application permission Mail.Send (with admin consent) and
// JOIN_MAIL_FROM must be a licensed mailbox in that same tenant.
// ---------------------------------------------------------------------------
const MAIL_TO = process.env.JOIN_NOTIFY_TO || "shyamalee@spartansaurora.ca";
// Sender MUST be a mailbox in the mail app's tenant (spartansaurora.ca).
const MAIL_FROM = process.env.JOIN_MAIL_FROM || "shyamalee@spartansaurora.ca";

// Escape user-supplied text before embedding it in the HTML email body.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

app.post("/api/join", async (req, res) => {
  const { firstName, lastName, phone, email } = req.body || {};
  if (!firstName || !lastName || !phone || !email) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!MAIL_TENANT || !MAIL_CLIENT_ID || !MAIL_CLIENT_SECRET) {
    return res.status(500).json({
      error:
        "Mail server is not configured. Set MAIL_GRAPH_TENANT_ID, MAIL_GRAPH_CLIENT_ID and MAIL_GRAPH_CLIENT_SECRET.",
    });
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222">` +
    `<h2 style="margin:0 0 12px">New "Join the Ranks" submission</h2>` +
    `<table cellpadding="6" style="border-collapse:collapse">` +
    `<tr><td style="font-weight:bold">First name</td><td>${escapeHtml(firstName)}</td></tr>` +
    `<tr><td style="font-weight:bold">Last name</td><td>${escapeHtml(lastName)}</td></tr>` +
    `<tr><td style="font-weight:bold">Telephone</td><td>${escapeHtml(phone)}</td></tr>` +
    `<tr><td style="font-weight:bold">Email</td><td>${escapeHtml(email)}</td></tr>` +
    `</table>` +
    `<p style="color:#888;margin-top:16px">Submitted from the Spartans Aurora website.</p>` +
    `</div>`;

  try {
    const token = await getMailToken();
    const graphRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(MAIL_FROM)}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: `New Join the Ranks submission — ${fullName}`,
            body: { contentType: "HTML", content: html },
            toRecipients: [{ emailAddress: { address: MAIL_TO } }],
            // Lets the recipient reply straight to the applicant.
            replyTo: [{ emailAddress: { address: email } }],
          },
          saveToSentItems: true,
        }),
      }
    );

    if (!graphRes.ok) {
      throw new Error(`Graph sendMail failed: ${graphRes.status} ${await graphRes.text()}`);
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("Join submit error:", err.message);
    const msg = err.message || "";
    if (msg.includes(" 403") || msg.includes("ErrorAccessDenied")) {
      return res.status(502).json({
        error:
          "The mail app lacks permission. Grant the Azure app the application permission Mail.Send with admin consent.",
      });
    }
    return res
      .status(502)
      .json({ error: "Unable to send your submission right now. Please try again later." });
  }
});

// ---------------------------------------------------------------------------
// Team schedule -> shyamalee@spartansaurora.ca calendar (next 30 days).
//
// Reads the calendar of CALENDAR_USER via Microsoft Graph using the dedicated
// mail app (MAIL_GRAPH_* in the spartansaurora.ca tenant). That app needs the
// application permission Calendars.Read (with admin consent). We ask Graph to
// return times in Eastern time via the Prefer header so the client can show
// them as-is.
// ---------------------------------------------------------------------------
const CALENDAR_USER =
  process.env.CALENDAR_USER || process.env.JOIN_NOTIFY_TO || "shyamalee@spartansaurora.ca";
const CALENDAR_TIMEZONE = process.env.CALENDAR_TIMEZONE || "Eastern Standard Time";

app.get("/api/schedule", async (_req, res) => {
  if (!MAIL_TENANT || !MAIL_CLIENT_ID || !MAIL_CLIENT_SECRET) {
    return res.status(500).json({
      error:
        "Schedule server is not configured. Set MAIL_GRAPH_TENANT_ID, MAIL_GRAPH_CLIENT_ID and MAIL_GRAPH_CLIENT_SECRET.",
      events: [],
    });
  }

  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    startDateTime: now.toISOString(),
    endDateTime: end.toISOString(),
    $select: "subject,start,end,location,isAllDay,bodyPreview,webLink",
    $orderby: "start/dateTime",
    $top: "100",
  });

  try {
    const token = await getMailToken();
    const graphRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
        CALENDAR_USER
      )}/calendarView?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: `outlook.timezone="${CALENDAR_TIMEZONE}"`,
        },
      }
    );
    if (!graphRes.ok) {
      throw new Error(
        `Graph calendarView failed: ${graphRes.status} ${await graphRes.text()}`
      );
    }
    const data = await graphRes.json();
    const events = (data.value || []).map((e) => ({
      subject: e.subject || "(No title)",
      start: e.start?.dateTime || null,
      end: e.end?.dateTime || null,
      timeZone: e.start?.timeZone || CALENDAR_TIMEZONE,
      location: e.location?.displayName || "",
      isAllDay: !!e.isAllDay,
      preview: e.bodyPreview || "",
      link: e.webLink || "",
    }));
    return res.json({ events });
  } catch (err) {
    console.error("Schedule error:", err.message);
    const msg = err.message || "";
    if (msg.includes(" 403") || msg.includes("ErrorAccessDenied")) {
      return res.status(502).json({
        error:
          "The app lacks permission to read the calendar. Grant the Azure app the application permission Calendars.Read with admin consent.",
        events: [],
      });
    }
    if (msg.includes("ErrorItemNotFound") || msg.includes(" 404")) {
      return res.status(502).json({
        error: "Calendar not found. Check CALENDAR_USER is a valid mailbox.",
        events: [],
      });
    }
    return res
      .status(502)
      .json({ error: "Unable to load the schedule right now.", events: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
