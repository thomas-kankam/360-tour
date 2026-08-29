import { resolveNotificationLink } from "./notificationHelpers";

describe("notificationHelpers", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("https://360toursghana.com/admin/notifications"),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  test("normalizes admin links built with /admin/login base", () => {
    expect(
      resolveNotificationLink("https://360toursghana.com/admin/login/admin/ratings", { audience: "admin" }),
    ).toBe("/admin/ratings");
  });

  test("keeps valid admin deep links", () => {
    expect(
      resolveNotificationLink("https://360toursghana.com/admin/invoice-requests", { audience: "admin" }),
    ).toBe("/admin/invoice-requests");
  });

  test("routes bare home links to admin dashboard for admin audience", () => {
    expect(resolveNotificationLink("https://360toursghana.com/", { audience: "admin" })).toBe("/admin");
  });

  test("keeps client booking links for client audience", () => {
    expect(
      resolveNotificationLink("https://360toursghana.com/my-bookings/ABC123", { audience: "client" }),
    ).toBe("/my-bookings/ABC123");
  });
});
