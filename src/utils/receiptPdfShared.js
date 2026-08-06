import { images } from "../config/images";

export const PDF_COLORS = {
  green: [45, 90, 71],
  orange: [212, 97, 26],
  gold: [227, 160, 32],
  cream: [255, 248, 235],
  ink: [28, 43, 38],
  muted: [90, 107, 100],
  border: [224, 216, 200],
  white: [255, 255, 255],
};

const RECEIPT_LOGO_MAX_HEIGHT_MM = 14;
const RECEIPT_LOGO_MAX_WIDTH_MM = 28;

let cachedReceiptLogo = null;

export async function loadReceiptLogoAsset() {
  if (cachedReceiptLogo) return cachedReceiptLogo;

  try {
    const response = await fetch(images.general_logo);
    if (!response.ok) return null;

    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

    if (!dataUrl) return null;

    const dimensions = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Could not decode receipt logo"));
      image.src = dataUrl;
    });

    cachedReceiptLogo = {
      dataUrl,
      format: dataUrl.includes("image/jpeg") ? "JPEG" : "PNG",
      width: dimensions.width,
      height: dimensions.height,
    };

    return cachedReceiptLogo;
  } catch (error) {
    console.warn("Receipt logo unavailable:", error);
    return null;
  }
}

export function getReceiptLogoPlacement(logoAsset, headerHeightMm, margin, y) {
  if (!logoAsset?.dataUrl || !logoAsset.width || !logoAsset.height) return null;

  const aspect = logoAsset.width / logoAsset.height;
  let heightMm = RECEIPT_LOGO_MAX_HEIGHT_MM;
  let widthMm = heightMm * aspect;

  if (widthMm > RECEIPT_LOGO_MAX_WIDTH_MM) {
    widthMm = RECEIPT_LOGO_MAX_WIDTH_MM;
    heightMm = widthMm / aspect;
  }

  const x = margin + 6;
  const logoY = y + (headerHeightMm - heightMm) / 2;

  return {
    dataUrl: logoAsset.dataUrl,
    format: logoAsset.format,
    widthMm,
    heightMm,
    x,
    y: logoY,
    textX: x + widthMm + 5,
  };
}

export function buildPdfFilename(prefix, ref) {
  const safeRef = String(ref || "receipt").replace(/[^\w-]/g, "_");
  return `${prefix}-${safeRef}.pdf`;
}

export function sanitizePdfText(value) {
  return String(value ?? "—")
    .replace(/[^\x20-\x7E]/g, (char) => {
      if (char === "—") return "-";
      return "";
    })
    .trim() || "-";
}

export function setPdfFillColor(doc, [r, g, b]) {
  doc.setFillColor(r, g, b);
}

export function setPdfTextColor(doc, [r, g, b]) {
  doc.setTextColor(r, g, b);
}

export function setPdfDrawColor(doc, [r, g, b]) {
  doc.setDrawColor(r, g, b);
}

export function drawPdfField(doc, label, value, x, y, maxWidth) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setPdfTextColor(doc, PDF_COLORS.muted);
  doc.text(sanitizePdfText(label).toUpperCase(), x, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setPdfTextColor(doc, PDF_COLORS.ink);
  const lines = doc.splitTextToSize(sanitizePdfText(value), maxWidth);
  doc.text(lines, x, y + 5);

  return y + 5 + lines.length * 5 + 7;
}

export function drawPdfAccentBar(doc, margin, y, contentWidth) {
  const accentW = contentWidth / 3;
  setPdfFillColor(doc, PDF_COLORS.green);
  doc.rect(margin, y, accentW, 1.5, "F");
  setPdfFillColor(doc, PDF_COLORS.gold);
  doc.rect(margin + accentW, y, accentW, 1.5, "F");
  setPdfFillColor(doc, PDF_COLORS.orange);
  doc.rect(margin + accentW * 2, y, accentW, 1.5, "F");
  return y + 1.5;
}

export function drawPdfBrandedHeader(doc, {
  margin,
  y,
  contentWidth,
  logoAsset,
  title,
  subtitle,
  badgeText = "",
}) {
  const headerH = 26;
  const logoPlacement = getReceiptLogoPlacement(logoAsset, headerH, margin, y);
  const headerTextX = logoPlacement?.textX ?? margin + 8;

  setPdfFillColor(doc, PDF_COLORS.green);
  doc.rect(margin, y, contentWidth, headerH, "F");

  if (logoPlacement) {
    doc.addImage(
      logoPlacement.dataUrl,
      logoPlacement.format,
      logoPlacement.x,
      logoPlacement.y,
      logoPlacement.widthMm,
      logoPlacement.heightMm,
      undefined,
      "FAST",
    );
  }

  setPdfTextColor(doc, PDF_COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(sanitizePdfText(title), headerTextX, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(sanitizePdfText(subtitle), headerTextX, y + 17);

  if (badgeText) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const badgeW = doc.getTextWidth(badgeText) + 10;
    const badgeX = margin + contentWidth - badgeW - 8;
    setPdfFillColor(doc, PDF_COLORS.gold);
    doc.roundedRect(badgeX, y + 7, badgeW, 8, 4, 4, "F");
    setPdfTextColor(doc, PDF_COLORS.white);
    doc.text(badgeText, badgeX + 5, y + 12.5);
  }

  return y + headerH;
}

export function drawPdfFooter(doc, { margin, contentWidth, footerY, lines = [] }) {
  setPdfDrawColor(doc, PDF_COLORS.border);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  let lineY = footerY + 7;
  lines.forEach((line, index) => {
    doc.setFont("helvetica", index === lines.length - 1 ? "bold" : "normal");
    doc.setFontSize(index === 0 ? 9 : 8);
    setPdfTextColor(doc, index === lines.length - 1 ? PDF_COLORS.ink : PDF_COLORS.muted);
    doc.text(sanitizePdfText(line), margin + 8, lineY);
    lineY += index === 0 ? 6 : 5;
  });
}
