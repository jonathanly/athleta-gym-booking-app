import { closeDb } from "../src/lib/db";
import { seedDemo } from "../src/lib/seed";

async function main() {
  try {
    const seeded = await seedDemo();
    console.log(seeded
      ? "Fictional local demo seeded. admin@athleta.local / member@athleta.local — password: AthletaDemo123! (local demo only)."
      : "Database is not empty; demo seed skipped without changing existing data.");
  } finally {
    await closeDb();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
