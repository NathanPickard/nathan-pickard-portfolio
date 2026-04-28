/**
 * Resume data utilities and types.
 */

export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
  profiles?: Array<{ network: string; username?: string; url: string }>;
}

export interface WorkEntry {
  company: string;
  position: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
}

export interface SkillEntry {
  name: string;
  keywords?: string[];
  level?: string;
}

export interface EducationEntry {
  institution: string;
  studyType?: string;
  area?: string;
  startDate?: string;
  endDate?: string;
}

export interface Resume {
  basics?: ResumeBasics;
  work?: WorkEntry[];
  skills?: SkillEntry[];
  education?: EducationEntry[];
}

/**
 * Get email as a mailto: link.
 */
export function getEmailLink(email?: string): string | null {
  return email ? `mailto:${email}` : null;
}

/**
 * Get LinkedIn profile URL from basics.profiles or construct from username.
 */
export function getLinkedInUrl(basics?: ResumeBasics): string | null {
  if (!basics?.profiles) return null;

  const linkedIn = basics.profiles.find((p) => p.network === 'LinkedIn');
  return linkedIn?.url ?? null;
}

/**
 * Get GitHub profile URL from basics.profiles or construct from username.
 */
export function getGitHubUrl(basics?: ResumeBasics): string | null {
  if (!basics?.profiles) return null;

  const github = basics.profiles.find((p) => p.network === 'GitHub');
  return github?.url ?? null;
}

/**
 * Validate that required resume sections exist.
 * Returns true if basics and work are present and non-empty.
 */
export function isValidResume(resume: unknown): resume is Resume {
  if (!resume || typeof resume !== 'object') return false;

  const r = resume as Record<string, unknown>;
  return !!(r.basics && typeof r.basics === 'object' && r.work && Array.isArray(r.work) && r.work.length > 0);
}

/**
 * Get total years of experience from work history.
 * Counts entries with startDate; does not parse dates, just counts positions.
 */
export function countWorkExperience(workHistory?: WorkEntry[]): number {
  if (!workHistory || workHistory.length === 0) return 0;
  return workHistory.filter((w) => w.startDate).length;
}

/**
 * Filter work entries that have ended (have endDate that is not "present").
 */
export function getCompletedPositions(workHistory?: WorkEntry[]): WorkEntry[] {
  if (!workHistory) return [];
  return workHistory.filter((w) => w.endDate && w.endDate.toLowerCase() !== 'present');
}
