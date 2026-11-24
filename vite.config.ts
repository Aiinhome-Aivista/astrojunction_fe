import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getOrigin(): string {
  if (process.env.SHARE_BASE_URL) {
    return process.env.SHARE_BASE_URL.trim().replace(/\/+$/, '');
  }
  try {
    const possiblePaths = [
      // 1. Root folder .env (e.g. d:/server_astrojunction/.env)
      path.resolve(__dirname, '../.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '../.env'),
      // 2. Backend folder .env (e.g. d:/server_astrojunction/astrojunction_be/.env)
      path.resolve(__dirname, '../astrojunction_be/.env'),
      path.resolve(process.cwd(), 'astrojunction_be/.env'),
      path.resolve(process.cwd(), '../astrojunction_be/.env'),
    ];
    for (const envPath of possiblePaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/^\s*SHARE_BASE_URL\s*=\s*([^\r\n#]+)/m);
        if (match && match[1].trim()) {
          return match[1].trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
        }
      }
    }
  } catch (e) { }
  return '';
}

function liveEnvPlugin() {
  return {
    name: 'live-env-plugin',
    transformIndexHtml(html: string) {
      try {
        const envPath = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf-8');
          const match = envContent.match(/^\s*VITE_API_BASE_URL\s*=\s*([^\r\n#]+)/m);
          const url = match ? match[1].trim() : '';
          if (url) {
            return html.replace(
              '<head>',
              `<head>\n    <script>window.__VITE_API_BASE_URL__ = ${JSON.stringify(url)};</script>`
            );
          }
        }
      } catch (e) {
        console.error('Error in liveEnvPlugin:', e);
      }
      return html;
    },
    configureServer(server: any) {
      const envPath = path.resolve(__dirname, '.env');
      server.watcher.add(envPath);
      server.watcher.on('change', (file: string) => {
        if (file.endsWith('.env')) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'ASTROJUNCTION • Vedic Astrology, Kundli & Daily Horoscope',
    description: 'Ancient Knowledge • Modern Intelligence. Accurate Vedic Janam Kundli, Daily Panchang & Horoscope, Kundli Milan (Matchmaking), Numerology, and Life Counselling.',
  },
  '/about-us': {
    title: 'About Us • ASTROJUNCTION',
    description: "Discover AstroJunction's mission to bridge ancient Vedic Jyotish shastra with state-of-the-art computational astrology.",
  },
  '/privacy-policy': {
    title: 'Privacy Policy • ASTROJUNCTION',
    description: 'Read our privacy policy outlining how personal and astrological data is collected, protected, and safeguarded.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions • ASTROJUNCTION',
    description: 'Review the terms and conditions governing the use of AstroJunction services, predictions, and consultations.',
  },
  '/faq': {
    title: 'Frequently Asked Questions • ASTROJUNCTION',
    description: 'Find answers to common questions regarding Vedic astrological calculations, Kundli, and platform features.',
  },
  '/cookie-policy': {
    title: 'Cookie Policy • ASTROJUNCTION',
    description: 'Information on cookies and local storage usage on AstroJunction.',
  },
  '/blogs': {
    title: 'Vedic Astrology Blogs, Articles & Ancient Wisdom • ASTROJUNCTION',
    description: 'Explore authentic Vedic astrology, planetary yogas, kundli matching, and spiritual wisdom directly from our masters.',
  },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function injectRouteMeta(baseHtml: string, route: string, origin: string): string {
  const cleanRoute = route === '/' ? '/' : `/${route.replace(/^\/+|\/+$/g, '')}`;
  const canonicalUrl = `${origin}${cleanRoute === '/' ? '/' : cleanRoute}`;

  let meta = ROUTE_META[cleanRoute];
  if (!meta) {
    const slug = cleanRoute.split('/').filter(Boolean).pop() || '';
    const formatted = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    meta = {
      title: `${formatted} • ASTROJUNCTION`,
      description: `Explore authentic Vedic astrology, horoscope insights, and celestial guidance on AstroJunction for ${formatted}.`,
    };
  }

  const cleaned = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<meta\s+content=["'][^"']*["']\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<link\s+href=["'][^"']*["']\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:url["'][^>]*>/gi, '')
    .replace(/<meta\s+content=["'][^"']*["']\s+property=["']og:url["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:title["'][^>]*>/gi, '')
    .replace(/<meta\s+content=["'][^"']*["']\s+property=["']og:title["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:description["'][^>]*>/gi, '')
    .replace(/<meta\s+content=["'][^"']*["']\s+property=["']og:description["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>/gi, '')
    .replace(/<meta\s+content=["'][^"']*["']\s+name=["']twitter:title["'][^>]*>/gi, '');

  const injected = `  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">`;

  return cleaned.includes('<meta charset="UTF-8" />')
    ? cleaned.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n${injected}`)
    : cleaned.replace(/<head>/i, `<head>\n${injected}`);
}

function prerenderMetaPlugin() {
  return {
    name: 'prerender-meta-plugin',
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string, ctx: any) {
        const rawPath = ctx?.originalUrl || ctx?.path || '/';
        if (rawPath.startsWith('/@') || /\.(js|ts|tsx|jsx|css|json|webp|png|jpg|jpeg|svg|ico)$/i.test(rawPath)) {
          return html;
        }
        const route = rawPath.split('?')[0].replace(/\/index\.html$/i, '').replace(/\/+$/, '') || '/';
        const origin = getOrigin();
        return injectRouteMeta(html, route, origin);
      },
    },
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist');
        const templatePath = path.join(distDir, 'index.html');
        if (!fs.existsSync(templatePath)) return;

        const ORIGIN = getOrigin();
        const baseHtml = fs.readFileSync(templatePath, 'utf-8');

        const routes = new Set<string>([
          '/',
          '/about-us',
          '/privacy-policy',
          '/terms-and-conditions',
          '/faq',
          '/cookie-policy',
          '/blogs',
        ]);

        const sitemapPath = path.resolve(__dirname, 'public/sitemap.xml');
        if (fs.existsSync(sitemapPath)) {
          const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
          const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
          let m: RegExpExecArray | null;
          while ((m = locRegex.exec(sitemapContent)) !== null) {
            try {
              const u = new URL(m[1]);
              const r = u.pathname.replace(/\/+$/, '') || '/';
              if (!['/about', '/tools', '/tools/compress', '/admin', '/login', '/signup', '/account', '/s', '/forgot-password', '/reset-password'].some(p => r === p || r.startsWith(`${p}/`))) {
                routes.add(r);
              }
            } catch { }
          }
        }

        for (const route of routes) {
          const outputHtml = injectRouteMeta(baseHtml, route, ORIGIN);
          if (route === '/' || route === '') {
            fs.writeFileSync(path.join(distDir, 'index.html'), outputHtml, 'utf-8');
          } else {
            const cleanRoute = route.replace(/^\/+/, '').replace(/\/+$/, '');
            const targetDir = path.join(distDir, cleanRoute);
            fs.mkdirSync(targetDir, { recursive: true });
            fs.writeFileSync(path.join(targetDir, 'index.html'), outputHtml, 'utf-8');
          }
        }

        if (ORIGIN) {
          const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            Array.from(routes).map(r => `  <url>\n    <loc>${ORIGIN}${r === '/' ? '/' : r}</loc>\n    <changefreq>${r === '/' || r === '/blogs' ? 'daily' : 'monthly'}</changefreq>\n    <priority>${r === '/' ? '1.0' : r.startsWith('/blogs/') ? '0.8' : '0.7'}</priority>\n  </url>`).join('\n') +
            `\n</urlset>`;
          fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
          fs.writeFileSync(path.join(__dirname, 'public/sitemap.xml'), sitemapXml, 'utf-8');

          const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /s/\nDisallow: /login\nDisallow: /signup\nDisallow: /forgot-password\nDisallow: /reset-password\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
          fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
          fs.writeFileSync(path.join(__dirname, 'public/robots.txt'), robotsTxt, 'utf-8');
        }
      } catch (err) {
        console.error('[prerenderMetaPlugin] Error during prerender:', err);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), liveEnvPlugin(), prerenderMetaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      sourcemap: true,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
