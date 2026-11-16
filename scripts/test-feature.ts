import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { resolve } from "node:path";
import postgres from "postgres";
import treeKill from "tree-kill";

// Load local settings without replacing CI-provided environment variables.
if (existsSync(".env")) process.loadEnvFile(".env");

const controller = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => controller.abort(new Error(`Interrupted by ${signal}`)));
}

function run(args: string[], env: NodeJS.ProcessEnv) {
  controller.signal.throwIfAborted();
  return new Promise<void>((resolveRun, reject) => {
    const child = spawn(process.execPath, args, { env, stdio: "inherit" });
    const interrupt = () => { if (child.pid) treeKill(child.pid, "SIGTERM"); };
    controller.signal.addEventListener("abort", interrupt, { once: true });
    child.once("error", reject);
    child.once("close", (code, signal) => {
      controller.signal.removeEventListener("abort", interrupt);
      if (code === 0) resolveRun();
      else reject(new Error(`${args.join(" ")} exited ${signal ?? code}`));
    });
  });
}

async function freePort() {
  const server = createServer();
  await new Promise<void>((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No test port assigned");
  await new Promise<void>((resolveClose, reject) => {
    server.close((error) => error ? reject(error) : resolveClose());
  });
  return address.port;
}

async function main() {
  const args = process.argv.slice(2);
  // Discovery must not need PostgreSQL or start an app.
  if (args.includes("--list") || args.includes("--help")) {
    await run(["node_modules/@playwright/test/cli.js", "test", ...args], process.env);
    return;
  }
  const adminUrl = process.env.TEST_DATABASE_ADMIN_URL;
  if (!adminUrl) throw new Error("Set TEST_DATABASE_ADMIN_URL to a PostgreSQL maintenance database with CREATE DATABASE permission (see .env.example).");
  const databaseName = `athleta_test_${randomUUID().replaceAll("-", "")}`;
  const databaseUrl = new URL(adminUrl);
  databaseUrl.pathname = `/${databaseName}`;
  databaseUrl.searchParams.delete("database");
  const admin = postgres(adminUrl, { max: 1, connect_timeout: 10 });
  let created = false;
  try {
    // The only database identifier used for CREATE/DROP is generated here, never supplied by callers.
    await admin.unsafe(`CREATE DATABASE "${databaseName}"`);
    created = true;
    const target = postgres(databaseUrl.toString(), { max: 1 });
    try {
      const [row] = await target`select current_database() as name`;
      if (row.name !== databaseName) throw new Error("Feature database isolation check failed");
    } finally {
      await target.end();
    }
    const port = await freePort();
    const baseURL = `http://127.0.0.1:${port}`;
    const env = {
      ...process.env,
      DATABASE_URL: databaseUrl.toString(),
      PLAYWRIGHT_BASE_URL: baseURL,
      NEXT_TELEMETRY_DISABLED: "1",
    };
    console.log(`Feature database: ${databaseName}; app: ${baseURL}`);
    await run(["--import", "tsx", "scripts/migrate.ts"], env);
    await run(["--import", "tsx", "scripts/seed.ts"], env);
    await run([resolve("node_modules/@playwright/test/cli.js"), "test", ...args], env);
  } finally {
    try {
      if (created) await admin.unsafe(`DROP DATABASE "${databaseName}" WITH (FORCE)`);
    } finally {
      await admin.end();
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
