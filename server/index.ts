import express, { type Request, Response, NextFunction } from "express";
import router from "./routes"; // Changed to import the default router
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { seedDatabase } from "./seed";

const log = (message: string) => {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [express] ${message}`);
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create the HTTP server first so Vite can attach to it
const server = createServer(app);

// Request Logging Middleware
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
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // 1. Seed database with all combinations (BOM, DEL, BLR, JFK)
    log("Initializing database seed...");
    await seedDatabase();
    log("Database seeding complete.");

    // 2. Register all API routes from routes.ts
    app.use(router);

    // 3. Global Error Handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    // 4. Setup Vite for Dev or Serve Static for Production
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      await setupVite(app, server);
    }

    // 5. Start Listening
    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running at http://0.0.0.0:${PORT}`);
    });

  } catch (error) {
    console.error("Critical: Failed to start server:", error);
    process.exit(1);
  }
})();