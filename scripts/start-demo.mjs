import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "..");
const demoDatabase = resolve(projectDirectory, "data/gold-finger-demo.db");

for (const suffix of ["", "-shm", "-wal"]) {
  rmSync(`${demoDatabase}${suffix}`, { force: true });
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["run", "dev", "--", "--port", "3001"], {
  cwd: projectDirectory,
  env: { ...process.env, GOLD_FINGER_MODE: "demo" },
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
