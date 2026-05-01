import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesRoot = join(here, '..', 'fixtures');

export async function readFixture(relativePath: string) {
  return readFile(join(fixturesRoot, relativePath), 'utf8');
}

export function normalizeCode(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}
