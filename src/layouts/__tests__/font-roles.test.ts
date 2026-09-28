import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The site's type system is four roles. Components name a role, never a
 * typeface, so swapping a face is a one-line change in astro.config.mjs and a
 * stray family can't creep back in on one page.
 */
const ROLE_VARIABLES = ['--font-heading', '--font-body', '--font-ui', '--font-mono'];
/** --font-mono is a system stack defined in BaseLayout, not a loaded web font. */
const WEB_FONT_ROLES = ['--font-heading', '--font-body', '--font-ui'];

const SRC_DIR = fileURLToPath(new URL('../../', import.meta.url));
const CONFIG_PATH = fileURLToPath(new URL('../../../astro.config.mjs', import.meta.url));
const SOURCE_EXTENSIONS = /\.(astro|css|ts|tsx|mjs|js)$/;

interface SourceFile {
  path: string;
  text: string;
}

async function readSourceFiles(): Promise<SourceFile[]> {
  const entries = await readdir(SRC_DIR, { recursive: true });
  const paths = entries
    .filter((entry) => SOURCE_EXTENSIONS.test(entry) && !entry.includes('__tests__'))
    .map((entry) => join(SRC_DIR, entry));
  return Promise.all(
    paths.map(async (path) => ({ path: relative(SRC_DIR, path), text: await readFile(path, 'utf8') })),
  );
}

/** `file: match` for every regex match, so a failure names where to look. */
function findAll(files: SourceFile[], pattern: RegExp): string[] {
  return files.flatMap(({ path, text }) =>
    [...text.matchAll(pattern)].map((m) => `${path}: ${m[1].trim()}`),
  );
}

describe('font roles', () => {
  it('references only the four role variables anywhere in src', async () => {
    const files = await readSourceFiles();

    const offenders = findAll(files, /(--font-[a-z0-9-]+)/g).filter(
      (hit) => !ROLE_VARIABLES.includes(hit.split(': ')[1]),
    );

    expect(offenders).toEqual([]);
  });

  it('sets every CSS font-family through a role variable, never a family name', async () => {
    const files = await readSourceFiles();

    const offenders = findAll(files, /font-family:\s*([^;}]+)/g).filter(
      (hit) => !/^var\(--font-(heading|body|ui|mono)\)$|^inherit$/.test(hit.split(': ')[1]),
    );

    expect(offenders).toEqual([]);
  });

  it('loads exactly one web font per web-font role', async () => {
    const config = await readFile(CONFIG_PATH, 'utf8');

    const declared = [...config.matchAll(/cssVariable:\s*'([^']+)'/g)].map((m) => m[1]);

    expect(declared.sort()).toEqual([...WEB_FONT_ROLES].sort());
  });

  it('gives code blocks the shared mono stack instead of their own list', async () => {
    const config = await readFile(CONFIG_PATH, 'utf8');

    expect(config).toMatch(/codeFontFamily:\s*'var\(--font-mono\)'/);
  });
});
