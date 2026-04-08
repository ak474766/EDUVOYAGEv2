# Design System Specification

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Ethereal Grove."** 

This system moves away from the rigid, boxed-in layouts of traditional SaaS and toward a high-end editorial experience that feels organic, rhythmic, and alive. By utilizing a soft sage-based palette, high-contrast forest greens, and bioluminescent neon accents, we create a digital environment that feels like a premium sanctuary. 

We break the "template" look through **intentional asymmetry** and **tonal layering**. Instead of using lines to separate thoughts, we use the natural weight of color and expansive white space to guide the eye. This is a system where the interface recedes to let the content breathe, punctuated only by sharp, intentional moments of glowing interactivity.

---

## 2. Colors
The palette is rooted in nature, using desaturated greens for stability and vibrant neon for "pulse" points.

### The "No-Line" Rule
To achieve a premium editorial feel, **1px solid borders are strictly prohibited** for sectioning or containment. Boundaries must be defined through background color shifts or tonal transitions.
*   **Primary Surface:** `surface` (#f8faf6)
*   **Secondary Section:** `surface_container_low` (#f2f4f0)
*   **High-Contrast Callouts:** `primary` (#4e6354)

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Use the surface-container tiers to create depth:
1.  **Base Layer:** `surface` (#f8faf6)
2.  **Sectioning Layer:** `surface_container` (#eceeea)
3.  **Interactive Cards:** `surface_container_lowest` (#ffffff) to create a subtle "pop" from the grey-green background.

### The "Glass & Gradient" Rule
For floating menus or overlays, use **Glassmorphism**. Combine `surface_container` at 80% opacity with a `backdrop-blur: 24px`. 
*   **Signature Glow:** For progress bars or highlights, utilize `tertiary_fixed` (#bcf540). To achieve the "glow" effect, apply a box-shadow using the same color at 40% opacity with a 12px blur.

---

## 3. Typography
We use **Manrope** for its balance of geometric precision and humanist warmth. The hierarchy is designed for an editorial "Large-to-Small" rhythm.

*   **Display (lg/md/sm):** Used for "hero" moments and landing headers. These should have -0.02em letter spacing to feel tight and professional.
*   **Headline (lg/md/sm):** Reserved for section titles. Ensure generous vertical margin-bottom (at least 2rem) to maintain airiness.
*   **Body (lg/md/sm):** Setting `body-lg` at 1rem for maximum readability. Line height should be 1.6x for an editorial feel.
*   **Labels:** Use `label-md` (#434842) for utility text. These should always be uppercase with +0.05em tracking for a sophisticated, technical look.

---

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering**, not structural shadows.

### The Layering Principle
Stack containers to define priority. A `surface_container_lowest` card placed on a `surface_container_high` section creates a natural lift without a single pixel of shadow.

### Ambient Shadows
Shadows should only be used for elements that physically "float" (e.g., Modals or Floating Action Buttons).
*   **Token:** Use `on_surface` (#191c1a) at 5% opacity.
*   **Settings:** 0px offset-y, 40px blur, 0px spread. The shadow must feel like ambient light, not a drop shadow.

### The "Ghost Border" Fallback
If contrast ratios require a border (e.g., on an input field or divider that must exist), use a **Ghost Border**: `outline_variant` (#c3c8c0) at 20% opacity. Never use 100% opacity for borders.

---

## 5. Components

### Buttons
*   **Primary:** `primary` (#4e6354) background with `on_primary` (#ffffff) text. Corner radius: `full` (9999px).
*   **Secondary:** `primary_container` (#91a795) background with `on_primary_container` (#293d2f) text.
*   **Tertiary (The Highlight):** `tertiary_fixed` (#bcf540). Used sparingly for high-value actions (e.g., "Complete Course").

### Inputs & Text Fields
*   **Base:** No border. Background: `surface_container_high` (#e7e9e5).
*   **Corner Radius:** `md` (1.5rem) to maintain the "high roundness" aesthetic.
*   **Focus State:** Shift background to `surface_container_highest` and add the "Signature Glow" shadow in sage.

### Progress Indicators
*   **The Neon Pulse:** Circular progress bars should use `tertiary_fixed` (#bcf540) with an outer glow. Use a thickness of 8px for a substantial, tactile feel.

### Cards & Lists
*   **Rule:** Forbid divider lines. Separate items in a list using 1rem of vertical white space or by alternating background tones between `surface_container_low` and `surface_container`.
*   **Radius:** Cards must use `lg` (2rem) or `xl` (3rem) rounding.

### The "Organic Path" (Special Component)
As seen in the visual reference, use soft, curved SVG paths (0.5px weight, `primary_fixed_dim`) to connect related screens or steps in a flow. This breaks the grid and adds an artisanal, premium touch.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If a screen feels cluttered, increase the padding to `xl` (3rem) rather than adding borders.
*   **DO** use the `full` roundness scale for all interactive triggers (buttons, chips).
*   **DO** use the `tertiary_fixed` neon green only for "moments of success" or progress.

### Don't
*   **DON'T** use 100% black (#000000) for text. Use `on_surface` (#191c1a) to maintain the soft, organic look.
*   **DON'T** use sharp corners. Anything under `sm` (0.5rem) roundness will break the system's "Ethereal Grove" identity.
*   **DON'T** use traditional dividers. If content needs to be separated, use a 16px or 24px gap instead.