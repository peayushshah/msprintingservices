"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { promisify } = require("node:util");

const scrypt = promisify(crypto.scrypt);
const ROOT = __dirname;
const PRIVATE_DIR = path.join(ROOT, "private-admin");
const DATA_DIR = path.join(ROOT, ".local-data");
const SETTINGS_FILE = path.join(DATA_DIR, "site-settings.json");
const DEFAULTS = JSON.parse(fs.readFileSync(path.join(ROOT, "site-defaults.json"), "utf8"));
const sessions = new Map();
const loginAttempts = new Map();

function readEnvFile() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}
readEnvFile();

const adminPassword = process.env.ADMIN_PASSWORD || "";
if (adminPassword.length < 12) {
  console.error("Set ADMIN_PASSWORD to a unique password of at least 12 characters in .env before starting the server.");
  process.exit(1);
}
const passwordSalt = crypto.randomBytes(16);
const passwordHash = crypto.scryptSync(adminPassword, passwordSalt, 64);
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const secureCookie = process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
const MAX_BODY = 12 * 1024 * 1024;
const SESSION_MS = 4 * 60 * 60 * 1000;

function send(res, status, body, headers = {}) {
  const securityHeaders = { "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self'; connect-src 'self'; form-action 'self' https://formsubmit.co; frame-src 'self'; frame-ancestors 'self'; base-uri 'self'; object-src 'none'", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "SAMEORIGIN" };
  if (secureCookie) securityHeaders["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  res.writeHead(status, { ...securityHeaders, ...headers });
  res.end(body);
}
function json(res, status, value, headers) { send(res, status, JSON.stringify(value), { "Content-Type": "application/json; charset=utf-8", ...headers }); }
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin || !req.headers.host) return false;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
function cookieValue(req, name) {
  const cookies = (req.headers.cookie || "").split(";");
  for (const cookie of cookies) { const pair = cookie.trim().split("="); if (pair[0] === name) return decodeURIComponent(pair.slice(1).join("=")); }
  return "";
}
function getSession(req) {
  const id = cookieValue(req, "mst_admin");
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expires < Date.now()) { sessions.delete(id); return null; }
  session.expires = Date.now() + SESSION_MS;
  return session;
}
function cookieHeader(id, maxAge) {
  return `mst_admin=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookie ? "; Secure" : ""}`;
}
function isAdminAsset(urlPath) { return urlPath === "/admin/assets/admin.css" || urlPath === "/admin/assets/admin.js"; }
function mime(file) {
  return ({ ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" })[path.extname(file)] || "application/octet-stream";
}
function serveFile(res, file, cache = false) {
  if (!fs.existsSync(file)) { send(res, 404, "Not found"); return; }
  send(res, 200, fs.readFileSync(file), { "Content-Type": mime(file), "Cache-Control": cache ? "public, max-age=300" : "no-store" });
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0, chunks = [];
    req.on("data", chunk => { size += chunk.length; if (size > MAX_BODY) { reject(Object.assign(new Error("Request is too large."), { status: 413 })); req.destroy(); return; } chunks.push(chunk); });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
async function readJson(req) {
  const raw = await readBody(req);
  try { return JSON.parse(raw || "{}"); } catch { throw Object.assign(new Error("Invalid JSON request."), { status: 400 }); }
}
function loadSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")); } catch { return structuredClone(DEFAULTS); }
}
function saveSettings(settings) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw Object.assign(new Error("Settings must be a JSON object."), { status: 400 });
  const clean = JSON.parse(JSON.stringify(settings));
  if (Buffer.byteLength(JSON.stringify(clean), "utf8") > MAX_BODY) throw Object.assign(new Error("Settings are too large. Use fewer or smaller images."), { status: 413 });
  if (!Array.isArray(clean.products) || clean.products.length > 150 || !Array.isArray(clean.categories) || clean.categories.length > 30 || !Array.isArray(clean.customSections) || clean.customSections.length > 30) throw Object.assign(new Error("The product, collection, or section list is invalid or too large."), { status: 400 });
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = SETTINGS_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(clean, null, 2), { mode: 0o600 });
  fs.renameSync(temp, SETTINGS_FILE);
}
function rateLimited(ip) {
  const now = Date.now(), entry = loginAttempts.get(ip);
  if (!entry || now >= entry.until) { loginAttempts.set(ip, { count: 0, until: now + 15 * 60 * 1000 }); return false; }
  return entry.count >= 8;
}
function failLogin(ip) { const entry = loginAttempts.get(ip) || { count: 0, until: Date.now() + 15 * 60 * 1000 }; entry.count += 1; loginAttempts.set(ip, entry); }

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const session = getSession(req);

    if (url.pathname === "/api/site-settings" && req.method === "GET") return json(res, 200, loadSettings());
    if (url.pathname === "/api/admin/login" && req.method === "POST") {
      if (!sameOrigin(req)) return json(res, 403, { error: "Login request origin is not allowed." });
      const ip = req.socket.remoteAddress || "unknown";
      if (rateLimited(ip)) return json(res, 429, { error: "Too many login attempts. Wait 15 minutes and try again." });
      const body = await readJson(req);
      const input = typeof body.password === "string" ? body.password : "";
      if (input.length < 12 || input.length > 256) { failLogin(ip); return json(res, 401, { error: "The password is incorrect." }); }
      const attemptedHash = await scrypt(input, passwordSalt, 64);
      if (!crypto.timingSafeEqual(passwordHash, attemptedHash)) { failLogin(ip); return json(res, 401, { error: "The password is incorrect." }); }
      loginAttempts.delete(ip);
      const id = crypto.randomBytes(32).toString("hex");
      const csrf = crypto.randomBytes(32).toString("hex");
      sessions.set(id, { csrf, expires: Date.now() + SESSION_MS });
      return json(res, 200, { ok: true }, { "Set-Cookie": cookieHeader(id, Math.floor(SESSION_MS / 1000)) });
    }
    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      if (!session) return serveFile(res, path.join(PRIVATE_DIR, "login.html"));
      return serveFile(res, path.join(PRIVATE_DIR, "admin.html"));
    }
    if (url.pathname === "/admin/login.js" && req.method === "GET") return serveFile(res, path.join(PRIVATE_DIR, "login.js"));
    if (isAdminAsset(url.pathname)) {
      if (!session) return send(res, 401, "Sign in required");
      const asset = url.pathname.endsWith("admin.css") ? "admin.css" : "admin.js";
      return serveFile(res, path.join(PRIVATE_DIR, asset));
    }
    if (url.pathname.startsWith("/api/admin/")) {
      if (!session) return json(res, 401, { error: "Sign in required." });
      if (req.method !== "GET" && (!sameOrigin(req) || req.headers["x-csrf-token"] !== session.csrf)) return json(res, 403, { error: "Request verification failed. Refresh the admin panel and try again." });
      if (url.pathname === "/api/admin/settings" && req.method === "GET") return json(res, 200, { settings: loadSettings(), csrf: session.csrf });
      if (url.pathname === "/api/admin/defaults" && req.method === "GET") return json(res, 200, { settings: structuredClone(DEFAULTS), csrf: session.csrf });
      if (url.pathname === "/api/admin/settings" && req.method === "PUT") {
        const settings = await readJson(req);
        saveSettings(settings);
        return json(res, 200, { ok: true, csrf: session.csrf });
      }
      if (url.pathname === "/api/admin/logout" && req.method === "POST") {
        const id = cookieValue(req, "mst_admin"); sessions.delete(id);
        return json(res, 200, { ok: true }, { "Set-Cookie": cookieHeader("", 0) });
      }
      return json(res, 404, { error: "Admin endpoint not found." });
    }
    const publicFiles = { "/": "index.html", "/index.html": "index.html", "/styles.css": "styles.css", "/app.js": "app.js", "/site-config.js": "site-config.js" };
    if (req.method === "GET" && publicFiles[url.pathname]) return serveFile(res, path.join(ROOT, publicFiles[url.pathname]), url.pathname !== "/" && url.pathname !== "/index.html");
    return send(res, 404, "Not found");
  } catch (error) {
    if (!res.headersSent) json(res, error.status || 500, { error: error.status ? error.message : "Server error." });
    else res.destroy();
  }
});

server.listen(port, host, () => console.log(`MS TEXTILE site listening at http://${host}:${port}`));
