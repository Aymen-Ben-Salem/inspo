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

function getImageSource(media: HTMLImageElement) {
  return media.currentSrc || media.src;
}

function getVideoSource(video: HTMLVideoElement) {
  return video.currentSrc || video.src;
}

function configureProxyMedia(
  proxyMedia: HTMLImageElement | HTMLVideoElement,
  sourceMedia: HTMLImageElement | HTMLVideoElement,
) {
  Object.assign(proxyMedia.style, {
    display: "block",
    height: "100%",
    objectFit: "cover",
    objectPosition: getComputedStyle(sourceMedia).objectPosition,
    width: "100%",
  });

  proxyMedia.draggable = false;

  if (proxyMedia instanceof HTMLImageElement) {
    proxyMedia.alt = "";
    proxyMedia.decoding = "async";
  }
}

function createVideoProxy(source: HTMLVideoElement) {
  const src = getVideoSource(source);

  if (!src) return undefined;

  const video = document.createElement("video");
  const syncPlayback = () => {
    if (Number.isFinite(source.currentTime)) {
      try {
        video.currentTime = source.currentTime;
      } catch {
        // Metadata may not be ready yet; playback still starts from the poster.
      }
    }

    void video.play().catch(() => undefined);
  };

  video.autoplay = true;
  video.controls = false;
  video.defaultMuted = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.poster = source.poster;
  video.src = src;

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    syncPlayback();
  } else {
    video.addEventListener("loadedmetadata", syncPlayback, { once: true });
  }

  return video;
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
  videoPlaybackSource = "media",
}: {
  fallback?: HTMLElement;
  media: HTMLElement;
  rect: DOMRect;
  root: HTMLElement;
  videoPlaybackSource?: "fallback" | "media";
}) {
  const primaryMedia = getMediaElement(media);
  const fallbackMedia = getMediaElement(fallback);
  const mediaElement = primaryMedia ?? fallbackMedia;

  if (!mediaElement) return undefined;

  const videoSource =
    videoPlaybackSource === "fallback" &&
    fallbackMedia instanceof HTMLVideoElement
      ? fallbackMedia
      : primaryMedia instanceof HTMLVideoElement
        ? primaryMedia
        : fallbackMedia instanceof HTMLVideoElement
          ? fallbackMedia
          : undefined;
  const proxyMedia = videoSource
    ? createVideoProxy(videoSource)
    : mediaElement instanceof HTMLImageElement
      ? document.createElement("img")
      : undefined;

  if (!proxyMedia) return undefined;

  if (proxyMedia instanceof HTMLImageElement) {
    const imageSource =
      primaryMedia instanceof HTMLImageElement
        ? primaryMedia
        : fallbackMedia instanceof HTMLImageElement
          ? fallbackMedia
          : undefined;

    if (!imageSource) return undefined;
    proxyMedia.src = getImageSource(imageSource);
  }

  const proxy = document.createElement("div");

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

  configureProxyMedia(proxyMedia, videoSource ?? mediaElement);
  proxy.appendChild(proxyMedia);
  root.appendChild(proxy);

  return proxy;
}
