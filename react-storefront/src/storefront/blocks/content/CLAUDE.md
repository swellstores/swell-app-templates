# src/storefront/blocks/content

Import from: `@/storefront/blocks`

## Exports

### ContentActions

Renders a group of content call-to-action buttons or links.

Properties:

- `actions: Array<{ label: ReactNode; href: string; variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"; external?: boolean; icon?: ReactNode; className?: string; }>`
  Action definitions to render.
- `className?: string`
  Styles the actions group root.
- `actionClassName?: string`
  Styles every action button.
- `externalIconClassName?: string`
  Styles the generated external-link icon.
- `size?: "default" | "xs" | "sm" | "lg"`
  shadcn button size used for every action.
- `showExternalIcon?: boolean`
  Controls whether external actions show a trailing external-link icon.

### ContentCallout

Renders a shaped floating callout — a short annotation in a blob, burst, or
pill container placed near a product or image. CSS-driven shape via
border-radius / clip-path; colour comes from token pairs. Use for playful
annotations ("new!", "hand-poured", a price shout) that should read as a
motif, not a plain label.

Properties:

- `children: ReactNode`
  Callout content (short text or small nodes).
- `shape?: "blob" | "burst" | "pill"`
  Container shape.
- `tone?: "primary" | "accent" | "secondary"`
  Token colour pair for the container surface.
- `rotate?: "none" | "left" | "right"`
  Optional tilt applied to the callout.
- `className?: string`
  Styles the callout root.

### ContentEditorialIndex

Renders a collection index — a stack of label rows each separated by a
hairline rule, with an optional trailing count or meta value (the
footer-style index of categories or collections). Rows link when an href is
provided. Use for editorial catalog indexes and footer navigation columns.

Properties:

- `items: Array<{ /** * Row label content. */ label: ReactNode; /** * Optional trailing value, such as a product count or year. */ count?: ReactNode; /** * Optional route or URL; the row renders as a link when provided. */ href?: string; }>`
  Index rows to render.
- `title?: ReactNode`
  Optional heading rendered above the index.
- `level?: HeadingLevel`
  Semantic heading level used when title is provided.
- `className?: string`
  Styles the block root.
- `titleClassName?: string`
  Styles the optional title heading.
- `listClassName?: string`
  Styles the index list wrapper.
- `rowClassName?: string`
  Styles each index row.
- `labelClassName?: string`
  Styles each row label.
- `countClassName?: string`
  Styles each trailing count value.

### ContentFeature

Renders a single feature, benefit, step, or value proposition.

Properties:

- `title: ReactNode`
  Feature title content.
- `description?: ReactNode`
  Optional supporting description.
- `icon?: ReactNode`
  Optional icon rendered above the title.
- `index?: ReactNode`
  Optional index or step marker rendered above the title.
- `href?: string`
  Optional route or URL for the feature link.
- `linkLabel?: ReactNode`
  Optional link label; the link is rendered only when href and linkLabel are both provided.
- `level?: HeadingLevel`
  Semantic heading level passed to the Heading primitive.
- `variant?: "plain" | "card" | "step"`
  Visual feature preset.
- `align?: "start" | "center" | "end"`
  Text alignment preset.
- `className?: string`
  Styles the feature root.
- `iconClassName?: string`
  Styles the icon wrapper.
- `indexClassName?: string`
  Styles the index marker.
- `titleClassName?: string`
  Styles the title heading.
- `descriptionClassName?: string`
  Styles the description text.
- `linkClassName?: string`
  Styles the optional link.

### ContentHeader

Renders reusable section header content with optional eyebrow and description.

Properties:

- `title: ReactNode`
  Main heading content.
- `eyebrow?: ReactNode`
  Optional short label rendered above the title.
- `description?: ReactNode`
  Optional supporting copy rendered below the title.
- `level?: HeadingLevel`
  Semantic heading level passed to the Heading primitive.
- `size?: "sm" | "md" | "lg" | "xl"`
  Preset typography scale for the header.
- `align?: "start" | "center" | "end"`
  Text alignment preset.
- `className?: string`
  Styles the header root.
- `eyebrowClassName?: string`
  Styles the eyebrow text.
- `titleClassName?: string`
  Styles the title heading.
- `descriptionClassName?: string`
  Styles the description text.

### ContentImageMask

Renders content imagery clipped to a decorative shape (scalloped, cloud, or
arched). CSS-driven via mask/border-radius; degrades to a plain rectangle
where the mask is unsupported. Use for playful or editorial lifestyle
imagery that should not read as a hard rectangular crop.

Properties:

- `src: string`
  Image source URL.
