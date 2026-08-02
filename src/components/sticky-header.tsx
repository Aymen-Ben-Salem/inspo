import type { PropsWithChildren } from "react";

export function StickyHeader({ children }: PropsWithChildren) {
  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="mx-auto flex max-w-[1705px] items-center gap-5 px-4 py-[18px] sm:px-5 2xl:px-11">
        {children}
      </div>
    </header>
  );
}
