export const AUDIENCE_SCOPE = {
  LOCAL: "local",
  GLOBAL: "global",
  FOREIGN: "foreign",
};

export const AUDIENCE_SCOPE_OPTIONS = [
  {
    id: AUDIENCE_SCOPE.LOCAL,
    label: "Ghana only",
    description: "Local audience — Ghana Cedis (GHS) pricing only.",
  },
  {
    id: AUDIENCE_SCOPE.GLOBAL,
    label: "Ghana + international",
    description: "Both markets — GHS for local buyers and USD for international buyers.",
  },
  {
    id: AUDIENCE_SCOPE.FOREIGN,
    label: "International only",
    description: "Foreign audience — US Dollars (USD) pricing only.",
  },
];

export function isGlobalAudience(scope) {
  return scope === AUDIENCE_SCOPE.GLOBAL;
}

export function isLocalAudience(scope) {
  return scope === AUDIENCE_SCOPE.LOCAL;
}

export function isForeignAudience(scope) {
  return scope === AUDIENCE_SCOPE.FOREIGN;
}
