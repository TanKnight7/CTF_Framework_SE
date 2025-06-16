import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { DateTime } from "luxon";
import fs from "fs";
import yaml from "js-yaml";

const config = () => {
  try {
    const file = fs.readFileSync("/app/config.yml", "utf8");
    const config = yaml.load(file);

    const baseZone = config.ctf.time_zone || "UTC";
    const targetZone = config.ctf.convert_to_time_zone || "UTC";

    const parseTime = (value: string) =>
      DateTime.fromFormat(value, "dd-mm-yyyy HH:mm", {
        zone: baseZone,
        setZone: true,
      });

    config.ctf.start_time = parseTime(config.ctf.start_time)
      .setZone(targetZone)
      .toFormat("dd LLL yyyy HH:mm");

    config.ctf.end_time = parseTime(config.ctf.end_time)
      .setZone(targetZone)
      .toFormat("dd LLL yyyy HH:mm");

    return config;
  } catch (e) {
    console.error("Error while reading /app/config.yml");
    throw e;
  }
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/config/ctf", (req, res) => {
  res.json(config().ctf);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 80;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
