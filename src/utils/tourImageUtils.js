const DATA_URL_RE = /^data:([^;]+);base64,(.+)$/;
const REMOTE_URL_RE = /^https?:\/\//i;

export const MAX_FEATURE_IMAGES = 5;
export const MAX_FEATURE_IMAGES_TOTAL_BYTES = 10 * 1024 * 1024;

export function isImageObject(value) {
  return value && typeof value === "object" && ("uri" in value || "data" in value);
}

export function normalizeTourImage(value, fallbackUri = "") {
  if (!value) {
    return { uri: fallbackUri, data: "", mimeType: "image/jpeg" };
  }
  if (typeof value === "string") {
    return { uri: value, data: "", mimeType: "image/jpeg" };
  }
  return {
    uri: value.uri || fallbackUri,
    data: value.data || "",
    mimeType: value.mimeType || "image/jpeg",
  };
}

export function getImageDataByteSize(image) {
  if (!image?.data) return 0;
  let data = image.data;
  if (data.startsWith("data:")) {
    const match = data.match(DATA_URL_RE);
    data = match?.[2] || "";
  }
  return Math.floor((data.length * 3) / 4);
}

export function getFeatureImagesTotalBytes(images, replaceIndex = -1, replacement = null) {
  return (images || []).reduce((sum, img, index) => {
    if (index === replaceIndex) {
      return sum + getImageDataByteSize(replacement);
    }
    return sum + getImageDataByteSize(img);
  }, 0);
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateFeatureImageFile(file, images, replaceIndex = -1) {
  if ((images?.length || 0) >= MAX_FEATURE_IMAGES && replaceIndex < 0) {
    return `You can upload up to ${MAX_FEATURE_IMAGES} feature images.`;
  }

  const currentTotal = getFeatureImagesTotalBytes(images || [], replaceIndex, { data: "", mimeType: file.type });
  const nextTotal = currentTotal + file.size;

  if (nextTotal > MAX_FEATURE_IMAGES_TOTAL_BYTES) {
    const remaining = Math.max(0, MAX_FEATURE_IMAGES_TOTAL_BYTES - currentTotal);
    return `Feature images must stay within 10 MB total. You have ${formatBytes(remaining)} remaining.`;
  }

  return "";
}

export function validateFeatureImagesCollection(images) {
  const list = (images || []).filter((img) => img?.uri || img?.data);
  if (list.length > MAX_FEATURE_IMAGES) {
    return `Maximum ${MAX_FEATURE_IMAGES} feature images allowed.`;
  }
  const total = getFeatureImagesTotalBytes(list);
  if (total > MAX_FEATURE_IMAGES_TOTAL_BYTES) {
    return `Feature images exceed the 10 MB total limit (${formatBytes(total)}).`;
  }
  return "";
}

export function normalizeTourImages(tour) {
  if (!tour) return tour;

  const coverImage = normalizeTourImage(tour.coverImage ?? tour.coverImageUrl, "");
  const sourceFeatureImages = tour.featureImages ?? tour.galleryImages ?? tour.galleryImageUrls ?? [];
  const featureImages = sourceFeatureImages
    .slice(0, MAX_FEATURE_IMAGES)
    .map((item, index) => normalizeTourImage(item, `feature-${index + 1}.jpg`));

  return {
    ...tour,
    coverImage,
    featureImages,
    coverImageUrl: getImagePreviewSrc(coverImage),
    featureImageUrls: featureImages.map(getImagePreviewSrc).filter(Boolean),
    galleryImages: featureImages,
    galleryImageUrls: featureImages.map(getImagePreviewSrc).filter(Boolean),
  };
}

export function getImagePreviewSrc(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (image.data) {
    if (image.data.startsWith("data:")) return image.data;
    const mime = image.mimeType || "image/jpeg";
    return `data:${mime};base64,${image.data}`;
  }
  return image.uri || "";
}

export function isRemoteImageUrl(value) {
  return typeof value === "string" && REMOTE_URL_RE.test(value);
}

export function hasUploadedImageData(image) {
  if (!image) return false;
  if (typeof image === "string") return image.startsWith("data:");
  return Boolean(normalizeTourImage(image).data);
}

/** Returns an https URL for unchanged images, or a base64 data URI for new uploads. */
export function resolveImageForApiPayload(image, fallbackUrl = "") {
  const normalized = normalizeTourImage(image, fallbackUrl);

  if (normalized.data) {
    return getImagePreviewSrc(normalized);
  }

  const candidate = normalized.uri || fallbackUrl;
  if (isRemoteImageUrl(candidate)) {
    return candidate;
  }

  return fallbackUrl || "";
}

export function toApiImagePayload(image) {
  const normalized = normalizeTourImage(image);
  let data = normalized.data;
  let mimeType = normalized.mimeType;

  if (data.startsWith("data:")) {
    const match = data.match(DATA_URL_RE);
    if (match) {
      mimeType = match[1];
      data = match[2];
    }
  }

  return {
    uri: normalized.uri,
    data,
    ...(mimeType ? { mimeType } : {}),
  };
}

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const match = dataUrl.match(DATA_URL_RE);
      const mimeType = match?.[1] || file.type || "image/jpeg";
      const data = match?.[2] || "";
      const uri = file.name || `upload-${Date.now()}.jpg`;

      resolve({
        uri,
        data,
        mimeType,
      });
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

export function defaultFeatureImage(index = 0) {
  return normalizeTourImage(null, `feature-${index + 1}.jpg`);
}
