import {
  buildStoriesBlogJsonLd,
  buildStoriesItemListJsonLd,
  buildStoryArticleJsonLd,
  parseStoryDisplayDate,
  resolveSeoForStory,
} from "../config/seo";

const sampleStory = {
  slug: "cape-coast-castle-reflection",
  title: "Standing Inside Cape Coast Castle: A Reflection on Memory and Healing",
  excerpt: "Our group of 22 students stood in the dungeons of Cape Coast Castle.",
  category: "Heritage",
  country: "Ghana",
  author: "Dr. Amara Williams",
  authorRole: "University program coordinator",
  date: "March 18, 2025",
  readTime: "6 min read",
  image: "/images/home/ghana_tour.png",
};

describe("story SEO helpers", () => {
  test("parses display dates for schema.org", () => {
    expect(parseStoryDisplayDate("March 18, 2025")).toBe("2025-03-18");
    expect(parseStoryDisplayDate("")).toBeUndefined();
  });

  test("builds article SEO from story template", () => {
    const seo = resolveSeoForStory(sampleStory);

    expect(seo.title).toContain("Cape Coast Castle");
    expect(seo.description).toContain("22 students");
    expect(seo.canonicalUrl).toContain("/stories/cape-coast-castle-reflection");
    expect(seo.ogType).toBe("article");
    expect(seo.keywords).toContain("Ghana travel");
  });

  test("builds BlogPosting JSON-LD", () => {
    const jsonLd = buildStoryArticleJsonLd(sampleStory);

    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.headline).toBe(sampleStory.title);
    expect(jsonLd.datePublished).toBe("2025-03-18");
    expect(jsonLd.author.name).toBe("Dr. Amara Williams");
  });

  test("builds stories index structured data", () => {
    const list = buildStoriesItemListJsonLd([sampleStory]);
    const blog = buildStoriesBlogJsonLd([sampleStory]);

    expect(list.itemListElement[0].url).toContain(sampleStory.slug);
    expect(blog["@type"]).toBe("Blog");
    expect(blog.blogPost[0].headline).toBe(sampleStory.title);
  });
});
