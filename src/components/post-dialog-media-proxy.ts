function getMediaElement(element: HTMLElement | undefined) {
  if (
    element instanceof HTMLImageElement ||
    element instanceof HTMLVideoElement
  ) {
    return element;
  }

  return element?.querySelector<HTMLImageElement | HTMLVideoElement>(
    "img, video",
  );
}

function getMediaSource(element: HTMLElement | undefined) {
  const media = getMediaElement(element);

  if (media instanceof HTMLImageElement) {
    return media.currentSrc || media.src;
  }

  return media?.poster;
}

export function getCornerRadius(element: HTMLElement) {
  return Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
}

export function getCompensatedRadius(
  visualRadius: number,
  scaleX: number,
  scaleY: number,
) {
  const averageScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
  return averageScale > 0 ? visualRadius / averageScale : visualRadius;
}

export function createMediaProxy({
  fallback,
  media,
  rect,
  root,
}: {
  fallback?: HTMLElement;
  media: HTMLElement;
  rect: DOMRect;
  root: HTMLElement;
}) {
  const src = getMediaSource(media) || getMediaSource(fallback);

  if (!src) return undefined;

  const mediaElement = getMediaElement(media) ?? getMediaElement(fallback);
  const proxy = document.createElement("div");
  const proxyImage = document.createElement("img");

  proxy.dataset.postDialogMediaProxy = "";
  Object.assign(proxy.style, {
    background: "#f3f3f3",
    height: `${rect.height}px`,
    left: `${rect.left}px`,
    overflow: "hidden",
    pointerEvents: "none",
    position: "fixed",
    top: `${rect.top}px`,
    transformOrigin: "top left",
    width: `${rect.width}px`,
    willChange: "transform, border-radius, box-shadow",
    zIndex: "3",
  });

  proxyImage.alt = "";
  proxyImage.decoding = "async";
  proxyImage.draggable = false;
  proxyImage.src = src;
  Object.assign(proxyImage.style, {
    display: "block",
    height: "100%",
    objectFit: "cover",
    objectPosition: mediaElement
      ? getComputedStyle(mediaElement).objectPosition
      : "50% 50%",
    width: "100%",
  });

  proxy.appendChild(proxyImage);
  root.appendChild(proxy);

  return proxy;
}
