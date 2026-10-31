const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Logo Dolphin Software (mark) — sidebar / dock Tổng quan. */
export function BrandMark({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${basePath}/brand/logo-dolphin.webp`}
      alt="Dolphin"
      width={40}
      height={40}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
