import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

function getOrigin(): string {
  try {
    const beEnvPath = path.resolve(__dirname, '../astrojunction_be/.env');
    if (fs.existsSync(beEnvPath)) {
      const beContent = fs.readFileSync(beEnvPath, 'utf-8');
      const match = beContent.match(/^\s*SHARE_BASE_URL\s*=\s*([^\r\n#]+)/m);
      if (match && match[1].trim()) {
        return match[1].trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
      }
    }
  } catch (e) { }
  return 'https://astrojunction.in';
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

function prerenderMetaPlugin() {
  return {
    name: 'prerender-meta-plugin',
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist');
        const templatePath = path.join(distDir, 'index.html');
        if (!fs.existsSync(templatePath)) return;

        const ORIGIN = getOrigin();
        const baseHtml = fs.readFileSync(templatePath, 'utf-8');

        const ROUTE_META: Record<string, { title: string; description: string }> = {
          '/': {
            title: 'ASTROJUNCTION • Vedic Astrology, Kundli & Daily Horoscope',
            description: 'Ancient Knowledge • Modern Intelligence. Accurate Vedic Janam Kundli, Daily Panchang & Horoscope, Kundli Milan (Matchmaking), Numerology, and Life Counselling.',
          },
          '/about': {
            title: 'About Us • ASTROJUNCTION',
            description: "Discover AstroJunction's mission to bridge ancient Vedic Jyotish shastra with state-of-the-art computational astrology.",
          },
          '/about-us': {
            title: 'About Us • ASTROJUNCTION',
            description: "Discover AstroJunction's mission to bridge ancient Vedic Jyotish shastra with state-of-the-art computational astrology.",
          },
          '/privacy': {
            title: 'Privacy Policy • ASTROJUNCTION',
            description: 'Read our privacy policy outlining how personal and astrological data is collected, protected, and safeguarded.',
          },
          '/privacy-policy': {
            title: 'Privacy Policy • ASTROJUNCTION',
            description: 'Read our privacy policy outlining how personal and astrological data is collected, protected, and safeguarded.',
          },
          '/terms': {
            title: 'Terms & Conditions • ASTROJUNCTION',
            description: 'Review the terms and conditions governing the use of AstroJunction services, predictions, and consultations.',
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
          '/disclaimer': {
            title: 'Astrological Disclaimer • ASTROJUNCTION',
            description: 'Important astrological guidance disclaimer and advisory notice for AstroJunction seekers.',
          },
          '/blogs': {
            title: 'Vedic Astrology Blogs, Articles & Ancient Wisdom • ASTROJUNCTION',
            description: 'Explore authentic Vedic astrology, planetary yogas, kundli matching, and spiritual wisdom directly from our masters.',
          },
          '/tools/compress': {
            title: 'Astrology Dossier & PDF Compressor • ASTROJUNCTION',
            description: 'Fast, client-side PDF and report compression tool for astrological dossiers and Kundli charts.',
          },
        };

        const routes = new Set<string>([
          '/',
          '/about',
          '/about-us',
          '/privacy-policy',
          '/terms-and-conditions',
          '/faq',
          '/cookie-policy',
          '/blogs',
          '/tools/compress',
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
              if (!['/admin', '/login', '/signup', '/account', '/s', '/forgot-password', '/reset-password'].some(p => r === p || r.startsWith(`${p}/`))) {
                routes.add(r);
              }
            } catch { }
          }
        }

        const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        for (const route of routes) {
          const canonicalUrl = `${ORIGIN}${route === '/' ? '/' : route}`;
          let meta = ROUTE_META[route];
          if (!meta) {
            const slug = route.split('/').filter(Boolean).pop() || '';
            const formatted = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            meta = {
              title: `${formatted} • ASTROJUNCTION`,
              description: `Explore authentic Vedic astrology, horoscope insights, and celestial guidance on AstroJunction for ${formatted}.`,
            };
          }

          let cleaned = baseHtml
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

          const outputHtml = cleaned.includes('<meta charset="UTF-8" />')
            ? cleaned.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n${injected}`)
            : cleaned.replace(/<head>/i, `<head>\n${injected}`);

          if (route === '/' || route === '') {
            fs.writeFileSync(path.join(distDir, 'index.html'), outputHtml, 'utf-8');
          } else {
            const cleanRoute = route.replace(/^\/+/, '').replace(/\/+$/, '');
            const targetDir = path.join(distDir, cleanRoute);
            fs.mkdirSync(targetDir, { recursive: true });
            fs.writeFileSync(path.join(targetDir, 'index.html'), outputHtml, 'utf-8');
          }
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
