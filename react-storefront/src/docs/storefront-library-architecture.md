# Storefront Library Architecture

Status: current contract  
Current implementation target: `src/storefront/blocks`

## Decision

The storefront UI library starts from a small, strict stack:

```text
Swell primitives
        ↓
Swell blocks
        ↓
agent-authored section compositions
```

For the first slice, storefront primitives are direct shadcn-derived interaction
components plus a minimal set of native content primitives in
`src/storefront/primitives`. There is no separate `src/components/ui` layer and
no wrapper layer around shadcn components.

The dependency direction is strict:

- blocks import UI components only from `src/storefront/primitives`;
- blocks compose primitives and pass props/className into them;
- each section resolves its own commerce source through `src/hooks`;
- sections pass resolved data and pre-bound state/action objects into blocks;
- blocks invoke supplied actions but do not fetch data or implement commerce
  operations;
- `src/theme.css` owns the design token values consumed by primitives and blocks;
- `src/index.css` maps those values to stable Tailwind v4 theme variables;
- sections compose blocks;
- sections are open agent-authored compositions, not fixed presets.

## Why primitives are direct shadcn-derived components

The goal of the primitive layer is to expose a stable, styleable component
vocabulary to blocks.

Using direct shadcn-derived components is simpler than wrapping shadcn:

- there is one public implementation of each primitive;
- each primitive keeps the full React/shadcn prop surface;
- `className`, variants, ARIA props, event handlers, and compound component props
  remain available to blocks;
- we avoid a second prop API that can drift from the real component;
- shadcn's existing `data-slot` remains a structural component/slot marker.

Example:

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

The primitive identity is not a prop. A block should never be able to render
`Button` as some other primitive by passing a different identifier.

## Primitive organization

Compound shadcn families stay grouped together inside a single file. We do not
create a folder per shadcn family unless there is real colocated metadata or
supporting code.

```text
src/storefront/primitives/
├── accordion.tsx
├── alert-dialog.tsx
├── button.tsx
├── card.tsx
├── dialog.tsx
├── heading.tsx
├── image.tsx
├── link.tsx
├── text.tsx
└── index.ts
```

`Heading`, `Text`, `Image`, and `Link` are the small content surface missing
from shadcn. They forward native or React Router props, accept `className`, add a
stable `data-slot`, and contain no default visual styling. Blocks use them for
content. Blocks may still use native semantic HTML for
technical structure such as `article`, `div`, `form`, and `ul`; layout wrappers
such as `Box`, `Stack`, `Grid`, `Container`, or `Section` are intentionally not
part of the primitive library.

Group examples:

```text
accordion.tsx
├── Accordion
├── AccordionItem
├── AccordionTrigger
└── AccordionContent

dialog.tsx
├── Dialog
├── DialogTrigger
├── DialogPortal
├── DialogClose
├── DialogOverlay
├── DialogContent
├── DialogHeader
├── DialogFooter
├── DialogTitle
└── DialogDescription

card.tsx
├── Card
├── CardHeader
├── CardFooter
├── CardTitle
├── CardAction
├── CardDescription
└── CardContent
```

Single components are also single files:

```text
button.tsx
input.tsx
textarea.tsx
```

## Props contract

The current source of truth for primitive props is TypeScript, not Zod.

Each primitive exports the same props its shadcn-derived implementation accepts,
for example:

```tsx
React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }
```

That means blocks can use the complete primitive API:

```tsx
import { Button } from "@/storefront/primitives/button";

export function GalleryCtaBlock() {
  return (
    <Button variant="outline" size="lg" className="rounded-full uppercase tracking-[0.2em]">
      Shop now
    </Button>
  );
}
```

Zod schemas are not required for this first primitive pass. If the editor later
needs serializable prop validation, we can add a schema next to the specific
primitive family only when it has real value:

```text
button.tsx
button.schema.ts
```

