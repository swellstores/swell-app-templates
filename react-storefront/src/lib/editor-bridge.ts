/**
 * Editor bridge — active ONLY when the storefront is framed inside the admin
 * editor (`?swellEmbedded=1`). It gives the editor a full section-selection +
 * inline-text-editing interaction model:
 *
 *   hover a section        → solid-blurple boundary + section-tag pill (top-left)
 *   click a section        → persistent boundary + tag + select-section to the
 *                            parent, which opens the RegenPopup
 *   click authored text in the selected section → inline edit (contentEditable;
 *                            Enter/blur commits, Escape cancels), posted to the
 *                            parent → ai-api edit-text route
 *
 * The boundary is a real CSS `outline` on the element itself (not a floating
 * bordered box) so it wraps the box exactly, never breaks at the corners, works
 * for full-bleed sections, and tracks scroll for free. Clicks on interactive
 * controls and catalog-bound text (product/cart slots) are left alone.
 *
 * Template-side half of the section-targeting layer (Vlad finding #7).
 */

const BLURPLE = "#635bff";
const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [contenteditable="true"]';
const SECTION_SELECTOR = "[data-section-id]";
// Inline text editing: authored-copy elements that may become editable, and the
// catalog-bound slots that must NOT (product/cart text is hook-rendered — it has
// no source literal, so the server's exactly-one-match contract can't touch it;
// this selector is the visible affordance guard on top of that).
const TEXT_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, span, li, strong, em, small, blockquote, figcaption";
const PROTECTED_SLOT_SELECTOR = '[data-slot^="product"], [data-slot^="cart"]';
const EDIT_ORIGINAL_KEY = "swellEditOriginal";
const HL_ATTR = "data-swell-hl"; // "hover" | "selected" on the element
const EDITING_ATTR = "data-swell-editing"; // on the element being edited
const TEXT_HINT_ATTR = "data-swell-text-hint"; // authored copy editable-on-hover

