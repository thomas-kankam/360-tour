import { getImageVariantSpec, isTrustedMediaUrl } from "./imageOptimize";

describe("imageOptimize helpers", () => {
  test("destination variant is 16:10 so landing cards crop cleanly", () => {
    const spec = getImageVariantSpec("destination");
    expect(spec.width / spec.height).toBeCloseTo(16 / 10);
    expect(spec.fit).toBe("cover");
  });

  test("profile variant is square", () => {
    const spec = getImageVariantSpec("profile");
    expect(spec.width).toBe(spec.height);
  });

  test("trusts local, relative, and storage URLs", () => {
    expect(isTrustedMediaUrl("/images/home/volta.jpg")).toBe(true);
    expect(isTrustedMediaUrl("http://127.0.0.1:8000/storage/uploads/images/a.webp")).toBe(true);
    expect(isTrustedMediaUrl("https://api.360toursghana.com/storage/uploads/images/a.webp")).toBe(true);
    expect(isTrustedMediaUrl("data:image/png;base64,abc")).toBe(true);
  });

  test("rejects third-party stock URLs that do not match destination copy", () => {
    expect(isTrustedMediaUrl("https://upload.wikimedia.org/wikipedia/commons/a.jpg")).toBe(false);
    expect(isTrustedMediaUrl("https://images.unsplash.com/photo-123")).toBe(false);
  });
});
