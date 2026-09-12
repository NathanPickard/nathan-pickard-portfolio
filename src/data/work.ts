/** One role on the work page, rendered as a desktop tab and a mobile accordion item. */
export interface WorkEntry {
  co: string;
  client: string;
  role: string;
  period: string;
  blurb: string;
  stack: string[];
  wins: string[];
}

/** The panel open on first load. Kellton has the richest shipped results, so it leads. */
export const DEFAULT_PANEL_COMPANY = 'Kellton';

export const work: readonly WorkEntry[] = [
  {
    co: 'Harbor ATS',
    client: 'HR / AI startup',
    role: 'Founding Senior Full-Stack Engineer',
    period: 'Mar 2026 – present',
    blurb:
      'Architecting an AI-powered applicant tracking system from the ground up. Engineering human-in-the-loop matching, automated candidate re-engagement, and a real-time analytics engine for hiring funnel health.',
    stack: [],
    wins: [],
  },
  {
    co: 'Kellton',
    client: 'Best Egg (Fintech)',
    role: 'Senior Software Engineer',
    period: '2020 – 2025',
    blurb:
      'Owned offer and refinancing flows across Angular, React, and Vue for a 2M+ user consumer lending platform. The UI work contributed to J.D. Power #1 rankings in 2024 and 2025.',
    stack: [
      'Angular',
      'React',
      'Vue',
      'TypeScript',
      'Node.js',
      'Python',
      'NgRx',
      'Redux',
      'Django',
      'MongoDB',
      'Tailwind',
      'Angular Material',
      'Ansible',
      'Karma',
      'Jasmine',
      'Jest',
    ],
    wins: ['+23% conversion', '$200M originations', 'J.D. Power #1'],
  },
  {
    co: 'Lazarus Naturals',
    client: 'Wellness DTC',
    role: 'Frontend Developer',
    period: '2020',
    blurb:
      "Shipped the company's first native app, launched three new product categories, and modernized the e-commerce storefront during a period of fast expansion.",
    stack: ['React', 'Node.js', 'Wordpress'],
    wins: ['+24% native-app sales', '+32% month-over-month traffic'],
  },
  {
    co: 'Mental Health Match',
    client: 'Healthtech',
    role: 'Angular Developer',
    period: '2019',
    blurb:
      'Worked with the CTO and CEO to rebuild therapist-matching onboarding. Reduced load time 28%, grew therapist signups 31% in three months.',
    stack: ['Angular', 'AWS', 'Firebase'],
    wins: ['+35% conversion', '+31% therapist onboarding', '−28% load time'],
  },
  {
    co: 'Freelance',
    client: '',
    role: 'Web Developer',
    period: '2017 – 2019',
    blurb:
      'Early-stage product work, small-business sites, and internal tools across the JS/TS stack.',
    stack: ['JavaScript', 'Angular', 'Node.js', 'AWS'],
    wins: [],
  },
];
