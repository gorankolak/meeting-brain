import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const functionRoutes = {
  "/api/generate-report": "generate-report.js",
  "/api/send-report-email": "send-report-email.js"
};

async function readRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function netlifyFunctionBridge() {
  const handlerCache = new Map();

  async function loadHandler(fileName) {
    if (handlerCache.has(fileName)) {
      return handlerCache.get(fileName);
    }

    const moduleUrl = pathToFileURL(path.join(projectRoot, "netlify/functions", fileName)).href;
    const module = await import(`${moduleUrl}?t=${Date.now()}`);
    const handler = module.handler || module.default;
    handlerCache.set(fileName, handler);
    return handler;
  }

  return {
    name: "netlify-function-bridge",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = req.url ? new URL(req.url, "http://localhost") : null;
        const route = requestUrl ? functionRoutes[requestUrl.pathname] : null;

        if (!route) {
          next();
          return;
        }

        try {
          console.info(`[dev-api] ${req.method || "GET"} ${requestUrl.pathname}`);
          const handler = await loadHandler(route);
          const body = await readRequestBody(req);
          const result = await handler({
            httpMethod: req.method || "GET",
            headers: req.headers,
            body,
            path: requestUrl.pathname,
            queryStringParameters: Object.fromEntries(requestUrl.searchParams.entries())
          });

          res.statusCode = result?.statusCode || 200;

          for (const [key, value] of Object.entries(result?.headers || {})) {
            res.setHeader(key, value);
          }

          console.info(
            `[dev-api] ${requestUrl.pathname} -> ${result?.statusCode || 200}`
          );
          res.end(result?.body || "");
        } catch (error) {
          server.ssrFixStacktrace(error);
          console.error(`[dev-api] ${requestUrl.pathname} failed`, error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message || "DEV_FUNCTION_BRIDGE_FAILED" }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");

  for (const [key, value] of Object.entries(env)) {
    if (
      key.startsWith("VITE_") ||
      key === "GEMINI_API_KEY" ||
      key === "GEMINI_MODEL" ||
      key === "RESEND_API_KEY" ||
      key === "EMAIL_FROM" ||
      key === "FORCE_FALLBACK"
    ) {
      process.env[key] = value;
    }
  }

  return {
    plugins: [react(), tailwindcss(), netlifyFunctionBridge()],
    server: {
      port: 5173
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            forms: ["react-hook-form", "@hookform/resolvers", "zod"],
            icons: ["lucide-react"]
          }
        }
      }
    }
  };
});