export function installEditorBridge(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!new URLSearchParams(window.location.search).has("swellEmbedded")) return;
  const w = window as unknown as { __swellEditorBridgeInstalled?: boolean };
  if (w.__swellEditorBridgeInstalled) return;
  w.__swellEditorBridgeInstalled = true;

  // Boundary = a solid-blurple outline on the element itself. `!important` beats
  // any element outline; the negative offset on sections keeps a full-bleed
  // boundary inside the viewport edges; the editing outline sits just outside
  // the text and overrides the browser's default contentEditable focus ring.
  const style = document.createElement("style");
  style.setAttribute("data-swell-editor-style", "");
  style.textContent = `
    [${HL_ATTR}="hover"] { outline: 2px solid ${BLURPLE} !important; outline-offset: -2px !important; cursor: pointer; }
    [${HL_ATTR}="selected"] { outline: 2px solid ${BLURPLE} !important; outline-offset: -2px !important; }
    [${EDITING_ATTR}] { outline: 2px solid ${BLURPLE} !important; outline-offset: 2px !important; border-radius: 2px; cursor: text; }
    /* Text edit hint: deliberately subordinate to the solid section boundary —
       a light dashed underline + I-beam, a distinct affordance class (no box). */
    [${TEXT_HINT_ATTR}]:not([${EDITING_ATTR}]) { text-decoration-line: underline !important; text-decoration-style: dashed !important; text-decoration-color: ${BLURPLE} !important; text-decoration-thickness: 1px !important; text-underline-offset: 3px !important; cursor: text !important; }
  `;
  document.head.appendChild(style);

  const makeTag = (z: number, marker: string): HTMLDivElement => {
    const el = document.createElement("div");
    el.setAttribute("data-swell-editor-overlay", marker);
    Object.assign(el.style, {
      position: "fixed",
      pointerEvents: "none",
      zIndex: String(z),
      background: BLURPLE,
      color: "#ffffff",
      font: '600 11px/1.2 ui-sans-serif, system-ui, sans-serif',
      letterSpacing: "0.02em",
      padding: "2px 6px",
      borderRadius: "5px",
      display: "none",
      whiteSpace: "nowrap",
      top: "0",
      left: "0",
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(el);
    return el;
  };

  const hoverTag = makeTag(2147483646, "hover-tag");
  const selTag = makeTag(2147483647, "sel-tag");

  let hovered: HTMLElement | null = null;
  let selected: HTMLElement | null = null;

  const labelOf = (s: HTMLElement): string =>
    s.getAttribute("data-section-role") ||
    s.getAttribute("data-section-type") ||
    s.getAttribute("data-section-id") ||
    "section";

  // Fixed tag pill at the section's top-left corner.
  const placeTag = (tag: HTMLDivElement, section: HTMLElement | null): void => {
    if (!section || !section.isConnected) {
      tag.style.display = "none";
      return;
    }
    const r = section.getBoundingClientRect();
    tag.textContent = labelOf(section);
    tag.style.display = "block";
    tag.style.top = `${r.top + 4}px`;
    tag.style.left = `${r.left + 4}px`;
  };

  // Outlines live on the elements, so they follow scroll natively — only the
  // fixed tag pills need repositioning on scroll/resize.
  const positionTags = (): void => {
    placeTag(selTag, selected);
    if (hovered && hovered !== selected) placeTag(hoverTag, hovered);
    else hoverTag.style.display = "none";
  };

  // Apply the boundary outlines: exactly one selected + (a distinct) hovered.
  const applyHighlights = (): void => {
    document.querySelectorAll(`[${HL_ATTR}]`).forEach((el) => {
      if (el !== selected && el !== hovered) el.removeAttribute(HL_ATTR);
    });
    if (selected) selected.setAttribute(HL_ATTR, "selected");
    if (hovered && hovered !== selected) hovered.setAttribute(HL_ATTR, "hover");
    else if (hovered && hovered === selected)
      hovered.setAttribute(HL_ATTR, "selected");
    positionTags();
  };

  const post = (sectionId: string | null): void => {
    try {
      window.parent.postMessage(
        { __swellEditorChrome: true, action: "select-section", sectionId },
        "*",
      );
    } catch {
      /* cross-origin parent may reject; best-effort */
    }
  };

  const sectionFrom = (node: EventTarget | null): HTMLElement | null =>
    node instanceof Element
      ? (node.closest<HTMLElement>(SECTION_SELECTOR) ?? null)
      : null;

  // ── Inline text editing ───────────────────────────────────────────────────
  let editingEl: HTMLElement | null = null;
  let textCursorEl: HTMLElement | null = null;
  let editSeq = 0;
  const pendingEdits = new Map<string, { el: HTMLElement; original: string }>();

  const editableTextFrom = (node: EventTarget | null): HTMLElement | null => {
    if (!(node instanceof Element) || !selected) return null;
    const el = node.closest<HTMLElement>(TEXT_SELECTOR);
    if (!el || !selected.contains(el)) return null;
    if (el.closest(INTERACTIVE_SELECTOR)) return null;
    if (el.closest(PROTECTED_SLOT_SELECTOR)) return null;
    if (!(el.textContent || "").trim()) return null;
    return el;
  };

  // Discoverability hint — decoupled from selection: any authored copy inside a
  // section shows the editable affordance on hover (clicking still selects then
  // edits). Same catalog/interactive exclusions as editing, so product/cart text
  // never gets the hint.
  const hintableTextFrom = (node: EventTarget | null): HTMLElement | null => {
    if (!(node instanceof Element)) return null;
    const el = node.closest<HTMLElement>(TEXT_SELECTOR);
    if (!el || !el.closest(SECTION_SELECTOR)) return null;
    if (el.closest(INTERACTIVE_SELECTOR)) return null;
    if (el.closest(PROTECTED_SLOT_SELECTOR)) return null;
    if (!(el.textContent || "").trim()) return null;
    return el;
  };

  const clearTextHint = (): void => {
    if (textCursorEl) {
      textCursorEl.removeAttribute(TEXT_HINT_ATTR);
      textCursorEl = null;
    }
  };

  const stopTextEdit = (save: boolean): void => {
    const el = editingEl;
    if (!el) return;
    editingEl = null;
    el.removeAttribute("contenteditable");
    el.removeAttribute(EDITING_ATTR);
    el.style.cursor = "";
    const original = (el.dataset[EDIT_ORIGINAL_KEY] || "").trim();
    const next = (el.textContent || "").trim();
    delete el.dataset[EDIT_ORIGINAL_KEY];
    if (!save) {
      el.textContent = original;
      return;
    }
    if (!next || next === original) return; // no-op
    const editId = `${Date.now()}_${editSeq++}`;
    pendingEdits.set(editId, { el, original });
    try {
      window.parent.postMessage(
        {
          __swellEditorChrome: true,
          action: "edit-text",
          editId,
          sectionId: selected?.getAttribute("data-section-id") ?? null,
          oldText: original,
          newText: next,
        },
        "*",
      );
    } catch {
      el.textContent = original;
      pendingEdits.delete(editId);
    }
  };

  const startTextEdit = (el: HTMLElement): void => {
    if (editingEl === el) return;
    if (editingEl) stopTextEdit(true);
    clearTextHint();
    hovered = null;
    applyHighlights();
    editingEl = el;
    el.dataset[EDIT_ORIGINAL_KEY] = el.textContent || "";
    el.setAttribute("contenteditable", "true");
    el.setAttribute(EDITING_ATTR, "");
    el.style.cursor = "text";
    el.focus();
    const sel = window.getSelection?.();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    const cleanup = (): void => {
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("keydown", onKey);
    };
    function onBlur(): void {
      cleanup();
      stopTextEdit(true);
    }
    function onKey(ev: KeyboardEvent): void {
      if (ev.key === "Escape") {
        ev.preventDefault();
        cleanup();
        stopTextEdit(false);
        el.blur();
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        el.blur();
      }
    }
    el.addEventListener("blur", onBlur);
    el.addEventListener("keydown", onKey);
  };

  document.addEventListener("mouseover", (event) => {
    if (editingEl) return;
    const section = sectionFrom(event.target);
    if (section !== hovered) {
      hovered = section;
      applyHighlights();
    }
    // Discoverability hint on authored copy — any section, catalog text excluded.
    // A subordinate dashed underline + I-beam, a distinct class from the solid
    // section boundary.
    clearTextHint();
    const te = hintableTextFrom(event.target);
    if (te) {
      te.setAttribute(TEXT_HINT_ATTR, "");
      textCursorEl = te;
    }
  });

  document.addEventListener("mouseout", (event) => {
    if (editingEl) return;
    const to = (event as MouseEvent).relatedTarget;
    if (!(to instanceof Node)) clearTextHint(); // pointer left the document
    if (!sectionFrom(to)) {
      hovered = null;
      applyHighlights();
    }
  });

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (editingEl && target instanceof Node && editingEl.contains(target))
        return;
      if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR))
        return;
      const section = sectionFrom(target);
      if (!section) {
        selected = null;
        applyHighlights();
        post(null);
        return;
      }
      // Clicking authored text inside the already-selected section starts inline
      // editing (first click selects; second edits).
      if (section === selected) {
        const textEl = editableTextFrom(target);
        if (textEl) {
          event.preventDefault();
          startTextEdit(textEl);
        }
        return;
      }
      event.preventDefault();
      selected = section;
      hovered = section;
      applyHighlights();
      post(section.getAttribute("data-section-id"));
    },
    true,
  );

  // Outlines follow scroll natively; only the fixed tag pills need repositioning.
  window.addEventListener("scroll", positionTags, true);
  window.addEventListener("resize", positionTags);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(positionTags).observe(document.documentElement);
  }

  window.addEventListener("message", (event) => {
    const data = event.data as {
      __swellEditorChrome?: boolean;
      action?: string;
      editId?: string;
    } | null;
    if (!data || data.__swellEditorChrome !== true) return;
    if (data.action === "reload") {
      // Auto-refresh after a section regen: the chrome posts this on task
      // completion so the edited section appears without a manual page reload.
      window.location.reload();
      return;
    }
    if (data.action === "deselect-section") {
      selected = null;
      applyHighlights();
    } else if (data.action === "edit-text-reject" && data.editId) {
      const p = pendingEdits.get(data.editId);
      if (p) {
        p.el.textContent = p.original;
        pendingEdits.delete(data.editId);
      }
    } else if (data.action === "edit-text-ack" && data.editId) {
      pendingEdits.delete(data.editId);
    }
  });
}