But those schemas should describe the editor/document contract, not duplicate
the entire React DOM type universe.

## Tailwind design tokens

`src/theme.css` is the source of truth for agent-authored global design token
values. Tailwind is the constrained composition language that exposes those
values to primitives, blocks, and sections. The agent must not write raw CSS or
edit primitive/block implementation code to change visual direction.

`src/theme.css` is a strict token-value file: the agent may change existing
declaration values inside `:root` and `.dark`, but must not add selectors,
classes, keyframes, media queries, component CSS, or token names.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);

  --type-body: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --type-heading: "Newsreader Variable", ui-serif, Georgia, serif;
  --type-mono: "JetBrains Mono Variable", ui-monospace, SFMono-Regular, monospace;

  --radius: 0.625rem;

  --elevation-sm: 0 1px 3px rgb(0 0 0 / 0.1);
}
```

The fixed `@theme inline` mapping in `src/index.css` exposes Tailwind names such
as `bg-primary`, `text-foreground`, `font-heading`, `rounded-lg`, and
`shadow-md`. `tailwind.config.js` is not used; the template follows Tailwind
v4's CSS-first configuration.

The agent changes the values behind those names, not the primitive code and not
arbitrary CSS.

Do not tokenize shadcn internals prematurely. Default Tailwind classes such as
`text-sm`, `duration-100`, `animate-in`, `fade-in-0`, and `zoom-in-95` remain
normal primitive implementation details. If typography, density, or motion
needs to become authorable, introduce a small semantic token contract at the
block/section layer rather than overriding the entire Tailwind scale or editing
shadcn primitives.

Low-level mechanics such as `w-full`, `grid`, `flex`, Radix state selectors,
focus rings, and compound component structure stay fixed in primitives/blocks.
Fixed spacing/sizing utilities such as `px-2.5`, `h-8`, `w-full`, and `gap-1.5`
are also primitive/block implementation mechanics for now. If a style needs
broader density control later, add semantic density tokens at the block/section
layer instead of changing primitive internals.

### Scoped token overrides

Theme tokens are CSS variables on purpose. They can be overridden by scope
without changing primitive or block source code.

Cascade order:

```text
global theme.css
        ↓
section-level token overrides
        ↓
block-level token overrides
        ↓
element-level token overrides
```

The Tailwind class remains the stable semantic hook:

```tsx
<h1 className="font-heading text-foreground" />
```

The value can change at any parent scope:

```tsx
<section
  style={
    {
      "--type-heading": '"Fraunces Variable", ui-serif, Georgia, serif',
      "--foreground": "oklch(0.2 0.03 40)",
    } as React.CSSProperties
  }
>
  <h1 className="font-heading text-foreground">Scoped heading</h1>
