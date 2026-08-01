"use client";

import { type PropsWithChildren, useEffect, useRef, useState } from "react";

export function CollapsingHeader({ children }: PropsWithChildren) {
  const threshold = useRef<HTMLSpanElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const marker = threshold.current;

    if (!marker || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setIsCompact(!entry.isIntersecting);
    });

    observer.observe(marker);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span
        ref={threshold}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-6 size-px"
      />
      <header className="sticky top-0 z-40 bg-white">
        <div
          className={`mx-auto flex max-w-[1705px] items-center gap-5 px-4 pb-5 transition-[padding-top] duration-300 ease-out motion-reduce:transition-none sm:px-5 2xl:px-11 ${
            isCompact ? "pt-0" : "pt-10"
          }`}
        >
          {children}
        </div>
      </header>
    </>
  );
}
