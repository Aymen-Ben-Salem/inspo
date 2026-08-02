import type { PropsWithChildren } from "react";

export function StickyHeader({ children }: PropsWithChildren) {
  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="mx-auto flex max-w-[1705px] items-center gap-3 px-4 py-4 sm:px-5 lg:gap-4 lg:py-[17px] xl:px-6 2xl:px-8 min-[1700px]:gap-5 min-[1700px]:px-11 min-[1700px]:py-[18px]">
        {children}
      </div>
    </header>
  );
}
