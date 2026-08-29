import { useEffect } from "react";
import { useLocation } from "react-router";
import { resolveSeoForPath } from "../../config/seo";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;

  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(payload);
  document.head.appendChild(script);
}

export default function PageSeo({ override = null, jsonLd = null, jsonLdId = "page-json-ld" }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = override || resolveSeoForPath(pathname);
    document.title = seo.title;

    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "keywords", seo.keywords);
    upsertLink("canonical", seo.canonicalUrl);

    const ogType = seo.ogType || "website";
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:site_name", seo.siteName);
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:url", seo.canonicalUrl);
    upsertMeta("property", "og:image", seo.imageUrl);
    upsertMeta("property", "og:image:alt", seo.title);
    if (seo.publishedTime) {
      upsertMeta("property", "article:published_time", seo.publishedTime);
    }
    if (seo.author) {
      upsertMeta("property", "article:author", seo.author);
    }
    if (seo.section) {
      upsertMeta("property", "article:section", seo.section);
    }

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);
    upsertMeta("name", "twitter:image", seo.imageUrl);
    if (seo.twitterHandle) {
      upsertMeta("name", "twitter:site", seo.twitterHandle);
    }

    upsertJsonLd(jsonLdId, jsonLd);

    return () => {
      const node = document.getElementById(jsonLdId);
      if (node) node.remove();
    };
  }, [pathname, override, jsonLd, jsonLdId]);

  return null;
}
