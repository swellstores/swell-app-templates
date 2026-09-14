/**
 * Storefront route composition surface.
 *
 * Generation agents may edit this file to define the route tree only.
 * Import page components from concrete files in src/pages. Do not import
 * sections, blocks, hooks, Swell clients, or commerce actions in App.tsx. Use
 * the standard commerce route vocabulary for products/categories, and add custom
 * routes when the generated storefront needs custom pages.
 *
 * Expected generated shape:
 *
 * - import `Route` and `Routes` from `react-router-dom`;
 * - import generated page components from concrete files in `src/pages`;
 * - map standard commerce routes such as `/products`, `/products/:slug`,
 *   `/categories`, and `/categories/:slug` to page components;
 * - add custom page routes when needed by the storefront concept;
 * - optionally map `*` to a generated not-found page.
 */
import { Routes } from "react-router-dom";

export default function App() {
  return <Routes />;
}
