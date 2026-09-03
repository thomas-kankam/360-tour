import axios from "axios";
import env from "../config/env";
import { parseApiEnvelope, parseApiError } from "../utils/apiResponse";
import { resolvePublicMediaUrl } from "../utils/mediaUrl";

function mapStory(raw = {}) {
  return {
    id: raw.id ?? null,
    slug: raw.slug || "",
    title: raw.title || "",
    excerpt: raw.excerpt || "",
    category: raw.category || "",
    country: raw.country || "",
    author: raw.author || "",
    authorRole: raw.authorRole || raw.author_role || "",
    date: raw.date || raw.display_date || "",
    readTime: raw.readTime || raw.read_time || "",
    image: resolvePublicMediaUrl(raw.image || ""),
    body: Array.isArray(raw.body) ? raw.body : [],
    status: raw.status || "draft",
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0) || 0,
    publishedAt: raw.publishedAt || raw.published_at || null,
  };
}

function mapExperience(raw = {}) {
  return {
    id: raw.id ?? null,
    key: raw.key || raw.experience_key || "",
    slug: raw.slug || "",
    label: raw.label || "",
    iconKey: raw.iconKey || raw.icon_key || "compass",
    tagline: raw.tagline || "",
    description: raw.description || "",
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    regions: Array.isArray(raw.regions) ? raw.regions : [],
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
    image: resolvePublicMediaUrl(raw.image || ""),
    badgeText: raw.badgeText || raw.badge_text || "",
    tourQuery: raw.tourQuery || raw.tour_query || {},
    storyCategory: raw.storyCategory || raw.story_category || "",
    relatedStorySlugs: Array.isArray(raw.relatedStorySlugs)
      ? raw.relatedStorySlugs
      : Array.isArray(raw.related_story_slugs)
        ? raw.related_story_slugs
        : [],
    status: raw.status || "draft",
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0) || 0,
    publishedAt: raw.publishedAt || raw.published_at || null,
  };
}

class PublicContentServiceApi {
  constructor() {
    this.baseUrl = env.apiUrl;
  }

  async getStories(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/stories`, {
        params,
        headers: { Accept: "application/json" },
      });
      const result = parseApiEnvelope(response);
      const items = (result.data?.items || []).map(mapStory);
      return { ...result, items, ok: result.ok };
    } catch (error) {
      return { ...parseApiError(error), items: [], ok: false };
    }
  }

  async getStory(slug) {
    try {
      const response = await axios.get(`${this.baseUrl}/stories/${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
      });
      const result = parseApiEnvelope(response);
      return {
        ...result,
        story: result.data?.story ? mapStory(result.data.story) : null,
        related: (result.data?.related || []).map(mapStory),
        ok: result.ok && Boolean(result.data?.story),
      };
    } catch (error) {
      return { ...parseApiError(error), story: null, related: [], ok: false };
    }
  }

  async getExperiences() {
    try {
      const response = await axios.get(`${this.baseUrl}/experiences`, {
        headers: { Accept: "application/json" },
      });
      const result = parseApiEnvelope(response);
      const items = (result.data?.items || []).map(mapExperience);
      return { ...result, items, ok: result.ok };
    } catch (error) {
      return { ...parseApiError(error), items: [], ok: false };
    }
  }
}

export { mapStory, mapExperience };
const publicContentServiceApi = new PublicContentServiceApi();
export default publicContentServiceApi;
