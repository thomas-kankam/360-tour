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

export default function PageSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = resolveSeoForPath(pathname);
    document.title = seo.title;

    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "keywords", seo.keywords);
    upsertLink("canonical", seo.canonicalUrl);

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", seo.siteName);
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:url", seo.canonicalUrl);
    upsertMeta("property", "og:image", seo.imageUrl);
    upsertMeta("property", "og:image:alt", `${seo.siteName} logo`);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);
    upsertMeta("name", "twitter:image", seo.imageUrl);
    if (seo.twitterHandle) {
      upsertMeta("name", "twitter:site", seo.twitterHandle);
    }
  }, [pathname]);

  return null;
}
