const { app, BrowserWindow, dialog, shell } = require("electron");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const DEFAULT_PORT = 8081;
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// The Expo web export is packaged next to the app; in the repository it is
// built by `pnpm --dir apps/mobile build:web`.
const webRoot = app.isPackaged
  ? path.join(process.resourcesPath, "web")
  : path.resolve(__dirname, "../mobile/dist/web");

app.setName("MyMuse");

function lookupFile(urlPath) {
  const clean = decodeURIComponent((urlPath || "/").split("?")[0].split("#")[0]);
  const candidate = path.resolve(webRoot, clean.replace(/^\/+/, "") || "index.html");
  if (!candidate.startsWith(webRoot + path.sep)) return null;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  // Unknown extensionless routes fall back to the single-page entry point.
  return path.extname(clean) ? null : path.join(webRoot, "index.html");
}

function startServer() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(webRoot, "index.html"))) {
      reject(
        new Error(
          `No web build found at ${webRoot}. Run "pnpm --dir apps/mobile build:web" first.`,
        ),
      );
      return;
    }
    const server = http.createServer((request, response) => {
      const file = lookupFile(request.url);
      if (!file) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(file)
        .on("error", () => response.destroy())
        .pipe(response);
    });
    server.once("error", reject);
    server.listen(Number(process.env.MYMUSE_DESKTOP_PORT || DEFAULT_PORT), "127.0.0.1", () =>
      resolve(server),
    );
  });
}

let baseUrl = "";

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 380,
    minHeight: 600,
    backgroundColor: "#FCFCFC",
    title: "MyMuse",
    autoHideMenuBar: process.platform !== "darwin",
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  window.loadURL(`${baseUrl}/`);
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith(baseUrl)) return;
    event.preventDefault();
    if (/^https?:\/\//.test(url)) void shell.openExternal(url);
  });
  return window;
}

app.whenReady().then(async () => {
  try {
    const server = await startServer();
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    createWindow();
  } catch (error) {
    dialog.showErrorBox(
      "MyMuse could not start",
      `${error instanceof Error ? error.message : String(error)}\n\nBuild the web client, then try again.`,
    );
    app.quit();
  }
  app.on("activate", () => {
    if (baseUrl && BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
