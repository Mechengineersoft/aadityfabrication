import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const PgStore = connectPgSimple(session);

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgStore({ pool }),
    secret: process.env.SESSION_SECRET ?? "fallback-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  }),
);

app.use("/api", router);

// Serve static files from the frontend build
const staticPath = path.resolve(import.meta.dirname, "../../aaditya-fab/dist/public");
app.use(express.static(staticPath));

// For SPA routing: serve index.html for any route that doesn't match an API or static file
app.get("*", (req, res) => {
  const indexPath = path.join(staticPath, "index.html");
  res.sendFile(indexPath);
});

export default app;
