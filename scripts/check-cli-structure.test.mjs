// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let fixture;
let handler;
let originalHandler;

beforeAll(() => {
  fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-cli-structure-'));
  fs.mkdirSync(path.join(fixture, 'scripts'));
  fs.copyFileSync(
    path.join(repo, 'scripts/check-cli-structure.mjs'),
    path.join(fixture, 'scripts/check-cli-structure.mjs'),
  );
  fs.cpSync(
    path.join(repo, 'packages/cli'),
    path.join(fixture, 'packages/cli'),
    {
      recursive: true,
      filter: source =>
        !['node_modules', 'dist'].includes(path.basename(source)),
    },
  );
  handler = path.join(
    fixture,
    'packages/cli/clients/cli/commands/component/index.mjs',
  );
  originalHandler = fs.readFileSync(handler, 'utf8');
});

afterAll(() => {
  if (fixture && path.dirname(fixture) === path.resolve(os.tmpdir())) {
    fs.rmSync(fixture, {recursive: true, force: true});
  }
});

function check(source = originalHandler) {
  fs.writeFileSync(handler, source);
  const result = spawnSync(
    process.execPath,
    ['scripts/check-cli-structure.mjs'],
    {
      cwd: fixture,
      encoding: 'utf8',
    },
  );
  return {status: result.status, output: result.stdout + result.stderr};
}

describe('CLI structure environment boundaries', () => {
  it('recognizes recorded gaps using native paths on every platform', () => {
    const result = check();
    expect(result.output).toContain('CLI structure is intact');
    expect(result.status).toBe(0);
  });

  it('rejects a new environment import in a recorded file', () => {
    const result = check(
      originalHandler + '\nimport * as http from "node:http";\n',
    );
    expect(result.status).toBe(1);
    expect(result.output).toContain('new environment import (net)');
  });

  it('rejects a stale recorded category instead of silently allowing it', () => {
    const result = check(
      originalHandler.replaceAll(
        'foundation/config/project',
        'foundation/config/other',
      ),
    );
    expect(result.status).toBe(1);
    expect(result.output).toContain('no longer imports project');
  });
});
