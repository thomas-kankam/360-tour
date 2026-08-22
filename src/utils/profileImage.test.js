import { resolveProfileImageSrc } from "./profileImage";

describe("resolveProfileImageSrc", () => {
  test("returns empty string for missing values", () => {
    expect(resolveProfileImageSrc(null)).toBe("");
    expect(resolveProfileImageSrc("")).toBe("");
  });

  test("returns a stored URL", () => {
    expect(resolveProfileImageSrc("http://127.0.0.1:8000/storage/uploads/images/a.webp")).toBe(
      "http://127.0.0.1:8000/storage/uploads/images/a.webp",
    );
  });

  test("unwraps a JSON object leftover from the old array cast", () => {
    expect(
      resolveProfileImageSrc(JSON.stringify({ uri: "https://cdn.example.com/avatar.jpg", data: "" })),
    ).toBe("https://cdn.example.com/avatar.jpg");
  });

  test("builds a data URI from mime + payload", () => {
    expect(resolveProfileImageSrc({ mimeType: "image/png", data: "abc123" })).toBe("data:image/png;base64,abc123");
  });
});
