import { onRequest } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";
import prerender from "prerender-node";
import express from "express";
import path from "path";

const app = express();

prerender.set("prerenderToken", "");

app.use(prerender);

app.use(express.static(path.join(process.cwd(), "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "../dist/index.html"), (err) => {
    if (err) {
      logger.error("Error serving index.html:", err);
      res.status(404).send("Not Found");
    }
  });
});

export const appSSR = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  app
);

export const health = onRequest((req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    prerenderEnabled: true,
  });
});
