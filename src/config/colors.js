/**
 * 360 Tours Ghana brand palette, lifted from the logo's Ghana flag roundel.
 * Green = primary | Gold = accent/highlight | Red = urgency & CTA pop | Cream/sand = base
 * Kept in sync with the `brand.*` scale in tailwind.config.js.
 */
export const brandColors = {
  green: "#006B3F",
  greenDark: "#00512F",
  greenLight: "#0A8A54",
  gold: "#FCD116",
  goldDark: "#D9B200",
  goldLight: "#FFE571",
  red: "#CE1126",
  redDark: "#A20D1E",
  charcoal: "#0B0B0B",
  cream: "#FCF8F0",
  sand: "#F4EBDA",
  ink: "#17130E",
  muted: "#655C4E",
  border: "#E6DBC6",

  /* legacy aliases retained for charts and PDF helpers that import by old names */
  orange: "#CE1126",
  orangeDark: "#A20D1E",
};

/** Ordered flag sequence — use for kente stripes, chart series, and step indicators. */
export const kenteSequence = [brandColors.red, brandColors.gold, brandColors.green, brandColors.charcoal];
