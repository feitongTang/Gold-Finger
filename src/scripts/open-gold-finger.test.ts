import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

const launcher = join(process.cwd(), "启动 Gold-Finger.command");
const demoLauncher = join(process.cwd(), "Gold-Finger-Demo.command");
const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createFakeCommand(directory: string, name: string, body: string) {
  const command = join(directory, name);
  writeFileSync(command, `#!/bin/sh\n${body}\n`);
  chmodSync(command, 0o755);
}

function createTestEnvironment() {
  const directory = mkdtempSync(join(tmpdir(), "gold-finger-launcher-"));
  temporaryDirectories.push(directory);
  const binDirectory = join(directory, "bin");
  const result = spawnSync("mkdir", ["-p", binDirectory]);
  if (result.status !== 0)
    throw new Error("Failed to create fake bin directory");

  return {
    binDirectory,
    directory,
    env: {
      ...process.env,
      PATH: `${binDirectory}:/usr/bin:/bin`,
    },
  };
}

describe("Gold-Finger launcher", () => {
  it("opens the home page without starting another server when it is already reachable", () => {
    const { binDirectory, directory, env } = createTestEnvironment();
    const openLog = join(directory, "open.log");
    const npmLog = join(directory, "npm.log");
    createFakeCommand(binDirectory, "curl", "exit 0");
    createFakeCommand(
      binDirectory,
      "open",
      'printf "%s\\n" "$1" > "$OPEN_LOG"',
    );
    createFakeCommand(binDirectory, "npm", 'touch "$NPM_LOG"');

    const result = spawnSync(launcher, [], {
      encoding: "utf8",
      env: { ...env, OPEN_LOG: openLog, NPM_LOG: npmLog },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(readFileSync(openLog, "utf8")).toBe("http://localhost:3000\n");
    expect(existsSync(npmLog)).toBe(false);
  });

  it("starts the development server and opens the page once it becomes reachable", () => {
    const { binDirectory, directory, env } = createTestEnvironment();
    const curlState = join(directory, "curl.state");
    const openLog = join(directory, "open.log");
    const npmLog = join(directory, "npm.log");
    createFakeCommand(
      binDirectory,
      "curl",
      '[ -f "$CURL_STATE" ] && exit 0\ntouch "$CURL_STATE"\nexit 1',
    );
    createFakeCommand(
      binDirectory,
      "open",
      'printf "%s\\n" "$1" > "$OPEN_LOG"',
    );
    createFakeCommand(
      binDirectory,
      "npm",
      'printf "%s\\n" "$*" > "$NPM_LOG"\nsleep 2',
    );

    const result = spawnSync(launcher, [], {
      encoding: "utf8",
      env: {
        ...env,
        CURL_STATE: curlState,
        OPEN_LOG: openLog,
        NPM_LOG: npmLog,
      },
      timeout: 5_000,
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(readFileSync(npmLog, "utf8")).toBe("run dev\n");
    expect(readFileSync(openLog, "utf8")).toBe("http://localhost:3000\n");
  });
});

describe("Gold-Finger demo launcher", () => {
  it("starts the isolated demo command and opens its dedicated port", () => {
    const { binDirectory, directory, env } = createTestEnvironment();
    const curlState = join(directory, "curl.state");
    const openLog = join(directory, "open.log");
    const npmLog = join(directory, "npm.log");
    createFakeCommand(
      binDirectory,
      "curl",
      '[ -f "$CURL_STATE" ] && exit 0\ntouch "$CURL_STATE"\nexit 1',
    );
    createFakeCommand(
      binDirectory,
      "open",
      'printf "%s\\n" "$1" > "$OPEN_LOG"',
    );
    createFakeCommand(
      binDirectory,
      "npm",
      'printf "%s\\n" "$*" > "$NPM_LOG"\nsleep 2',
    );

    const result = spawnSync(demoLauncher, [], {
      encoding: "utf8",
      env: {
        ...env,
        CURL_STATE: curlState,
        OPEN_LOG: openLog,
        NPM_LOG: npmLog,
      },
      timeout: 5_000,
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(readFileSync(npmLog, "utf8")).toBe("run dev:demo\n");
    expect(readFileSync(openLog, "utf8")).toBe("http://localhost:3001\n");
  });
});
