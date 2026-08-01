import Image from "next/image";

export function BrandMark({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      src="/brand/n-mark.png"
      alt=""
      width={45}
      height={41}
      priority={priority}
      className="h-[41px] w-[45px] object-cover"
    />
  );
}
