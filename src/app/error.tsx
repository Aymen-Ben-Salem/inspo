"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <h1 className="text-xl font-medium">The archive could not be loaded.</h1>
      <p className="max-w-sm text-sm leading-relaxed text-[#666]">
        The connection failed before the posts arrived. Try the request again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="focus-ring rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-[#222]"
      >
        Try again
      </button>
    </main>
  );
}
