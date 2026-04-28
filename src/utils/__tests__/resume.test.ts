/**
 * Tests for resume data utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  getEmailLink,
  getLinkedInUrl,
  getGitHubUrl,
  isValidResume,
  countWorkExperience,
  getCompletedPositions,
  type Resume,
  type WorkEntry,
} from '../resume';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validResume: Resume = {
  basics: {
    name: 'Test User',
    label: 'Engineer',
    email: 'test@example.com',
    location: 'Portland, OR',
    profiles: [
      { network: 'GitHub', username: 'testuser', url: 'https://github.com/testuser' },
      { network: 'LinkedIn', username: 'testuser', url: 'https://www.linkedin.com/in/testuser' },
    ],
  },
  work: [
    {
      company: 'Company A',
      position: 'Senior Engineer',
      startDate: 'Jan 2020',
      endDate: 'Dec 2024',
    },
    {
      company: 'Company B',
      position: 'Engineer',
      startDate: 'Jan 2019',
      endDate: 'Dec 2019',
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resume utilities', () => {
  describe('getEmailLink', () => {
    it('returns mailto: link for valid email', () => {
      const result = getEmailLink('nathan@example.com');
      expect(result).toBe('mailto:nathan@example.com');
    });

    it('returns null for undefined email', () => {
      const result = getEmailLink(undefined);
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getEmailLink('');
      expect(result).toBeNull();
    });

    it('handles email with special characters', () => {
      const result = getEmailLink('nathan+tag@example.co.uk');
      expect(result).toBe('mailto:nathan+tag@example.co.uk');
    });
  });

  describe('getLinkedInUrl', () => {
    it('returns LinkedIn URL from profiles', () => {
      const result = getLinkedInUrl(validResume.basics);
      expect(result).toBe('https://www.linkedin.com/in/testuser');
    });

    it('returns null if no profiles', () => {
      const basics = { name: 'Test', label: 'Engineer', email: 'test@example.com' };
      const result = getLinkedInUrl(basics);
      expect(result).toBeNull();
    });

    it('returns null if LinkedIn not in profiles', () => {
      const basics = {
        name: 'Test',
        label: 'Engineer',
        email: 'test@example.com',
        profiles: [{ network: 'GitHub', url: 'https://github.com/testuser' }],
      };
      const result = getLinkedInUrl(basics);
      expect(result).toBeNull();
    });

    it('returns null if basics is undefined', () => {
      const result = getLinkedInUrl(undefined);
      expect(result).toBeNull();
    });
  });

  describe('getGitHubUrl', () => {
    it('returns GitHub URL from profiles', () => {
      const result = getGitHubUrl(validResume.basics);
      expect(result).toBe('https://github.com/testuser');
    });

    it('returns null if no profiles', () => {
      const basics = { name: 'Test', label: 'Engineer', email: 'test@example.com' };
      const result = getGitHubUrl(basics);
      expect(result).toBeNull();
    });

    it('returns null if GitHub not in profiles', () => {
      const basics = {
        name: 'Test',
        label: 'Engineer',
        email: 'test@example.com',
        profiles: [{ network: 'LinkedIn', url: 'https://www.linkedin.com/in/testuser' }],
      };
      const result = getGitHubUrl(basics);
      expect(result).toBeNull();
    });

    it('returns null if basics is undefined', () => {
      const result = getGitHubUrl(undefined);
      expect(result).toBeNull();
    });
  });

  describe('isValidResume', () => {
    it('returns true for valid resume', () => {
      const result = isValidResume(validResume);
      expect(result).toBe(true);
    });

    it('returns false if basics is missing', () => {
      const resume = { work: [{ company: 'A', position: 'B' }] };
      const result = isValidResume(resume);
      expect(result).toBe(false);
    });

    it('returns false if work is missing', () => {
      const resume = {
        basics: { name: 'Test', label: 'Engineer', email: 'test@example.com' },
      };
      const result = isValidResume(resume);
      expect(result).toBe(false);
    });

    it('returns false if work is empty array', () => {
      const resume = {
        basics: { name: 'Test', label: 'Engineer', email: 'test@example.com' },
        work: [],
      };
      const result = isValidResume(resume);
      expect(result).toBe(false);
    });

    it('returns false if not an object', () => {
      expect(isValidResume(null)).toBe(false);
      expect(isValidResume(undefined)).toBe(false);
      expect(isValidResume('string')).toBe(false);
      expect(isValidResume(123)).toBe(false);
    });

    it('returns false if basics is not an object', () => {
      const resume = {
        basics: 'not an object',
        work: [{ company: 'A', position: 'B' }],
      };
      const result = isValidResume(resume);
      expect(result).toBe(false);
    });

    it('returns false if work is not an array', () => {
      const resume = {
        basics: { name: 'Test', label: 'Engineer', email: 'test@example.com' },
        work: 'not an array',
      };
      const result = isValidResume(resume);
      expect(result).toBe(false);
    });
  });

  describe('countWorkExperience', () => {
    it('counts work entries with startDate', () => {
      const result = countWorkExperience(validResume.work);
      expect(result).toBe(2);
    });

    it('returns 0 for undefined work', () => {
      const result = countWorkExperience(undefined);
      expect(result).toBe(0);
    });

    it('returns 0 for empty array', () => {
      const result = countWorkExperience([]);
      expect(result).toBe(0);
    });

    it('ignores entries without startDate', () => {
      const work: WorkEntry[] = [
        { company: 'A', position: 'Senior', startDate: 'Jan 2020' },
        { company: 'B', position: 'Junior' }, // no startDate
        { company: 'C', position: 'Mid' }, // no startDate
      ];

      const result = countWorkExperience(work);
      expect(result).toBe(1);
    });
  });

  describe('getCompletedPositions', () => {
    it('filters positions with endDate that is not "present"', () => {
      const result = getCompletedPositions(validResume.work);
      expect(result).toHaveLength(2);
    });

    it('excludes positions with endDate "present"', () => {
      const work: WorkEntry[] = [
        { company: 'A', position: 'Senior', startDate: 'Jan 2020', endDate: 'Dec 2024' },
        { company: 'B', position: 'Junior', startDate: 'Jan 2019', endDate: 'present' },
      ];

      const result = getCompletedPositions(work);
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('A');
    });

    it('excludes positions without endDate', () => {
      const work: WorkEntry[] = [
        { company: 'A', position: 'Senior', startDate: 'Jan 2020', endDate: 'Dec 2024' },
        { company: 'B', position: 'Junior', startDate: 'Jan 2019' }, // no endDate
      ];

      const result = getCompletedPositions(work);
      expect(result).toHaveLength(1);
    });

    it('returns empty array for undefined work', () => {
      const result = getCompletedPositions(undefined);
      expect(result).toHaveLength(0);
    });

    it('returns empty array if all positions are ongoing ("present")', () => {
      const work: WorkEntry[] = [
        { company: 'A', position: 'Senior', startDate: 'Jan 2020', endDate: 'present' },
        { company: 'B', position: 'Junior', startDate: 'Jan 2019', endDate: 'present' },
      ];

      const result = getCompletedPositions(work);
      expect(result).toHaveLength(0);
    });

    it('handles case-insensitive "present" matching', () => {
      const work: WorkEntry[] = [
        { company: 'A', position: 'Senior', startDate: 'Jan 2020', endDate: 'Present' },
        { company: 'B', position: 'Junior', startDate: 'Jan 2019', endDate: 'PRESENT' },
        { company: 'C', position: 'Mid', startDate: 'Jan 2018', endDate: 'Dec 2024' },
      ];

      const result = getCompletedPositions(work);
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('C');
    });
  });
});
