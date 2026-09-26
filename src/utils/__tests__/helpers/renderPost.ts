import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { type CollectionEntry, render } from 'astro:content';
import { getContainerRenderer as getMdxRenderer } from '@astrojs/mdx/container-renderer';

/** Render a blog post's body (not the layout) through the configured Markdown/MDX pipeline. */
export async function renderPostBody(post: CollectionEntry<'blog'>): Promise<string> {
  const { Content } = await render(post);
  const renderers = await loadRenderers([getMdxRenderer()]);
  const container = await AstroContainer.create({ renderers });
  return container.renderToString(Content);
}
