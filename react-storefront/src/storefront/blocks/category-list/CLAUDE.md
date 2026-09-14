# src/storefront/blocks/category-list

Import from: `@/storefront/blocks`

## Exports

### CategoryCard

Renders a linked category card for category grids, navigation features, and collection indexes.

Properties:

- `category: Category`
  Category entity from useCategories().categories or another category collection.
- `className?: string`
  Styles the card link root.
- `mediaClassName?: string`
  Styles the media frame.
- `imageClassName?: string`
  Styles the category image.
- `contentClassName?: string`
  Styles the text content wrapper.
- `nameClassName?: string`
  Styles the category name heading.
- `descriptionClassName?: string`
  Styles the optional category description text.
- `imageSizes?: string`
  Responsive image sizes passed to the Image primitive.
- `showImage?: boolean`
  Controls whether category image is rendered.
- `showDescription?: boolean`
  Controls whether category description is rendered.
