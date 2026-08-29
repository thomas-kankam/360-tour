import { resolvePublicMediaUrl, toStorageRelativeUrl } from "./mediaUrl";

describe("media URL helpers", () => {
  test("rewrites loopback storage URLs onto the API origin", () => {
    expect(resolvePublicMediaUrl("http://127.0.0.1:8000/storage/uploads/images/a.webp")).toBe(
      "https://api.360toursghana.com/storage/uploads/images/a.webp",
    );
  });

  test("prefixes relative storage paths with the API origin", () => {
    expect(resolvePublicMediaUrl("/storage/uploads/images/a.webp")).toBe(
      "https://api.360toursghana.com/storage/uploads/images/a.webp",
    );
  });

  test("keeps absolute remote storage URLs intact", () => {
    expect(resolvePublicMediaUrl("https://api.360toursghana.com/storage/uploads/images/a.webp")).toBe(
      "https://api.360toursghana.com/storage/uploads/images/a.webp",
    );
  });

  test("leaves frontend /images assets and data URIs alone", () => {
    expect(resolvePublicMediaUrl("/images/home/volta.jpg")).toBe("/images/home/volta.jpg");
    expect(resolvePublicMediaUrl("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
  });

  test("strips hosts when sending storage URLs back to the API", () => {
    expect(toStorageRelativeUrl("http://127.0.0.1:8000/storage/uploads/images/cover.webp")).toBe(
      "/storage/uploads/images/cover.webp",
    );
    expect(toStorageRelativeUrl("/storage/uploads/images/cover.webp")).toBe("/storage/uploads/images/cover.webp");
  });
});
