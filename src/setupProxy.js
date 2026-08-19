const { createProxyMiddleware } = require("http-proxy-middleware");

const API_TARGET = process.env.REACT_APP_API_PROXY_TARGET || "http://127.0.0.1:8000";

/**
 * Dev-only proxy: browser calls http://localhost:3000/api/* (same origin),
 * CRA forwards to Laravel at http://127.0.0.1:8000/api/* — no CORS preflight.
 */
module.exports = function setupProxy(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: API_TARGET,
      changeOrigin: true,
      logLevel: process.env.DEBUG_PROXY === "1" ? "debug" : "warn",
    }),
  );
};
