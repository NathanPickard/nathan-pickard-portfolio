/**
 * Social profile links rendered by the site header and footer.
 *
 * `invert` flips a dark brand icon to white so it reads on the dark theme.
 * `hoverIcon` swaps in a full-color brand icon on hover (see SocialLinks.astro).
 */
export interface Social {
  label: string;
  href: string;
  icon: string;
  hoverIcon?: string;
  invert: boolean;
}

export const SOCIAL_PROFILES: readonly Social[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/nathanpickard',
    icon: 'devicon:github',
    invert: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/nathanpickard/',
    icon: 'mdi:linkedin',
    hoverIcon: 'devicon:linkedin',
    invert: false,
  },
  {
    label: 'Bluesky',
    href: 'https://bsky.app/profile/nathanpickard.bsky.social',
    icon: 'bluesky',
    invert: false,
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/NathanPickard',
    icon: 'devicon:twitter',
    invert: true,
  },
];

export const EMAIL_LINK: Social = {
  label: 'Email',
  href: 'mailto:nathanppickard@gmail.com',
  icon: 'mdi:email-outline',
  invert: false,
};
