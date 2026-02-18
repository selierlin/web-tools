#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');
const outputDir = resolve(repoRoot, 'json');
const outputPath = resolve(outputDir, '更新记录.json');
const limitArg = Number.parseInt(process.argv[2] || '100', 10);
const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : 100;

const separator = '\u001f';
const recordSeparator = '\u001e';
const format = ['%H', '%h', '%aI', '%an', '%s'].join('%x1f') + '%x1e';

const raw = execSync(`git -C "${repoRoot}" log -n ${limit} --pretty=format:${JSON.stringify(format)}`, {
  encoding: 'utf8'
});

const commits = raw
  .split(recordSeparator)
  .map((row) => row.trim())
  .filter(Boolean)
  .map((row) => {
    const [hash, shortHash, date, author, subject] = row.split(separator);
    return {
      hash,
      shortHash,
      date,
      author,
      subject
    };
  });

const payload = {
  generatedAt: new Date().toISOString(),
  total: commits.length,
  commits
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(`Wrote ${commits.length} commits to ${outputPath}`);
