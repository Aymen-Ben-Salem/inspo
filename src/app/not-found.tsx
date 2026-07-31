import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-sm text-[#777]">404</p>
      <h1 className="text-xl font-medium">This post is no longer in the archive.</h1>
      <Link href="/" className="focus-ring rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-[#222]">
        Back to inspiration
      </Link>
    </main>
  );
}
