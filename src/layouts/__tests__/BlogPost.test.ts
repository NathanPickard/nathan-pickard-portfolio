import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BlogPost from '../BlogPost.astro';
import HeroImage from '../../assets/blog-placeholder-2.jpg';

interface BlogPostProps {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: unknown;
  headings?: { depth: number; slug: string; text: string }[];
  minutesRead?: number;
}

async function renderBlogPost(props: BlogPostProps) {
  const container = await AstroContainer.create();
  return container.renderToString(BlogPost, {
    props,
    slots: {
      default: '<p>Post body content</p>',
    },
  });
}

describe('BlogPost.astro', () => {
  it('renders title, description, publish date, and slot content', async () => {
    const html = await renderBlogPost({
      title: 'My Test Post',
      description: 'Post description',
      pubDate: new Date('2026-04-27T12:00:00Z'),
    });

    expect(html).toContain('My Test Post');
    expect(html).toContain('Post description');
    expect(html).toContain('Apr 27, 2026');
    expect(html).toContain('Post body content');
    expect(html).toContain('href="/blog"');
  });

  it('renders updated date label only when updatedDate exists', async () => {
    const withUpdate = await renderBlogPost({
      title: 'Updated Post',
      description: 'Desc',
      pubDate: new Date('2026-01-01T12:00:00Z'),
      updatedDate: new Date('2026-03-01T12:00:00Z'),
    });

    const withoutUpdate = await renderBlogPost({
      title: 'No Update Post',
      description: 'Desc',
      pubDate: new Date('2026-01-01T12:00:00Z'),
    });

    expect(withUpdate).toContain('Updated');
    expect(withoutUpdate).not.toContain('Updated');
  });

  it('does not render the hero image on the post page', async () => {
    const withHero = await renderBlogPost({
      title: 'With Hero',
      description: 'Desc',
      pubDate: new Date('2026-01-01T12:00:00Z'),
      heroImage: HeroImage,
    });

    expect(withHero).not.toContain('hero-image');
    expect(withHero).not.toContain('hero-img');
  });

  it('renders a table of contents before the prose only when headings are passed', async () => {
    const base = {
      title: 'Toc Post',
      description: 'Desc',
      pubDate: new Date('2026-01-01T12:00:00Z'),
    };

    const withToc = await renderBlogPost({
      ...base,
      headings: [{ depth: 2, slug: 'summary', text: 'Summary' }],
    });
    const withoutToc = await renderBlogPost(base);

    expect(withToc).toContain('aria-label="Table of contents"');
    expect(withToc.indexOf('Table of contents')).toBeLessThan(withToc.indexOf('Post body content'));
    expect(withoutToc).not.toContain('Table of contents');
  });

  it('shows reading time beside the date only when minutesRead is passed', async () => {
    const base = {
      title: 'Timed Post',
      description: 'Desc',
      pubDate: new Date('2026-01-01T12:00:00Z'),
    };

    const withTime = await renderBlogPost({ ...base, minutesRead: 19 });
    const withoutTime = await renderBlogPost(base);

    expect(withTime).toMatch(/Jan 1, 2026[\s\S]*19 min read/);
    expect(withoutTime).not.toContain('min read');
  });
});
