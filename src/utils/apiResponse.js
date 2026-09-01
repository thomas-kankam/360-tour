export function parseApiEnvelope(response) {
  const envelope = response?.data?.data ?? response?.data ?? {};
  const statusCode = String(envelope.status_code ?? "");
  const inError = Boolean(envelope.in_error);
  const isSuccess = statusCode === "200" || statusCode === "201" || statusCode === 200 || statusCode === 201;

  return {
    ok: !inError && isSuccess,
    message: envelope.message || "Request completed",
    reason: envelope.reason || envelope.message || "",
    data: envelope.data ?? null,
    raw: envelope,
  };
}

export function parseApiError(error) {
  const payload = error?.response?.data ?? {};
  const envelope = payload?.data ?? payload ?? {};

  // Laravel validation responses: { message, errors: { field: ["..."] } }
  const fieldErrors = payload?.errors || envelope?.errors;
  let validationReason = "";
  if (fieldErrors && typeof fieldErrors === "object") {
    const first = Object.values(fieldErrors).flat().find(Boolean);
    if (first) validationReason = String(first);
  }

  return {
    ok: false,
    message:
      validationReason ||
      envelope.reason ||
      envelope.message ||
      payload.message ||
      error?.message ||
      "An error occurred",
    reason:
      validationReason ||
      envelope.reason ||
      envelope.message ||
      payload.message ||
      "",
    data: envelope.data ?? null,
    raw: envelope,
  };
}
