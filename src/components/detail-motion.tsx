"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PropsWithChildren, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function DetailMotion({ children }: PropsWithChildren) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const items = gsap.utils.toArray<HTMLElement>("[data-detail-media]");
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0.45, scale: 0.96 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              scroller: scope.current,
              start: "top 85%",
              once: true,
            },
          },
        );
      });
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      className="flex min-h-0 flex-1 snap-y snap-mandatory flex-col gap-4 overflow-y-auto bg-[#f3f3f3] p-3 sm:p-6 lg:p-10"
    >
      {children}
    </div>
  );
}