</section>
```

This gives the future editor fine-grained control: a user can change the font,
color, radius, shadow, or motion for one section, one block, or one selected
element while primitives and blocks stay fixed.

Scoped overrides must still be structured token values. They may reference only
known token names and allowed values, such as `storefrontFonts[*].cssValue` for
font-family choices. They must not become arbitrary CSS.

### Font policy

The base template ships a controlled web-font catalog. The font catalog has two
parts:

```text
src/fonts.css  # selected @fontsource imports used by this storefront
src/fonts.ts   # template-owned catalog for the agent and future editor
```

The editor should present `storefrontFonts` from `fonts.ts` as the available
font choices. The agent should choose font token values from that same catalog.

Font tokens in `src/theme.css` point at available catalog families:

```css
:root {
  --type-body: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --type-heading: "Newsreader Variable", ui-serif, Georgia, serif;
  --type-mono: "JetBrains Mono Variable", ui-monospace, SFMono-Regular, monospace;
}
```

The agent may change these values only to `cssValue` values from
`storefrontFonts`. `src/fonts.css` must import only the selected installed font
families, using package paths that correspond to the same catalog entries. The
agent must not add remote font URLs or package dependencies during normal
storefront generation.

If a style needs a new branded web font later, add it through the controlled
template font catalog first. That means adding the package/import and a
`storefrontFonts` entry intentionally, not as a generated one-off.

## Primitive rules

- Primitives are dumb UI atoms/compound atoms.
- Content primitives are thin native/router elements with no visual defaults.
- Primitives do not know about products, categories, inventory, Swell sources,
  CMS records, or binding rules.
- Primitives do not fetch data.
- Primitives may expose shadcn variants and native/Radix props.
- Primitives must accept `className` when the underlying shadcn component
  supports it.
- `data-slot` identifies a component or internal slot type. It is not a unique
  editor node ID and must not be treated as one.
- Internal implementation slots can keep `data-slot`; they do not become public
  primitives unless they are exported from `src/storefront/primitives`.
- Blocks own semantic meaning, primitive composition, and their internal UI
  behavior.

## Block contract

Blocks are semantic storefront compositions made from primitives.

Blocks live in one shared library, not in a library per taste style:

```text
src/storefront/blocks/
├── product/
├── product-list/
├── cart/
├── navigation/
├── localization/
├── content/
└── index.ts
```

Each domain folder contains real block implementations and no local barrel.
File names omit the domain already expressed by the folder: for example,
`product/gallery.tsx` exports `ProductGallery`, while
`product-list/filters.tsx` exports `ProductListFilters`. Only the root
`blocks/index.ts` forms the public block vocabulary.

Taste styles do not define separate block implementations. The styles from the
taste rubric influence theme token values, block props, Tailwind classes, and
section composition. If two storefront experiences eventually require
genuinely different behavior or anatomy, add an explicit structural variant or
a separate generally useful block instead of copying the block into style
directories.

### Public props are the block configuration

Each block has one normal React props API. Do not add a nested `settings`,
`config`, `editor`, or metadata object around the props.

```tsx
import type { Product } from "swell-js";

export type ProductCardProps = {
  product: Product;
  showPrice?: boolean;
  className?: string;
  mediaClassName?: string;
  nameClassName?: string;
  priceClassName?: string;
};
```

These props are the single source of truth for composition now and may become
the editor's configurable surface later. We do not duplicate them in a separate
settings model today.

TypeScript is the source of truth for block props. Do not add Zod schemas,
registries, control descriptions, or serialization metadata until the editor
has a concrete runtime requirement for them.

Block props should:

- accept the complete public hook result for their domain rather than requiring
  sections to select and reconnect individual data/action fields;
- accept one resolved entity for repeated item blocks such as `ProductCard`;
- expose meaningful behavioral or structural options, not implementation
  details;
- expose `className` for the root when appropriate;
- expose additional named `*ClassName` props only for internal parts that a
  section genuinely needs to style;
- preserve the public props of a primitive when the block intentionally exposes
  control over that primitive.

Do not create a large speculative props surface. Add a prop when at least one
real section composition needs it.

### First commerce input: `ProductCard`

The first `ProductCard` uses the existing `Product` type from `swell-js` as its
commerce input. Do not introduce a duplicate `ProductCardModel`,
`ProductSummary`, or copied subset of Swell product fields for this block.

```tsx
import type { Product } from "swell-js";

export type ProductCardProps = {
  product: Product;
  // visual and behavioral props are added only when the block needs them
};
```

The contract has one required input:

- `product` is a resolved, non-null product returned by the existing commerce
  layer;
- the block resolves `/products/:slug` internally so generated sections do not
  repeat routing logic.

`ProductCard` may derive render values from the supplied entity by using the
existing pure helpers such as `getProductImage` and `getProductPrice`. The
resulting image attributes and display strings are then passed into dumb
primitives.

The block must not accept only a product ID or slug and fetch the product
internally. It also must not accept a listing response or own pagination. The
section maps already-loaded products directly:

```tsx
<ProductCard product={product} />
```

Using the existing entity keeps product mapping out of generated section code
and avoids maintaining a parallel model that can drift from the Swell SDK.
This decision is specific to the current `ProductCard`; introduce a different
input shape later only when a real block cannot be expressed cleanly with the
existing commerce exports.

### Commerce boundary

Catalog and navigation data flow down into blocks through props:

```text
section-owned @/hooks call
             ↓
