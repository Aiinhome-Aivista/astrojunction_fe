import React, { useEffect } from 'react';
import { SEOProps, DEFAULT_SEO } from '../config/seoConfig';

function updateMetaTag(attrName: 'name' | 'property', attrValue: string, content: string | undefined) {
  if (!content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string | undefined) {
  if (!href) return;
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function updateJsonLd(schemaData: Record<string, any> | undefined) {
  const SCRIPT_ID = 'astro-dynamic-jsonld';
  let scriptElement = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!schemaData) {
    if (scriptElement) {
      scriptElement.remove();
    }
    return;
  }

  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = SCRIPT_ID;
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }

  try {
    scriptElement.textContent = JSON.stringify(schemaData);
  } catch (err) {
    console.warn('[SEO] Failed to serialize JSON-LD:', err);
  }
}

/**
 * Custom Hook: useSEO
 * Dynamically synchronizes document title, meta tags, OpenGraph, Twitter Cards,
 * and JSON-LD structured data with component state.
 */
export function useSEO(props: Partial<SEOProps>) {
  const title = props.title || DEFAULT_SEO.title;
  const description = props.description || DEFAULT_SEO.description;
  const keywords = props.keywords?.length ? props.keywords.join(', ') : DEFAULT_SEO.keywords?.join(', ');
  
  // Resolve absolute image URL if relative path provided
  const rawImage = props.ogImage || DEFAULT_SEO.ogImage || '/golden_zodiac_wheel.jpg';
  const ogImage = typeof window !== 'undefined' && rawImage.startsWith('/')
    ? `${window.location.origin}${rawImage}`
    : rawImage;

  const currentUrl = typeof window !== 'undefined'
    ? props.canonical || window.location.href
    : '';

  const ogType = props.ogType || DEFAULT_SEO.ogType || 'website';
  const jsonLd = props.jsonLd || DEFAULT_SEO.jsonLd;

  useEffect(() => {
    // 1. Browser Window Title
    document.title = title;

    // 2. Standard Search Engine Meta
    updateMetaTag('name', 'description', description);
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }
    updateMetaTag('name', 'robots', 'index, follow');

    // 3. Open Graph (Facebook, WhatsApp, LinkedIn, Discord)
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:url', currentUrl);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:site_name', 'ASTROJUNCTION');

    // 4. Twitter Cards
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    if (currentUrl) {
      updateLinkTag('canonical', currentUrl);
    }

    // 6. Schema.org JSON-LD Structured Data
    updateJsonLd(jsonLd);

  }, [title, description, keywords, ogImage, currentUrl, ogType, jsonLd]);
}

/**
 * Declarative Component: <SEO />
 * Usage: <SEO title="..." description="..." ogImage="..." />
 */
export const SEO: React.FC<Partial<SEOProps>> = (props) => {
  useSEO(props);
  return null;
};
