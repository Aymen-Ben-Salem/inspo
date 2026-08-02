import Image from "next/image";

export function BrandMark({ priority = false }: { priority?: boolean }) {
  return (
    <span className="relative block h-[41px] w-[45px] overflow-hidden" aria-hidden="true">
      <Image
        src="/brand/n-mark.png"
        alt=""
        width={80}
        height={80}
        priority={priority}
        className="absolute left-[-41.55%] top-[-48.9%] h-[196.01%] w-[176.62%] max-w-none"
      />
    </span>
  );
}
