// Template-owned catalog used by generation and the storefront editor.
export type StorefrontFontRole = "sans" | "serif" | "display" | "mono";

export type StorefrontFontDefinition = {
  id: string;
  label: string;
  family: string;
  cssValue: string;
  role: StorefrontFontRole;
};

export const storefrontFonts = [
  {
    id: "archivo",
    label: "Archivo",
    family: "Archivo Variable",
    cssValue: '"Archivo Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "bricolage-grotesque",
    label: "Bricolage Grotesque",
    family: "Bricolage Grotesque Variable",
    cssValue: '"Bricolage Grotesque Variable", ui-sans-serif, system-ui, sans-serif',
    role: "display",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    family: "DM Sans Variable",
    cssValue: '"DM Sans Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "epilogue",
    label: "Epilogue",
    family: "Epilogue Variable",
    cssValue: '"Epilogue Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    family: "Fraunces Variable",
    cssValue: '"Fraunces Variable", ui-serif, Georgia, serif',
    role: "display",
  },
  {
    id: "geist",
    label: "Geist",
    family: "Geist Variable",
    cssValue: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "hanken-grotesk",
    label: "Hanken Grotesk",
    family: "Hanken Grotesk Variable",
    cssValue: '"Hanken Grotesk Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "inter",
    label: "Inter",
    family: "Inter Variable",
    cssValue: '"Inter Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    family: "JetBrains Mono Variable",
    cssValue: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, monospace',
    role: "mono",
  },
  {
    id: "libre-franklin",
    label: "Libre Franklin",
    family: "Libre Franklin Variable",
    cssValue: '"Libre Franklin Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "manrope",
    label: "Manrope",
    family: "Manrope Variable",
    cssValue: '"Manrope Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "newsreader",
    label: "Newsreader",
    family: "Newsreader Variable",
    cssValue: '"Newsreader Variable", ui-serif, Georgia, serif',
    role: "serif",
  },
  {
    id: "playfair-display",
    label: "Playfair Display",
    family: "Playfair Display Variable",
    cssValue: '"Playfair Display Variable", ui-serif, Georgia, serif',
    role: "display",
  },
  {
    id: "plus-jakarta-sans",
    label: "Plus Jakarta Sans",
    family: "Plus Jakarta Sans Variable",
    cssValue: '"Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "sora",
    label: "Sora",
    family: "Sora Variable",
    cssValue: '"Sora Variable", ui-sans-serif, system-ui, sans-serif',
    role: "sans",
  },
  {
    id: "source-serif-4",
    label: "Source Serif 4",
    family: "Source Serif 4 Variable",
    cssValue: '"Source Serif 4 Variable", ui-serif, Georgia, serif',
    role: "serif",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    family: "Space Grotesk Variable",
    cssValue: '"Space Grotesk Variable", ui-sans-serif, system-ui, sans-serif',
    role: "display",
  },
] as const satisfies readonly StorefrontFontDefinition[];

export type StorefrontFontId = (typeof storefrontFonts)[number]["id"];
