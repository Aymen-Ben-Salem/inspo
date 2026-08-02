import Image from "next/image";

export function BrandMark({
  priority = false,
  responsive = false,
}: {
  priority?: boolean;
  responsive?: boolean;
}) {
  return (
    <span
      className={`relative block overflow-hidden ${
        responsive
          ? "h-[35px] w-[39px] lg:h-[37px] lg:w-[41px] 2xl:h-[39px] 2xl:w-[43px] min-[1700px]:h-[41px] min-[1700px]:w-[45px]"
          : "h-[41px] w-[45px]"
      }`}
      aria-hidden="true"
    >
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
