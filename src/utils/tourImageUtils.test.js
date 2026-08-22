import { resolveImageForApiPayload } from "./tourImageUtils";

describe("resolveImageForApiPayload", () => {
  test("sends stored file URLs instead of leftover filenames", () => {
    expect(
      resolveImageForApiPayload({ uri: "http://127.0.0.1:8000/storage/uploads/images/cover.webp", data: "" }),
    ).toBe("http://127.0.0.1:8000/storage/uploads/images/cover.webp");
  });

  test("accepts relative storage and local image paths", () => {
    expect(resolveImageForApiPayload({ uri: "/storage/uploads/images/cover.webp", data: "" })).toBe(
      "/storage/uploads/images/cover.webp",
    );
    expect(resolveImageForApiPayload({ uri: "/images/home/ghana_tour.png", data: "" })).toBe("/images/home/ghana_tour.png");
  });

  test("still supports a data URI fallback for unauthenticated signup", () => {
    const dataUri = "data:image/png;base64,abc123";
    expect(resolveImageForApiPayload({ uri: "avatar.png", data: dataUri })).toBe(dataUri);
  });
});
