const VARIANT_SPECS = {
  profile: { width: 512, height: 512, fit: "cover", quality: 0.84 },
  destination: { width: 1280, height: 800, fit: "cover", quality: 0.82 },
  tour: { width: 1600, height: 1000, fit: "cover", quality: 0.82 },
  hero: { width: 1920, height: 1080, fit: "cover", quality: 0.8 },
  logo: { width: 800, height: 800, fit: "contain", quality: 0.9 },
  generic: { width: 1600, height: 1000, fit: "cover", quality: 0.82 },
};

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

export async function optimizeImageFile(file, variant = "generic") {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const spec = getImageVariantSpec(variant);

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

    if (spec.fit === "cover") {
      const targetRatio = spec.width / spec.height;
      const srcRatio = srcW / srcH;
      if (srcRatio > targetRatio) {
        sw = Math.round(srcH * targetRatio);
        sx = Math.round((srcW - sw) / 2);
      } else {
        sh = Math.round(srcW / targetRatio);
        sy = Math.round((srcH - sh) / 2);
      }
      outW = Math.min(spec.width, sw);
      outH = Math.min(spec.height, sh);
    } else {
      const scale = Math.min(spec.width / srcW, spec.height / srcH, 1);
      outW = Math.max(1, Math.round(srcW * scale));
      outH = Math.max(1, Math.round(srcH * scale));
    }

    canvas.width = outW;
    canvas.height = outH;
    context.drawImage(image, sx, sy, sw, sh, 0, 0, outW, outH);

    const outputType = file.type === "image/png" && spec.fit === "contain" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, outputType, spec.quality);
    const extension = outputType === "image/png" ? "png" : "jpg";
    const baseName = (file.name || "upload").replace(/\.[^.]+$/, "");

    return new File([blob], `${baseName}.${extension}`, { type: outputType });
  } catch {
    return file;
  }
}
