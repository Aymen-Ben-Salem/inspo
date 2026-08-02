const CLOUDINARY_HOSTNAME = "res.cloudinary.com";
const DELIVERY_OPTIMIZATION = "q_auto/f_auto";

function isCloudinaryUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === CLOUDINARY_HOSTNAME;
  } catch {
    return false;
  }
}

function hasDeliveryOptimization(value: string) {
  return /(?:^|\/)(?:q_auto(?::[^/]*)?\/f_auto(?::[^/]*)?|f_auto(?::[^/]*)?\/q_auto(?::[^/]*)?)(?:\/|$)/.test(
    value,
  );
}

function addDeliveryOptimization(
  value: string,
  resourceType: "image" | "video",
) {
  if (!isCloudinaryUrl(value)) return value;

  const marker = `/${resourceType}/upload/`;
  const markerIndex = value.indexOf(marker);
  if (markerIndex === -1) return value;

  const deliveryPath = value.slice(markerIndex + marker.length);
  if (hasDeliveryOptimization(deliveryPath)) return value;

  return value.replace(marker, `${marker}${DELIVERY_OPTIMIZATION}/`);
}

export function optimizeCloudinaryAnimatedImageUrl(value: string) {
  return addDeliveryOptimization(value, "image");
}

export function optimizeCloudinaryVideoUrl(value: string) {
  return addDeliveryOptimization(value, "video");
}

export function optimizeCloudinaryPosterUrl(value: string) {
  if (!isCloudinaryUrl(value)) return value;

  if (value.includes("/image/upload/")) {
    return addDeliveryOptimization(value, "image");
  }

  const marker = "/video/upload/";
  const markerIndex = value.indexOf(marker);
  if (markerIndex === -1) return value;

  const deliveryPath = value.slice(markerIndex + marker.length);
  if (hasDeliveryOptimization(deliveryPath)) return value;

  if (deliveryPath.startsWith("so_0,f_jpg/")) {
    return value.replace(
      `${marker}so_0,f_jpg/`,
      `${marker}so_0/${DELIVERY_OPTIMIZATION}/`,
    );
  }

  if (deliveryPath.startsWith("so_0/f_jpg/")) {
    return value.replace(
      `${marker}so_0/f_jpg/`,
      `${marker}so_0/${DELIVERY_OPTIMIZATION}/`,
    );
  }

  return value.replace(marker, `${marker}${DELIVERY_OPTIMIZATION}/`);
}
