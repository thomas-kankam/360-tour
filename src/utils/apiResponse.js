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
  const envelope = error?.response?.data?.data ?? error?.response?.data ?? {};

  return {
    ok: false,
    message: envelope.reason || envelope.message || error?.message || "An error occurred",
    reason: envelope.reason || envelope.message || "",
    data: envelope.data ?? null,
    raw: envelope,
  };
}
