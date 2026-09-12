import { describe, expect, it } from 'vitest';
import { DEFAULT_PANEL_COMPANY, work } from '../work';

describe('work history data', () => {
  it('lists every role with the fields the work page renders', () => {
    expect(work.length).toBeGreaterThan(0);

    for (const entry of work) {
      expect(entry.co).not.toBe('');
      expect(entry.role).not.toBe('');
      expect(entry.period).not.toBe('');
      expect(entry.blurb).not.toBe('');
      expect(Array.isArray(entry.stack)).toBe(true);
      expect(Array.isArray(entry.wins)).toBe(true);
    }
  });

  it('keeps the roles in reverse chronological order', () => {
    expect(work.map((w) => w.co)).toEqual([
      'Harbor ATS',
      'Kellton',
      'Lazarus Naturals',
      'Mental Health Match',
      'Freelance',
    ]);
  });

  it('names a default panel company that exists in the data', () => {
    expect(work.some((w) => w.co === DEFAULT_PANEL_COMPANY)).toBe(true);
  });
});
