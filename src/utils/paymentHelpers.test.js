import { extractPaymentRedirectUrl, redirectToPaymentCheckout, formatPaymentReferenceDisplay } from "./paymentHelpers";
import { buildRetryPaymentPayload } from "./bookingHelpers";

describe("payment redirect helpers", () => {
  test("extractPaymentRedirectUrl resolves nested booking paymentUrl", () => {
    expect(
      extractPaymentRedirectUrl({
        booking: { paymentUrl: "https://checkout.stripe.com/pay/cs_test_123" },
      }),
    ).toBe("https://checkout.stripe.com/pay/cs_test_123");
  });

  test("extractPaymentRedirectUrl prefers top-level paymentUrl", () => {
    expect(
      extractPaymentRedirectUrl({
        paymentUrl: "https://checkout.paystack.com/abc",
        booking: { paymentUrl: "https://checkout.stripe.com/pay/cs_test_123" },
      }),
    ).toBe("https://checkout.paystack.com/abc");
  });

  test("redirectToPaymentCheckout assigns window location", () => {
    const assign = jest.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, assign },
    });

    const redirected = redirectToPaymentCheckout({
      paymentUrl: "https://checkout.paystack.com/abc",
    });

    expect(redirected).toBe(true);
    expect(assign).toHaveBeenCalledWith("https://checkout.paystack.com/abc");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  test("redirectToPaymentCheckout calls onMissing when no paymentUrl", () => {
    const onMissing = jest.fn();
    const redirected = redirectToPaymentCheckout({}, { onMissing });

    expect(redirected).toBe(false);
    expect(onMissing).toHaveBeenCalledTimes(1);
  });
});

describe("formatPaymentReferenceDisplay", () => {
  test("returns em dash for empty reference", () => {
    expect(formatPaymentReferenceDisplay("")).toBe("—");
  });

  test("keeps short references intact", () => {
    expect(formatPaymentReferenceDisplay("AFQ_TEVK6E")).toBe("AFQ_TEVK6E");
  });

  test("shortens long references with middle ellipsis", () => {
    expect(
      formatPaymentReferenceDisplay("cs_test_a11vkdqaba2ZvPUml0XqDKTiBXWShoDd4kGpOJgzy63C5iWRv29teXTdGy"),
    ).toBe("cs_test_…TdGy");
  });
});

describe("buildRetryPaymentPayload", () => {
  test("builds individual retry payload from booking data", () => {
    expect(
      buildRetryPaymentPayload({
        bookingType: "individual",
        selectedDate: "2025-06-14",
        travelers: 1,
        paymentMode: "online",
        amount: 0.1,
        leadTraveler: {
          firstName: "Thomas",
          lastName: "Kankam",
          email: "kankamthomas6@gmail.com",
          phone: "233556906969",
          nationality: "Ghanaian",
        },
        specialRequests: "Need invoice",
        dietaryNeeds: "Halal options",
        additionalTravelers: [],
      }),
    ).toEqual({
      bookingType: "individual",
      selectedDate: "2025-06-14",
      travelers: 1,
      paymentMode: "online",
      leadTraveler: {
        firstName: "Thomas",
        lastName: "Kankam",
        email: "kankamthomas6@gmail.com",
        phone: "233556906969",
        nationality: "Ghanaian",
      },
      groupDetails: [],
      specialRequests: "Need invoice",
      dietaryNeeds: "Halal options",
      additionalTravelers: [],
      amount: 0.1,
    });
  });

  test("builds group retry payload with groupDetails object", () => {
    expect(
      buildRetryPaymentPayload({
        bookingType: "group",
        selectedDate: "2025-06-14",
        travelers: 12,
        paymentMode: "online",
        amount: 1200,
        leadTraveler: {
          firstName: "Ama",
          lastName: "Mensah",
          email: "ama@example.com",
          phone: "233241234567",
        },
        groupDetails: {
          groupName: "Heritage Study Abroad 2025",
          groupType: "university",
          organization: "State University",
        },
        specialRequests: "",
        dietaryNeeds: "",
        additionalTravelers: [],
      }).groupDetails,
    ).toEqual({
      groupName: "Heritage Study Abroad 2025",
      groupType: "university",
      organization: "State University",
    });
  });
});
