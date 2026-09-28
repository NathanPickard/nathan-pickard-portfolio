import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

async function astroFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return entryIsTestDir(entry.name) ? [] : astroFiles(path);
      return path.endsWith('.astro') ? [path] : [];
    }),
  );
  return nested.flat();
}

function entryIsTestDir(name: string): boolean {
  return name === '__tests__' || name === 'node_modules';
}

/** `selector { body }` pairs from every <style> block, comments removed. */
function cssRules(source: string): { selector: string; body: string }[] {
  const styles = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1].replace(/\/\*[\s\S]*?\*\//g, ''))
    .join('\n');
  return [...styles.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    body: m[2],
  }));
}

describe('hover states', () => {
  // Interactive states should raise contrast. Fading the hovered element
  // itself lowers it. Fading a child (e.g. swapping icons) is fine, so only
  // selectors that end at the hovered element are checked.
  it('never lowers the opacity of the hovered element', async () => {
    const offenders: string[] = [];

    for (const file of await astroFiles(SRC_DIR)) {
      for (const { selector, body } of cssRules(await readFile(file, 'utf8'))) {
        const endsAtHovered = selector
          .split(',')
          .some((part) => /:hover\)?\s*$/.test(part.trim()));
        const fades = /(^|[;\s])opacity:\s*0?\.\d+/.test(body);
        if (endsAtHovered && fades) offenders.push(`${relative(SRC_DIR, file)}: ${selector}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
