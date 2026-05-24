import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./services/admin-bootstrap.js";

const withStartupTimeout = async <T>(task: Promise<T>, timeoutMs: number) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      reject(
        new Error(
          "Database is not reachable. Start the development database before running the backend.",
        ),
      );
    }, timeoutMs);
  });

  return Promise.race([task, timeoutPromise]).finally(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
};

const startServer = async () => {
  await withStartupTimeout(ensureAdminUser(), 7000);

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Accounting and Books System is running on http://localhost:${env.port}`);
  });
};

startServer().catch((error: unknown) => {
  if (
    error instanceof Error &&
    (error.message.includes("Database is not reachable") ||
      error.message.includes("ECONNREFUSED"))
  ) {
    console.error(
      [
        "Failed to initialize the server: the database is not reachable.",
        "Start the development database first:",
        '  cd "C:\\Users\\Navid\\Desktop\\Accounting and Invoicing System"',
        "  npm run dev:db",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.error("Failed to initialize the server.", error);
  process.exit(1);
});
