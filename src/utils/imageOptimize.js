const VARIANT_SPECS = {
  profile: { width: 512, height: 512, fit: "cover", quality: 0.84, maxBytes: 400 * 1024 },
  destination: { width: 1280, height: 800, fit: "cover", quality: 0.82, maxBytes: 1800 * 1024 },
  tour: { width: 1600, height: 1000, fit: "cover", quality: 0.82, maxBytes: 1900 * 1024 },
  hero: { width: 1920, height: 1080, fit: "cover", quality: 0.8, maxBytes: 1900 * 1024 },
  logo: { width: 800, height: 800, fit: "contain", quality: 0.9, maxBytes: 600 * 1024 },
  generic: { width: 1600, height: 1000, fit: "cover", quality: 0.82, maxBytes: 1900 * 1024 },
};

/** Client-side upload cap — large originals are compressed to fit this before upload. */
export const UPLOAD_MAX_BYTES = 2 * 1024 * 1024;

export function getImageVariantSpec(variant = "generic") {
  return VARIANT_SPECS[variant] || VARIANT_SPECS.generic;
}

export function isTrustedMediaUrl(value) {
  const image = String(value || "").trim();
  if (!image) return true;
  if (image.startsWith("data:")) return true;
  if (image.startsWith("/")) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(image)) return true;
  if (image.includes("/storage/")) return true;
  return false;
}

export function dataUrlToFile(dataUrl, filename = "upload.jpg") {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;

  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const extension = mime.split("/")[1] || "jpg";
  return new File([bytes], filename.replace(/\.[^.]+$/, "") + `.${extension}`, { type: mime });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not optimize image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function optimizeImageFile(file, variant = "generic", options = {}) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const spec = getImageVariantSpec(variant);
  const quality = options.quality ?? spec.quality;
  const widthScale = options.widthScale ?? 1;
  const heightScale = options.heightScale ?? 1;

  try {
    const image = await loadImage(file);
    const srcW = image.naturalWidth || image.width;
    const srcH = image.naturalHeight || image.height;
    if (!srcW || !srcH) return file;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return file;

    let sx = 0;
    let sy = 0;
    let sw = srcW;
    let sh = srcH;
    let outW;
    let outH;
    const targetWidth = Math.max(1, Math.round(spec.width * widthScale));
    const targetHeight = Math.max(1, Math.round(spec.height * heightScale));

    if (spec.fit === "cover") {
      const targetRatio = targetWidth / targetHeight;
      const srcRatio = srcW / srcH;
      if (srcRatio > targetRatio) {
        sw = Math.round(srcH * targetRatio);
        sx = Math.round((srcW - sw) / 2);
      } else {
        sh = Math.round(srcW / targetRatio);
        sy = Math.round((srcH - sh) / 2);
      }
      outW = Math.min(targetWidth, sw);
      outH = Math.min(targetHeight, sh);
    } else {
      const scale = Math.min(targetWidth / srcW, targetHeight / srcH, 1);
      outW = Math.max(1, Math.round(srcW * scale));
      outH = Math.max(1, Math.round(srcH * scale));
    }

    canvas.width = outW;
    canvas.height = outH;
    context.drawImage(image, sx, sy, sw, sh, 0, 0, outW, outH);

    const outputType = file.type === "image/png" && spec.fit === "contain" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, outputType, quality);
    const extension = outputType === "image/png" ? "png" : "jpg";
    const baseName = (file.name || "upload").replace(/\.[^.]+$/, "");

    return new File([blob], `${baseName}.${extension}`, { type: outputType });
  } catch {
    return file;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Resize/compress an image to fit upload limits before sending to the server. */
export async function prepareImageForUpload(file, variant = "generic", maxBytes = UPLOAD_MAX_BYTES) {
  const originalSize = file?.size ?? 0;
  const spec = getImageVariantSpec(variant);
  const targetMax = Math.min(maxBytes, UPLOAD_MAX_BYTES);

  let optimized = await optimizeImageFile(file, variant);
  let quality = spec.quality;
  let scale = 1;
  let attempts = 0;

  while (optimized.size > targetMax && attempts < 28) {
    attempts += 1;

    if (quality > 0.3) {
      quality = Math.max(0.3, quality - 0.06);
    } else if (scale > 0.32) {
      scale = Math.max(0.32, scale * 0.82);
    } else {
      break;
    }

    optimized = await optimizeImageFile(file, variant, {
      quality,
      widthScale: scale,
      heightScale: scale,
    });
  }

  return {
    file: optimized,
    originalSize,
    optimizedSize: optimized.size,
    wasOptimized: optimized.size < originalSize || optimized !== file,
    savedLabel:
      originalSize > optimized.size
        ? `Optimized ${formatBytes(originalSize)} → ${formatBytes(optimized.size)}`
        : "",
  };
}

/** Optimize first, then fail only if the result is still above the upload cap. */
export async function processImageUploadFile(file, variant = "generic", maxBytes = UPLOAD_MAX_BYTES) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const prepared = await prepareImageForUpload(file, variant, maxBytes);

  if (prepared.file.size > maxBytes) {
    throw new Error(
      `Could not compress this image below 2 MB (still ${formatBytes(prepared.file.size)}). Try cropping or a smaller photo.`,
    );
  }

  return prepared;
}
