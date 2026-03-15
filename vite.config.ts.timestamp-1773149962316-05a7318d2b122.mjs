// vite.config.ts
import { jsxLocPlugin } from "file:///F:/biker-club-updated/node_modules/@builder.io/vite-plugin-jsx-loc/dist/index.js";
import tailwindcss from "file:///F:/biker-club-updated/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///F:/biker-club-updated/node_modules/@vitejs/plugin-react/dist/index.js";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "file:///F:/biker-club-updated/node_modules/vite/dist/node/index.js";
import { vitePluginManusRuntime } from "file:///F:/biker-club-updated/node_modules/vite-plugin-manus-runtime/dist/index.js";
var __vite_injected_original_dirname = "F:\\biker-club-updated";
var PROJECT_ROOT = __vite_injected_original_dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    enforce: "pre",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      const guard = (req, res, next) => {
        const url = req.url || "";
        try {
          decodeURI(url);
          return next();
        } catch {
          res.statusCode = 400;
          res.end("Bad Request");
          return;
        }
      };
      const mw = server.middlewares;
      if (Array.isArray(mw.stack)) {
        mw.stack.unshift({ route: "", handle: guard });
      } else {
        server.middlewares.use(guard);
      }
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "client", "src"),
      "@shared": path.resolve(__vite_injected_original_dirname, "shared"),
      "@assets": path.resolve(__vite_injected_original_dirname, "attached_assets")
    }
  },
  envDir: path.resolve(__vite_injected_original_dirname),
  root: path.resolve(__vite_injected_original_dirname, "client"),
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: false,
    // Will find next available port if 5173 is busy
    host: true,
    proxy: {
      "/api": {
        // Use 127.0.0.1 to avoid Windows dual-stack localhost quirks
        target: "http://127.0.0.1:3001",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true
      }
    },
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxiaWtlci1jbHViLXVwZGF0ZWRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXGJpa2VyLWNsdWItdXBkYXRlZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovYmlrZXItY2x1Yi11cGRhdGVkL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsganN4TG9jUGx1Z2luIH0gZnJvbSBcIkBidWlsZGVyLmlvL3ZpdGUtcGx1Z2luLWpzeC1sb2NcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBmcyBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFBsdWdpbiwgdHlwZSBWaXRlRGV2U2VydmVyIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IHZpdGVQbHVnaW5NYW51c1J1bnRpbWUgfSBmcm9tIFwidml0ZS1wbHVnaW4tbWFudXMtcnVudGltZVwiO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTWFudXMgRGVidWcgQ29sbGVjdG9yIC0gVml0ZSBQbHVnaW5cbi8vIFdyaXRlcyBicm93c2VyIGxvZ3MgZGlyZWN0bHkgdG8gZmlsZXMsIHRyaW1tZWQgd2hlbiBleGNlZWRpbmcgc2l6ZSBsaW1pdFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgUFJPSkVDVF9ST09UID0gaW1wb3J0Lm1ldGEuZGlybmFtZTtcbmNvbnN0IExPR19ESVIgPSBwYXRoLmpvaW4oUFJPSkVDVF9ST09ULCBcIi5tYW51cy1sb2dzXCIpO1xuY29uc3QgTUFYX0xPR19TSVpFX0JZVEVTID0gMSAqIDEwMjQgKiAxMDI0OyAvLyAxTUIgcGVyIGxvZyBmaWxlXG5jb25zdCBUUklNX1RBUkdFVF9CWVRFUyA9IE1hdGguZmxvb3IoTUFYX0xPR19TSVpFX0JZVEVTICogMC42KTsgLy8gVHJpbSB0byA2MCUgdG8gYXZvaWQgY29uc3RhbnQgcmUtdHJpbW1pbmdcblxudHlwZSBMb2dTb3VyY2UgPSBcImJyb3dzZXJDb25zb2xlXCIgfCBcIm5ldHdvcmtSZXF1ZXN0c1wiIHwgXCJzZXNzaW9uUmVwbGF5XCI7XG5cbmZ1bmN0aW9uIGVuc3VyZUxvZ0RpcigpIHtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKExPR19ESVIpKSB7XG4gICAgZnMubWtkaXJTeW5jKExPR19ESVIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyaW1Mb2dGaWxlKGxvZ1BhdGg6IHN0cmluZywgbWF4U2l6ZTogbnVtYmVyKSB7XG4gIHRyeSB7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGxvZ1BhdGgpIHx8IGZzLnN0YXRTeW5jKGxvZ1BhdGgpLnNpemUgPD0gbWF4U2l6ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxpbmVzID0gZnMucmVhZEZpbGVTeW5jKGxvZ1BhdGgsIFwidXRmLThcIikuc3BsaXQoXCJcXG5cIik7XG4gICAgY29uc3Qga2VwdExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBrZXB0Qnl0ZXMgPSAwO1xuXG4gICAgLy8gS2VlcCBuZXdlc3QgbGluZXMgKGZyb20gZW5kKSB0aGF0IGZpdCB3aXRoaW4gNjAlIG9mIG1heFNpemVcbiAgICBjb25zdCB0YXJnZXRTaXplID0gVFJJTV9UQVJHRVRfQllURVM7XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBsaW5lQnl0ZXMgPSBCdWZmZXIuYnl0ZUxlbmd0aChgJHtsaW5lc1tpXX1cXG5gLCBcInV0Zi04XCIpO1xuICAgICAgaWYgKGtlcHRCeXRlcyArIGxpbmVCeXRlcyA+IHRhcmdldFNpemUpIGJyZWFrO1xuICAgICAga2VwdExpbmVzLnVuc2hpZnQobGluZXNbaV0pO1xuICAgICAga2VwdEJ5dGVzICs9IGxpbmVCeXRlcztcbiAgICB9XG5cbiAgICBmcy53cml0ZUZpbGVTeW5jKGxvZ1BhdGgsIGtlcHRMaW5lcy5qb2luKFwiXFxuXCIpLCBcInV0Zi04XCIpO1xuICB9IGNhdGNoIHtcbiAgICAvKiBpZ25vcmUgdHJpbSBlcnJvcnMgKi9cbiAgfVxufVxuXG5mdW5jdGlvbiB3cml0ZVRvTG9nRmlsZShzb3VyY2U6IExvZ1NvdXJjZSwgZW50cmllczogdW5rbm93bltdKSB7XG4gIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gIGVuc3VyZUxvZ0RpcigpO1xuICBjb25zdCBsb2dQYXRoID0gcGF0aC5qb2luKExPR19ESVIsIGAke3NvdXJjZX0ubG9nYCk7XG5cbiAgLy8gRm9ybWF0IGVudHJpZXMgd2l0aCB0aW1lc3RhbXBzXG4gIGNvbnN0IGxpbmVzID0gZW50cmllcy5tYXAoKGVudHJ5KSA9PiB7XG4gICAgY29uc3QgdHMgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgcmV0dXJuIGBbJHt0c31dICR7SlNPTi5zdHJpbmdpZnkoZW50cnkpfWA7XG4gIH0pO1xuXG4gIC8vIEFwcGVuZCB0byBsb2cgZmlsZVxuICBmcy5hcHBlbmRGaWxlU3luYyhsb2dQYXRoLCBgJHtsaW5lcy5qb2luKFwiXFxuXCIpfVxcbmAsIFwidXRmLThcIik7XG5cbiAgLy8gVHJpbSBpZiBleGNlZWRzIG1heCBzaXplXG4gIHRyaW1Mb2dGaWxlKGxvZ1BhdGgsIE1BWF9MT0dfU0laRV9CWVRFUyk7XG59XG5cbi8qKlxuICogVml0ZSBwbHVnaW4gdG8gY29sbGVjdCBicm93c2VyIGRlYnVnIGxvZ3NcbiAqIC0gUE9TVCAvX19tYW51c19fL2xvZ3M6IEJyb3dzZXIgc2VuZHMgbG9ncywgd3JpdHRlbiBkaXJlY3RseSB0byBmaWxlc1xuICogLSBGaWxlczogYnJvd3NlckNvbnNvbGUubG9nLCBuZXR3b3JrUmVxdWVzdHMubG9nLCBzZXNzaW9uUmVwbGF5LmxvZ1xuICogLSBBdXRvLXRyaW1tZWQgd2hlbiBleGNlZWRpbmcgMU1CIChrZWVwcyBuZXdlc3QgZW50cmllcylcbiAqL1xuZnVuY3Rpb24gdml0ZVBsdWdpbk1hbnVzRGVidWdDb2xsZWN0b3IoKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcIm1hbnVzLWRlYnVnLWNvbGxlY3RvclwiLFxuICAgIGVuZm9yY2U6IFwicHJlXCIsXG5cbiAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGh0bWwsXG4gICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0YWc6IFwic2NyaXB0XCIsXG4gICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICBzcmM6IFwiL19fbWFudXNfXy9kZWJ1Zy1jb2xsZWN0b3IuanNcIixcbiAgICAgICAgICAgICAgZGVmZXI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW5qZWN0VG86IFwiaGVhZFwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBWaXRlRGV2U2VydmVyKSB7XG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIEd1YXJkIGFnYWluc3QgbWFsZm9ybWVkIFVSTHMgKGUuZy4gc3RyYXkgJyUnIGZyb20gZXh0ZW5zaW9ucyAvIGRldnRvb2xzKVxuICAgICAgLy8gVml0ZSdzIGludGVybmFsIG1pZGRsZXdhcmVzIGNhbGwgZGVjb2RlVVJJKHJlcS51cmwpIGFuZCB3aWxsIHRocm93LlxuICAgICAgLy8gUmV0dXJuaW5nIDQwMCBoZXJlIHByZXZlbnRzIHRoZSBzY2FyeSByZWQgb3ZlcmxheS5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgY29uc3QgZ3VhcmQgPSAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gcmVxLnVybCB8fCBcIlwiO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRlY29kZVVSSSh1cmwpO1xuICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xuICAgICAgICAgIHJlcy5lbmQoXCJCYWQgUmVxdWVzdFwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIElNUE9SVEFOVDogYWRkIHRoZSBndWFyZCB0byB0aGUgKmJlZ2lubmluZyogb2YgQ29ubmVjdCBzdGFjayBzbyBpdCBydW5zXG4gICAgICAvLyBiZWZvcmUgVml0ZSdzIGludGVybmFsIHRyYW5zZm9ybSBtaWRkbGV3YXJlLlxuICAgICAgY29uc3QgbXc6IGFueSA9IHNlcnZlci5taWRkbGV3YXJlcyBhcyBhbnk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShtdy5zdGFjaykpIHtcbiAgICAgICAgbXcuc3RhY2sudW5zaGlmdCh7IHJvdXRlOiBcIlwiLCBoYW5kbGU6IGd1YXJkIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShndWFyZCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBPU1QgL19fbWFudXNfXy9sb2dzOiBCcm93c2VyIHNlbmRzIGxvZ3MgKHdyaXR0ZW4gZGlyZWN0bHkgdG8gZmlsZXMpXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKFwiL19fbWFudXNfXy9sb2dzXCIsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gXCJQT1NUXCIpIHtcbiAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGFuZGxlUGF5bG9hZCA9IChwYXlsb2FkOiBhbnkpID0+IHtcbiAgICAgICAgICAvLyBXcml0ZSBsb2dzIGRpcmVjdGx5IHRvIGZpbGVzXG4gICAgICAgICAgaWYgKHBheWxvYWQuY29uc29sZUxvZ3M/Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHdyaXRlVG9Mb2dGaWxlKFwiYnJvd3NlckNvbnNvbGVcIiwgcGF5bG9hZC5jb25zb2xlTG9ncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYXlsb2FkLm5ldHdvcmtSZXF1ZXN0cz8ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgd3JpdGVUb0xvZ0ZpbGUoXCJuZXR3b3JrUmVxdWVzdHNcIiwgcGF5bG9hZC5uZXR3b3JrUmVxdWVzdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGF5bG9hZC5zZXNzaW9uRXZlbnRzPy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB3cml0ZVRvTG9nRmlsZShcInNlc3Npb25SZXBsYXlcIiwgcGF5bG9hZC5zZXNzaW9uRXZlbnRzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9KTtcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogdHJ1ZSB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcmVxQm9keSA9IChyZXEgYXMgeyBib2R5PzogdW5rbm93biB9KS5ib2R5O1xuICAgICAgICBpZiAocmVxQm9keSAmJiB0eXBlb2YgcmVxQm9keSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVQYXlsb2FkKHJlcUJvZHkpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0pO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogU3RyaW5nKGUpIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvZHkgPSBcIlwiO1xuICAgICAgICByZXEub24oXCJkYXRhXCIsIChjaHVuaykgPT4ge1xuICAgICAgICAgIGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLm9uKFwiZW5kXCIsICgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgICAgICAgICBoYW5kbGVQYXlsb2FkKHBheWxvYWQpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0pO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogU3RyaW5nKGUpIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuY29uc3QgcGx1Z2lucyA9IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpLCBqc3hMb2NQbHVnaW4oKSwgdml0ZVBsdWdpbk1hbnVzUnVudGltZSgpLCB2aXRlUGx1Z2luTWFudXNEZWJ1Z0NvbGxlY3RvcigpXTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2lucyxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsIFwiY2xpZW50XCIsIFwic3JjXCIpLFxuICAgICAgXCJAc2hhcmVkXCI6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCBcInNoYXJlZFwiKSxcbiAgICAgIFwiQGFzc2V0c1wiOiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgXCJhdHRhY2hlZF9hc3NldHNcIiksXG4gICAgfSxcbiAgfSxcbiAgZW52RGlyOiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSksXG4gIHJvb3Q6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCBcImNsaWVudFwiKSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCBcImRpc3QvcHVibGljXCIpLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLCAvLyBXaWxsIGZpbmQgbmV4dCBhdmFpbGFibGUgcG9ydCBpZiA1MTczIGlzIGJ1c3lcbiAgICBob3N0OiB0cnVlLFxuICAgIHByb3h5OiB7XG4gICAgICBcIi9hcGlcIjoge1xuICAgICAgICAvLyBVc2UgMTI3LjAuMC4xIHRvIGF2b2lkIFdpbmRvd3MgZHVhbC1zdGFjayBsb2NhbGhvc3QgcXVpcmtzXG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vMTI3LjAuMC4xOjMwMDFcIixcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIFwiL3VwbG9hZHNcIjoge1xuICAgICAgICB0YXJnZXQ6IFwiaHR0cDovLzEyNy4wLjAuMTozMDAxXCIsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhbGxvd2VkSG9zdHM6IFtcbiAgICAgIFwiLm1hbnVzcHJlLmNvbXB1dGVyXCIsXG4gICAgICBcIi5tYW51cy5jb21wdXRlclwiLFxuICAgICAgXCIubWFudXMtYXNpYS5jb21wdXRlclwiLFxuICAgICAgXCIubWFudXNjb21wdXRlci5haVwiLFxuICAgICAgXCIubWFudXN2bS5jb21wdXRlclwiLFxuICAgICAgXCJsb2NhbGhvc3RcIixcbiAgICAgIFwiMTI3LjAuMC4xXCIsXG4gICAgXSxcbiAgICBmczoge1xuICAgICAgc3RyaWN0OiB0cnVlLFxuICAgICAgZGVueTogW1wiKiovLipcIl0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxUCxTQUFTLG9CQUFvQjtBQUNsUixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQXFEO0FBQzlELFNBQVMsOEJBQThCO0FBTnZDLElBQU0sbUNBQW1DO0FBYXpDLElBQU0sZUFBZTtBQUNyQixJQUFNLFVBQVUsS0FBSyxLQUFLLGNBQWMsYUFBYTtBQUNyRCxJQUFNLHFCQUFxQixJQUFJLE9BQU87QUFDdEMsSUFBTSxvQkFBb0IsS0FBSyxNQUFNLHFCQUFxQixHQUFHO0FBSTdELFNBQVMsZUFBZTtBQUN0QixNQUFJLENBQUMsR0FBRyxXQUFXLE9BQU8sR0FBRztB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
