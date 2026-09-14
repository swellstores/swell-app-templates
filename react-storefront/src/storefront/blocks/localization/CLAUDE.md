# src/storefront/blocks/localization

Import from: `@/storefront/blocks`

## Exports

### LocalizationCurrencySelector

Renders a currency selector wired to the current currency result.

Properties:

- `currency: UseCurrencyResult`
  Complete result returned from useCurrency().
- `className?: string`
  Styles the selector root.
- `labelClassName?: string`
  Styles the label.
- `triggerClassName?: string`
  Styles the select trigger.
- `label?: string`
  Label and select placeholder text.
- `hideLabel?: boolean`
  Controls whether the label is visually hidden.
- `showSymbol?: boolean`
  Controls whether each option shows the currency symbol before the code.

### LocalizationLocaleSelector

Renders a locale selector wired to the current locale result.

Properties:

- `locale: UseLocaleResult`
  Complete result returned from useLocale().
- `className?: string`
  Styles the selector root.
- `labelClassName?: string`
  Styles the label.
- `triggerClassName?: string`
  Styles the select trigger.
- `label?: string`
  Label and select placeholder text.
- `hideLabel?: boolean`
  Controls whether the label is visually hidden.
- `showCode?: boolean`
  Controls whether each option shows the locale code after the locale name.
