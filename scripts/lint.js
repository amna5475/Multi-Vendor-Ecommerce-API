#!/usr/bin/env node
/**
 * Lightweight syntax lint for CI without a heavy ESLint setup.
 * Fails if any scanned file has invalid JavaScript syntax.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const TARGET_DIRS = [
  'adapters',
  'config',
  'controllers',
  'helpers',
  'middleware',
  'models',
  'routes',
  'services',
  'scripts',
  'tests'
];
const TARGET_FILES = ['app.js'];

const collectJsFiles = (dirPath, acc = []) => {
  if (!fs.existsSync(dirPath)) return acc;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectJsFiles(fullPath, acc);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      acc.push(fullPath);
    }
  }
  return acc;
};

const files = [
  ...TARGET_FILES.map((file) => path.join(ROOT, file)),
  ...TARGET_DIRS.flatMap((dir) => collectJsFiles(path.join(ROOT, dir)))
];

let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed += 1;
    process.stderr.write(`Syntax error in ${path.relative(ROOT, file)}\n`);
    if (result.stderr) process.stderr.write(result.stderr);
  }
}

if (failed > 0) {
  process.stderr.write(`\nLint failed: ${failed} file(s) have syntax errors.\n`);
  process.exit(1);
}

process.stdout.write(`Lint passed: ${files.length} JavaScript file(s) checked.\n`);
