import React, { useState, useEffect } from 'react';
import { AdminSEOView } from '../components/AdminSEOView';
import { adminApi } from '../services/adminApi';

export default function AdminSeo({ theme = 'dark', ...props }) {
  // Initialize and keep siteUrl locked to the browser origin dynamically (NO hardcoding)
  const [siteUrl] = useState(() => (typeof window !== 'undefined' ? window.location.origin : 'https://astrojunction.com'));
  const [seoConfig, setSeoConfig] = useState(null);

  useEffect(() => {
    // Fetch SEO data while strictly preventing backend host leak
    adminApi.getSeoConfig()
      .then((d) => {
        if (d && typeof d === 'object') {
          // Do NOT allow backend API responses to overwrite siteUrl
          const { site_url, api_url, ...rest } = d;
          setSeoConfig(rest);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch seo settings in AdminSeo page:', err);
      });
  }, []);

  return (
    <div className="admin-seo-page p-4">
      {/* Sitemap & robots.txt quick access */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <a className="mini seo-linkbtn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C9A050] text-[#C9A050] text-xs font-semibold hover:bg-[#C9A050]/10 transition-colors" href={`${siteUrl}/sitemap.xml`} target="_blank" rel="noopener noreferrer">
          <i className="pi pi-external-link" aria-hidden="true"></i> {siteUrl}/sitemap.xml
        </a>
        <a className="mini seo-linkbtn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C9A050] text-[#C9A050] text-xs font-semibold hover:bg-[#C9A050]/10 transition-colors" href={`${siteUrl}/robots.txt`} target="_blank" rel="noopener noreferrer">
          <i className="pi pi-external-link" aria-hidden="true"></i> {siteUrl}/robots.txt
        </a>
      </div>

      <AdminSEOView theme={theme} {...props} />
    </div>
  );
}
