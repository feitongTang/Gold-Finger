import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

const sourceScript = join(process.cwd(), "scripts/start-demo.mjs");
const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

describe("demo start command", () => {
  it("resets only the demo database and starts Next in demo mode on port 3001", () => {
    const projectDirectory = mkdtempSync(join(tmpdir(), "gold-finger-demo-"));
    temporaryDirectories.push(projectDirectory);
    const scriptDirectory = join(projectDirectory, "scripts");
    const binDirectory = join(projectDirectory, "bin");
    const dataDirectory = join(projectDirectory, "data");
    mkdirSync(scriptDirectory, { recursive: true });
    mkdirSync(binDirectory);
    mkdirSync(dataDirectory);
    cpSync(sourceScript, join(scriptDirectory, "start-demo.mjs"));

    const demoDatabase = join(dataDirectory, "gold-finger-demo.db");
    const personalDatabase = join(dataDirectory, "gold-finger.db");
    writeFileSync(demoDatabase, "old demo data");
    writeFileSync(`${demoDatabase}-wal`, "old demo journal");
    writeFileSync(personalDatabase, "personal data");

    const npmLog = join(projectDirectory, "npm.log");
    const fakeNpm = join(binDirectory, "npm");
    writeFileSync(
      fakeNpm,
      '#!/bin/sh\nprintf "%s|%s\\n" "$*" "$GOLD_FINGER_MODE" > "$NPM_LOG"\n',
    );
    chmodSync(fakeNpm, 0o755);

    const result = spawnSync(
      process.execPath,
      [join(scriptDirectory, "start-demo.mjs")],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${binDirectory}:/usr/bin:/bin`,
          NPM_LOG: npmLog,
        },
      },
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(readFileSync(npmLog, "utf8")).toBe("run dev -- --port 3001|demo\n");
    expect(existsSync(demoDatabase)).toBe(false);
    expect(existsSync(`${demoDatabase}-wal`)).toBe(false);
    expect(readFileSync(personalDatabase, "utf8")).toBe("personal data");
  });
});
