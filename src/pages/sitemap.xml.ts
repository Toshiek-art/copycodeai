import type { APIRoute } from 'astro';
import { sanityClient } from '../lib/sanity';

type SanitySlugResult = { slug: string };

const STATIC_PATHS = ['/', '/work', '/writing', '/contact'];

const toUrl = (base: string, path: string) => `${base}${path}`;

export const GET: APIRoute = async ({ site }) => {
  const base = (typeof site === 'string' && site) ? site.replace(/\/$/, '') : 'https://copycodeai-bki.pages.dev';

  let projectSlugs: SanitySlugResult[] = [];
  let postSlugs: SanitySlugResult[] = [];

  try {
    [projectSlugs, postSlugs] = await Promise.all([
      sanityClient.fetch<SanitySlugResult[]>(
        `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`
      ),
      sanityClient.fetch<SanitySlugResult[]>(
        `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`
      )
    ]);
  } catch (error) {
    console.error('[sitemap] Failed to fetch Sanity slugs', error);
  }

  const urls = new Set<string>();
  STATIC_PATHS.forEach((path) => urls.add(toUrl(base, path)));
  projectSlugs.forEach(({ slug }) => urls.add(toUrl(base, `/work/${slug}`)));
  postSlugs.forEach(({ slug }) => urls.add(toUrl(base, `/writing/${slug}`)));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${Array.from(urls).map((u) => `<url><loc>${u}</loc></url>`).join('')}
  </urlset>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
