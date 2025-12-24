import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes"; 
import { setupVite, serveStatic, log } from "./vite"; // Added log from vite helper
import { seedDatabase } from "./seed";

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Request Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let resBody: any = null;

    const resJson = res.json;
    res.json = function (body) {
      resBody = body;
      return resJson.apply(res, arguments as any);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (resBody) {
          logLine += ` :: ${JSON.stringify(resBody)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Register the routes we fixed earlier
  const server = await registerRoutes(app);

  // Seed database on startup
  try {
    await seedDatabase();
  } catch (seedErr) {
    console.error("Seed failed:", seedErr);
  }

  // Error Handling Middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite for development or static serving for production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serves the app on port 5000
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
}

// Start the engine!
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});