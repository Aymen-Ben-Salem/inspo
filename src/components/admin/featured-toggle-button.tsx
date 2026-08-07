"use client";

import { useFormStatus } from "react-dom";

export function FeaturedToggleButton({
  title,
  isFeatured,
}: {
  title: string;
  isFeatured: boolean;
}) {
  const { pending } = useFormStatus();
  const action = isFeatured ? "Remove from Featured" : "Add to Featured";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`${action}: ${title}`}
      title={action}
      className={`focus-ring grid size-9 place-items-center rounded-full border shadow-sm backdrop-blur-md transition-[background,color,transform,opacity] hover:scale-105 disabled:cursor-wait disabled:opacity-60 ${
        isFeatured
          ? "border-black bg-black text-white"
          : "border-white/70 bg-white/85 text-black hover:bg-white"
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-[17px]">
        <path
          d="m10 2.3 2.25 4.56 5.03.73-3.64 3.55.86 5.01L10 13.79l-4.5 2.36.86-5.01L2.72 7.59l5.03-.73L10 2.3Z"
          fill={isFeatured ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
