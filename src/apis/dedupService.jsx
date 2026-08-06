
const inFlight = new Map();

function stableStringify(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function serializeBody(body) {
  if (body == null) return "";
  if (typeof body === "string") return body;
  if (body instanceof FormData) return "[FormData]";
  if (body instanceof URLSearchParams) return body.toString();

  try {
    return stableStringify(body);
  } catch {
    return String(body);
  }
}

function normalizeParams(params) {
  if (!params) return "";
  if (params instanceof URLSearchParams) return params.toString();
  return stableStringify(params);
}

export function buildRequestKey({ method = "GET", url = "", params, body } = {}) {
  const normalizedMethod = String(method).toUpperCase();
  const paramKey = normalizeParams(params);
  const bodyKey = serializeBody(body);
  return `${normalizedMethod}:${url}?${paramKey}#${bodyKey}`;
}

export function dedupeRequest(key, requestFn, { skip = false } = {}) {
  if (skip || !key) {
    return Promise.resolve().then(requestFn);
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const promise = Promise.resolve()
    .then(requestFn)
    .finally(() => {
      if (inFlight.get(key) === promise) {
        inFlight.delete(key);
      }
    });

  inFlight.set(key, promise);
  return promise;
}

export function clearDedupKey(key) {
  inFlight.delete(key);
}

export function clearAllDedup() {
  inFlight.clear();
}

export function getInFlightCount() {
  return inFlight.size;
}

export function withDedup(fetchFn) {
  return (url, options = {}) => {
    const key = buildRequestKey({
      method: options.method,
      url,
      body: options.body,
    });

    return dedupeRequest(key, () => fetchFn(url, options));
  };
}

const dedupService = {
  buildRequestKey,
  dedupeRequest,
  clearDedupKey,
  clearAllDedup,
  getInFlightCount,
  withDedup,
};

export default dedupService;