- `alt: string`
  Accessible image alternative text.
- `shape?: "scallop" | "cloud" | "arch"`
  Decorative shape the image is clipped to.
- `caption?: ReactNode`
  Optional caption rendered below the image.
- `width?: number`
  Intrinsic image width passed to the Image primitive.
- `height?: number`
  Intrinsic image height passed to the Image primitive.
- `sizes?: string`
  Responsive image sizes passed to the Image primitive.
- `loading?: "eager" | "lazy"`
  Native image loading strategy.
- `className?: string`
  Styles the figure root.
- `frameClassName?: string`
  Styles the masked image frame.
- `imageClassName?: string`
  Styles the image element.
- `captionClassName?: string`
  Styles the caption text.

### ContentMarquee

Renders a horizontally scrolling marquee / ticker band that repeats its
content in a seamless loop. CSS-driven animation; honors prefers-reduced-
motion (the band renders static, without scrolling, when reduced motion is
requested).

Properties:

- `items: ReactNode[]`
  Items rendered in sequence and repeated across the band (words, phrases, or small nodes).
- `separator?: ReactNode`
  Optional node rendered between items as a separator (e.g. a dot or slash).
- `speed?: "slow" | "default" | "fast"`
  Scroll speed preset.
- `direction?: "left" | "right"`
  Scroll direction.
- `variant?: "plain" | "band"`
  Visual band preset. "plain" scrolls on the page ground; "band" fills a full-width inverted surface.
- `pauseOnHover?: boolean`
  Pause the scroll while the pointer is over the band.
- `className?: string`
  Styles the marquee root (the clipping band).
- `itemClassName?: string`
  Styles each rendered item.
- `separatorClassName?: string`
  Styles the separator between items.

### ContentMedia

Renders editorial or promotional media with an optional caption.

Properties:

- `src: string`
  Image source URL.
- `alt: string`
  Accessible image alternative text.
- `caption?: ReactNode`
  Optional caption rendered below the image.
- `width?: number`
  Intrinsic image width passed to the Image primitive.
- `height?: number`
  Intrinsic image height passed to the Image primitive.
- `sizes?: string`
  Responsive image sizes passed to the Image primitive.
- `loading?: "eager" | "lazy"`
  Native image loading strategy.
- `className?: string`
  Styles the figure root.
- `frameClassName?: string`
  Styles the image frame.
- `imageClassName?: string`
  Styles the image element.
- `captionClassName?: string`
  Styles the caption text.

### ContentQuote

Renders a pull quote, testimonial, or press quote.

Properties:

- `quote: ReactNode`
  Quote body content.
- `attribution?: ReactNode`
  Optional person or organization credited for the quote.
- `source?: ReactNode`
  Optional source context such as role, publication, or company.
- `cite?: string`
  Optional citation URL passed to the blockquote cite attribute.
- `variant?: "editorial" | "card" | "minimal"`
  Visual quote preset.
- `size?: "sm" | "md" | "lg"`
  Quote typography scale.
- `align?: "start" | "center" | "end"`
  Text alignment preset.
- `className?: string`
  Styles the quote figure root.
- `quoteClassName?: string`
  Styles the quote body text.
- `footerClassName?: string`
  Styles the attribution/source footer.
- `attributionClassName?: string`
  Styles the attribution text.
- `sourceClassName?: string`
  Styles the source text.

### ContentSpecifications

Renders a structured specification list for product, brand, or editorial details.

Properties:

- `items: Array<{ label: ReactNode; value: ReactNode; }>`
  Specification rows to render.
- `title?: ReactNode`
  Optional heading rendered above the list.
- `level?: HeadingLevel`
  Semantic heading level used when title is provided.
- `className?: string`
  Styles the block root.
- `titleClassName?: string`
  Styles the optional title heading.
- `listClassName?: string`
  Styles the definition list wrapper.
- `rowClassName?: string`
  Styles each specification row.
- `labelClassName?: string`
  Styles each specification label.
- `valueClassName?: string`
  Styles each specification value.

### ContentStickerBadge

Renders a small sticker badge for product cards and imagery — a pill, star,
or seal carrying a short label ("new", "-20%", "bestseller"). CSS-driven
shape; colour from token pairs. Intended to be absolutely positioned by the
section over a card corner.

Properties:

- `label: ReactNode`
  Badge label (short text or a small node).
- `shape?: "pill" | "star" | "seal"`
  Badge shape.
- `tone?: "primary" | "accent" | "secondary"`
  Token colour pair for the badge surface.
- `rotate?: "none" | "left" | "right"`
  Optional tilt applied to the badge.
- `className?: string`
  Styles the badge root.
