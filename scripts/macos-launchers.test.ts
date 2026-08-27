import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

const launcher = join(process.cwd(), "Gold-Finger.command");
const demoLauncher = join(process.cwd(), "Gold-Finger-Demo.command");
const processTimeout = 10_000;
const testTimeout = 15_000;
const temporaryDirectories: string[] = [];
const projectId = createHash("sha256").update(process.cwd()).digest("hex");

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
  it(
    "reuses only the current project's normal service",
    () => {
      const { binDirectory, directory, env } = createTestEnvironment();
      const openLog = join(directory, "open.log");
      const npmLog = join(directory, "npm.log");
      createFakeCommand(
        binDirectory,
        "curl",
        'case "$*" in\n  *"/api/launcher"*) printf "%s" "$MOCK_SERVICE_IDENTITY"; exit 0 ;;\n  *) exit 0 ;;\nesac',
      );
      createFakeCommand(
        binDirectory,
        "open",
        'printf "%s\\n" "$1" > "$OPEN_LOG"',
      );
      createFakeCommand(binDirectory, "npm", 'touch "$NPM_LOG"');

      const result = spawnSync(launcher, [], {
        encoding: "utf8",
        env: {
          ...env,
          OPEN_LOG: openLog,
          NPM_LOG: npmLog,
          MOCK_SERVICE_IDENTITY: `gold-finger:${projectId}:normal`,
        },
        timeout: processTimeout,
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");
      expect(readFileSync(openLog, "utf8")).toBe("http://localhost:3000\n");
      expect(existsSync(npmLog)).toBe(false);
    },
    testTimeout,
  );

  it("rejects a reachable service from another project directory", () => {
    const { binDirectory, directory, env } = createTestEnvironment();
    const openLog = join(directory, "open.log");
    const npmLog = join(directory, "npm.log");
    createFakeCommand(
      binDirectory,
      "curl",
      'case "$*" in\n  *"/api/launcher"*) printf "gold-finger:old-worktree:normal"; exit 0 ;;\n  *) exit 0 ;;\nesac',
    );
    createFakeCommand(binDirectory, "open", 'touch "$OPEN_LOG"');
    createFakeCommand(binDirectory, "npm", 'touch "$NPM_LOG"');

    const result = spawnSync(launcher, [], {
      encoding: "utf8",
      env: { ...env, OPEN_LOG: openLog, NPM_LOG: npmLog },
      timeout: processTimeout,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("端口 3000 已被其他服务占用");
    expect(existsSync(openLog)).toBe(false);
    expect(existsSync(npmLog)).toBe(false);
  });

  it(
    "starts the development server and opens the page once it becomes reachable",
    () => {
      const { binDirectory, directory, env } = createTestEnvironment();
      const curlState = join(directory, "curl.state");
      const openLog = join(directory, "open.log");
      const npmLog = join(directory, "npm.log");
      createFakeCommand(
        binDirectory,
        "curl",
        'if [ -f "$SERVER_READY" ]; then\n  case "$*" in\n    *"/api/launcher"*) printf "%s" "$MOCK_SERVICE_IDENTITY" ;;\n  esac\n  exit 0\nfi\nexit 1',
      );
      createFakeCommand(
        binDirectory,
        "open",
        'printf "%s\\n" "$1" > "$OPEN_LOG"',
      );
      createFakeCommand(
        binDirectory,
        "npm",
        'printf "%s|%s|%s\\n" "$*" "$GOLD_FINGER_PROJECT_ID" "$GOLD_FINGER_MODE" > "$NPM_LOG"\ntouch "$SERVER_READY"\nsleep 2',
      );

      const result = spawnSync(launcher, [], {
        encoding: "utf8",
        env: {
          ...env,
          OPEN_LOG: openLog,
          NPM_LOG: npmLog,
          SERVER_READY: curlState,
          MOCK_SERVICE_IDENTITY: `gold-finger:${projectId}:normal`,
        },
        timeout: processTimeout,
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");
      expect(readFileSync(npmLog, "utf8")).toBe(
        `run dev|${projectId}|normal\n`,
      );
      expect(readFileSync(openLog, "utf8")).toBe("http://localhost:3000\n");
    },
    testTimeout,
  );
});

describe("Gold-Finger demo launcher", () => {
  it("rejects a normal service running on the demo port", () => {
    const { binDirectory, directory, env } = createTestEnvironment();
    const openLog = join(directory, "open.log");
    const npmLog = join(directory, "npm.log");
    createFakeCommand(
      binDirectory,
      "curl",
      'case "$*" in\n  *"/api/launcher"*) printf "%s" "$MOCK_SERVICE_IDENTITY"; exit 0 ;;\n  *) exit 0 ;;\nesac',
    );
    createFakeCommand(binDirectory, "open", 'touch "$OPEN_LOG"');
    createFakeCommand(binDirectory, "npm", 'touch "$NPM_LOG"');

    const result = spawnSync(demoLauncher, [], {
      encoding: "utf8",
      env: {
        ...env,
        OPEN_LOG: openLog,
        NPM_LOG: npmLog,
        MOCK_SERVICE_IDENTITY: `gold-finger:${projectId}:normal`,
      },
      timeout: processTimeout,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("端口 3001 已被其他服务占用");
    expect(existsSync(openLog)).toBe(false);
    expect(existsSync(npmLog)).toBe(false);
  });

  it(
    "starts the isolated demo command and opens its dedicated port",
    () => {
      const { binDirectory, directory, env } = createTestEnvironment();
      const curlState = join(directory, "curl.state");
      const openLog = join(directory, "open.log");
      const npmLog = join(directory, "npm.log");
      createFakeCommand(
        binDirectory,
        "curl",
        'if [ -f "$SERVER_READY" ]; then\n  case "$*" in\n    *"/api/launcher"*) printf "%s" "$MOCK_SERVICE_IDENTITY" ;;\n  esac\n  exit 0\nfi\nexit 1',
      );
      createFakeCommand(
        binDirectory,
        "open",
        'printf "%s\\n" "$1" > "$OPEN_LOG"',
      );
      createFakeCommand(
        binDirectory,
        "npm",
        'printf "%s|%s|%s\\n" "$*" "$GOLD_FINGER_PROJECT_ID" "$GOLD_FINGER_MODE" > "$NPM_LOG"\ntouch "$SERVER_READY"\nsleep 2',
      );

      const result = spawnSync(demoLauncher, [], {
        encoding: "utf8",
        env: {
          ...env,
          OPEN_LOG: openLog,
          NPM_LOG: npmLog,
          SERVER_READY: curlState,
          MOCK_SERVICE_IDENTITY: `gold-finger:${projectId}:demo`,
        },
        timeout: processTimeout,
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");
      expect(readFileSync(npmLog, "utf8")).toBe(
        `run dev:demo|${projectId}|demo\n`,
      );
      expect(readFileSync(openLog, "utf8")).toBe("http://localhost:3001\n");
    },
    testTimeout,
  );
});
