/**
 * Turns a single inclusion line into a short headline + plain-language detail
 * for guest-facing tour pages.
 *
 * Supported formats (operators can use any of these):
 * - "Meals — Daily breakfast included"
 * - "Meals: Daily breakfast included"
 * - "Accommodation (3–4 star hotels)"
 */
export function parseInclusionItemText(text) {
  const value = String(text || "").trim();
  if (!value) {
    return { title: "", description: "" };
  }

  const parentheticalMatch = value.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parentheticalMatch) {
    return {
      title: parentheticalMatch[1].trim(),
      description: parentheticalMatch[2].trim(),
    };
  }

  const emDashMatch = value.match(/^(.+?)\s*[—–]\s*(.+)$/);
  if (emDashMatch) {
    return {
      title: emDashMatch[1].trim(),
      description: emDashMatch[2].trim(),
    };
  }

  const colonMatch = value.match(/^([^:]+):\s*(.+)$/);
  if (colonMatch && colonMatch[1].length <= 48) {
    return {
      title: colonMatch[1].trim(),
      description: colonMatch[2].trim(),
    };
  }

  const hyphenMatch = value.match(/^([^-]+?)\s+-\s+(.+)$/);
  if (hyphenMatch && hyphenMatch[1].length <= 48 && !/\d-\d/.test(value)) {
    return {
      title: hyphenMatch[1].trim(),
      description: hyphenMatch[2].trim(),
    };
  }

  return { title: value, description: "" };
}

export const INCLUSION_ITEM_PLACEHOLDER = "Meals — Daily breakfast included";

export const INCLUSION_ITEM_HINT =
  "Write a short label and a plain detail, e.g. “Airport transfers — Pickup on arrival and drop-off on departure”.";

export const EXCLUSION_ITEM_PLACEHOLDER = "Flights — International airfare to and from your destination";

export const EXCLUSION_ITEM_HINT =
  "List costs travelers pay separately, e.g. “Travel insurance — Not included but strongly recommended”.";
