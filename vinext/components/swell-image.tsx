// An image stored in Swell (product.images[].file.url). Swell's CDN scales it to
// the width in the URL, and crops it to fit when a height is given as well.
export default function SwellImage({
  src,
  alt,
  width,
  height,
  className,
}: Readonly<{ src: string; alt: string; width: number; height?: number; className?: string }>) {
  let sized = src;
  try {
    const url = new URL(src);
    // Twice the displayed size, for high-density screens.
    url.searchParams.set("width", String(width * 2));
    if (height) url.searchParams.set("height", String(height * 2));
    sized = url.href;
  } catch {
    // Not an absolute URL: use it as it is.
  }
  return <img src={sized} alt={alt} width={width} height={height} loading="lazy" className={className} />;
}
