/**
 * Storefront runtime bootstrap.
 *
 * Generation agents should not edit this file during normal storefront authoring.
 * Define route mapping in App.tsx; pages then compose agent-authored sections.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "@/App";
import { installEditorBridge } from "@/lib/editor-bridge";
import { StorefrontProvider } from "@/lib/swell/storefront";
import { Toaster } from "@/storefront/primitives/sonner";
import { TooltipProvider } from "@/storefront/primitives/tooltip";
import "@/index.css";

// Editor selection bridge — no-op unless framed with ?swellEmbedded=1.
installEditorBridge();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StorefrontProvider>
      <TooltipProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </StorefrontProvider>
  </StrictMode>,
);
