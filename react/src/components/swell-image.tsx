// An image stored in Swell (product.images[].file.url). Swell's CDN scales it to
// the width in the URL, and crops it to fit when a height is given as well.
export default function SwellImage({
  src,
  alt,
  width,
  height,
}: Readonly<{ src: string; alt: string; width: number; height?: number }>) {
  const url = URL.parse(src)
  // Twice the displayed size, for high-density screens.
  url?.searchParams.set('width', String(width * 2))
  if (height) url?.searchParams.set('height', String(height * 2))
  return <img src={url?.href ?? src} alt={alt} width={width} height={height} loading="lazy" />
}