resolved data + pre-bound actions
             ↓
          block props
             ↓
          primitives
```

This contract makes the same block usable with live storefront data, generated
section content, and future editor preview data.

Blocks must not:

- fetch products, categories, menus, or CMS content;
- create their own Swell client;
- call the Admin API;
- hardcode merchant, product, category, or navigation data.

Behavioral blocks invoke actions supplied by the public hooks. They must not
call the Swell client, cart store, query cache, or internal commerce modules
directly. Generated sections pass the complete hook result (`product`,
`products`, `cart`, `currency`, or `locale`) rather than authoring or reconnecting
callbacks for add-to-cart, option selection, quantity changes, filtering,
sorting, search, or pagination.

Display formatting should also be resolved through the existing commerce
utilities or by the parent composition. Primitives receive final display values;
they do not know about Swell entities, money models, variants, or inventory.

### Composition and styling

Example block anatomy:

```text
ProductCard
├── article
├── Link
├── Image
├── Heading
├── Text
└── Button
```

Blocks should:

- compose primitives;
- pass data into primitives as already resolved display props;
- pass styling through supported primitive props such as `className`,
  `variant`, `size`, `side`, `align`, etc.;
- accept styling and meaningful block-level options through their public props;
- use native semantic HTML only for technical structure where no primitive is
  appropriate;
- own their internal semantics, accessibility, interaction states, and
  responsive behavior;
- stay small enough to be rearranged inside open sections.

Blocks should not:

- import UI component implementations outside `src/storefront/primitives`;
- fetch commerce data directly;
- hardcode merchant/product data;
- require generated raw CSS;
- contain a taste-style ID or switch across the taste rubric;
- become page-sized sections.

### Editor identity and canvas layout are deferred

Blocks and primitives must not hardcode editor node IDs. Unique instance IDs
will be assigned at runtime when the editor document and rendering boundary are
designed.

Existing `data-slot` attributes remain useful structural markers, but they are
not unique identifiers. No `data-swell-node`, block registry, editor schema, or
serialized node tree is introduced in the block implementation yet.

The current block contract also makes no promise about drag-and-drop, free
movement, grid coordinates, or canvas layout. Blocks own only their internal UI
layout. Editor movement and section layout editing will be designed separately
when that work begins.

## Sections

Sections are open compositions authored by the agent from blocks.

The first version intentionally does not include a section library or fixed
section recipes. If generation quality is poor, we can later add optional
section patterns as guidance, but not as the initial architecture.

The section anatomy stays open. For now, sections are normal code compositions:
they choose blocks, own their commerce source, call public hooks, pass hook data
and actions into blocks, and author the surrounding layout. A section may embed
a real entity slug/id selected during generation or derive it from the URL.
Pages only compose sections and do not own entity fetching.

`useProduct` returns one product together with its selected variation, gallery,
price, options, purchase options, quantity, stock, and action functions.
`useProducts` returns a collection together with search, filters, sorting, and
pagination actions. A simple collection section may use only `products`; a full
catalog section passes the additional state objects to the corresponding
blocks. There are no separate public `useProductState`, `useProductSelection`,
or `useProductList` hooks.

Sections do not need a schema, fixed slot list, serialized representation,
editor metadata, or movement model yet.

## Current implementation

The closed block vocabulary now covers product detail, product listing, cart,
navigation, localization, and reusable content. The next validation step is to
have the generation agent author materially different section compositions
against the same block APIs without creating taste-specific block copies.
Editor identity, schemas, and canvas behavior remain a separate later contract.
