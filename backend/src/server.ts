import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./services/admin-bootstrap.js";

const startServer = async () => {
  await ensureAdminUser();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Accounting and Books System is running on http://localhost:${env.port}`);
  });
};

startServer().catch((error: unknown) => {
  console.error("Failed to initialize the server.", error);
  process.exit(1);
});
