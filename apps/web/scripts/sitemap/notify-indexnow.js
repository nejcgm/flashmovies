/**
 * Submit sitemap page URLs to IndexNow after hosting deploy succeeds.
 * Errors are logged. The process always exits 0 so `deploy:sitemap` does not fail.
 *
 * Skip the POST (still logs batch sizes) with INDEXNOW_DRY_RUN=1 or INDEXNOW_SKIP=1.
 */
import { isIndexNowDryRun, notifyIndexNow } from "./lib/indexnow.js";

function logFailure(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`IndexNow failed (sitemap deploy still succeeds): ${message}`);
}

process.on("uncaughtException", (error) => {
  logFailure(error);
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  logFailure(error);
  process.exit(0);
});

notifyIndexNow({ dryRun: isIndexNowDryRun() })
  .catch((error) => {
    logFailure(error);
  })
  .finally(() => {
    process.exitCode = 0;
  });
