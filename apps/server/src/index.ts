import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { notFound, errorHandler } from "./middleware/errors";
import auth from "./routes/auth";
import members from "./routes/members";
import groups from "./routes/groups";
import events from "./routes/events";
import connections from "./routes/connections";
import relationships from "./routes/relationships";
import guests from "./routes/guests";

const webDist = path.resolve(__dirname, "../../web/dist");

async function start() {
  await connectDatabase();

  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // app.use((req, res, next) => {
  //   if (req.header("x-forwarded-proto") === "http" && req.path !== "/api/health") {
  //     res.redirect(301, `${env.APP_URL}${req.originalUrl}`);
  //     return;
  //   }
  //   next();
  // });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'", "https://accounts.google.com"],
          upgradeInsecureRequests: env.isProduction ? [] : null,
        },
      },
      hsts: env.isProduction ? { maxAge: 15552000, includeSubDomains: true, preload: true } : false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(cors({ origin: env.APP_URL, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", auth);
  app.use("/api/members", members);
  app.use("/api/groups", groups);
  app.use("/api/events", events);
  app.use("/api/connections", connections);
  app.use("/api/relationships", relationships);
  app.use("/api", guests);

  if (fs.existsSync(path.join(webDist, "index.html"))) {
    app.use(express.static(webDist, { index: false, maxAge: env.isProduction ? "1h" : 0 }));
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api")) return next();
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(webDist, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  const sslKeyPath = path.resolve(__dirname, "../../certs/localhost-key.pem");
  const sslCertPath = path.resolve(__dirname, "../../certs/localhost.pem");
  const hasHttpsConfig = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

  const server = hasHttpsConfig
    ? https.createServer(
        {
          key: fs.readFileSync(sslKeyPath),
          cert: fs.readFileSync(sslCertPath),
        },
        app,
      )
    : app;

  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`Listening on ${env.PORT}`);
    console.log(`Public URL ${env.APP_URL}`);
    console.log(hasHttpsConfig ? "HTTPS enabled with local certificate" : "HTTPS not enabled: missing localhost certificate");
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
