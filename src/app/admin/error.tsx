"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto grid min-h-[55dvh] max-w-xl place-content-center text-center">
      <p className="text-xs uppercase tracking-[0.16em] text-[#777]">Admin error</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em]">
        That operation did not complete.
      </h1>
      <p className="mt-3 leading-relaxed text-[#666]">
        Nothing was partially saved. Try again, and check the server log if the problem continues.
      </p>
      <button
        type="button"
        onClick={reset}
        className="focus-ring mx-auto mt-6 h-11 rounded-full bg-black px-5 text-sm font-medium text-white"
      >
        Try again
      </button>
    </section>
  );
}
