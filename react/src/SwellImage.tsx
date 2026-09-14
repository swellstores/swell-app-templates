type Props = { src: string; alt: string; sizes?: string };

// Supply a product/content image URL from Swell CDN. Bundled files use normal img tags.
export function SwellImage({ src, alt, sizes = '(max-width: 640px) 100vw, 640px' }: Props) {
  const source = new URL(src);
  if (source.protocol !== 'https:' || source.hostname !== 'cdn.swell.store') {
    throw new Error('SwellImage requires a https://cdn.swell.store image URL');
  }
  const resized = (width: number) => {
    const url = new URL(source);
    url.searchParams.set('w', String(width));
    return `${url} ${width}w`;
  };
  return <img src={src} alt={alt} sizes={sizes}
    srcSet={[320, 640, 960, 1280].map(resized).join(', ')} loading="lazy" />;
}
