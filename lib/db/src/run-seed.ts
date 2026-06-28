
import { seedAdmin } from "./seed.js";

async function main() {
  await seedAdmin();
  process.exit(0);
}

main();
