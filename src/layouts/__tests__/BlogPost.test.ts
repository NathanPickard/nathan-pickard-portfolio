import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BlogPost from '../BlogPost.astro';
import HeroImage from '../../assets/blog-placeholder-1.jpg';

interface BlogPostProps {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: unknown;
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

  it('renders hero image wrapper only when heroImage prop exists', async () => {
    const withHero = await renderBlogPost({
      title: 'With Hero',
      description: 'Desc',
      pubDate: new Date('2026-01-01T12:00:00Z'),
      heroImage: HeroImage,
    });

    const withoutHero = await renderBlogPost({
      title: 'Without Hero',
      description: 'Desc',
      pubDate: new Date('2026-01-01T12:00:00Z'),
    });

    expect(withHero).toContain('class="hero-image"');
    expect(withoutHero).not.toContain('class="hero-image"');
  });
});
