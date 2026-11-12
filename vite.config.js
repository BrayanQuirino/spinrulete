import { defineConfig as define_config } from 'vite';

const public_url = process.env.SITE_URL ? new URL(process.env.SITE_URL) : null;
if (public_url && !public_url.pathname.endsWith('/')) public_url.pathname += '/';

function escape_markup(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
}

/** Generate search metadata from the actual deployment URL supplied by Pages. */
function site_metadata() {
  if (!public_url) return { name: 'site-metadata' };
  const canonical_url = public_url.href;

  return {
    name: 'site-metadata',
    apply: 'build',
    transformIndexHtml() {
      return [
        { tag: 'link', attrs: { rel: 'canonical', href: canonical_url }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: canonical_url }, injectTo: 'head' },
      ];
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: '<?xml version="1.0" encoding="UTF-8"?>\n'
          + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + `  <url><loc>${escape_markup(canonical_url)}</loc></url>\n</urlset>\n`,
      });
      // Crawlers only look for robots.txt at the origin root.
      if (public_url.pathname === '/') {
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: `User-agent: *\nAllow: /\nSitemap: ${canonical_url}sitemap.xml\n`,
        });
      }
    },
  };
}

export default define_config({
  base: public_url?.pathname ?? './',
  plugins: [site_metadata()],
});
