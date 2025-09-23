import type { APIRoute } from 'astro';
import { projects } from '../data/projects';
import { writings } from '../data/writing';

export const GET: APIRoute = ({ site }) => {
  const base = String(site);
  const urls = [
    '/', '/work', '/writing', '/contact',
    ...projects.filter(p => p.status === 'published').map(p => `/work/${p.slug}`),
    ...writings.filter(w => w.status === 'published').map(w => `/writing/${w.slug}`)
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u => `<url><loc>${base.replace(/\/$/, '')}${u}</loc></url>`).join('')}
  </urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
