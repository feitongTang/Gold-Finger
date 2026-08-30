# Gold-Finger V2 Glacier Scale UI Redesign

## 1. Status and decision

This document defines the approved visual-system and page-experience redesign for the existing Gold-Finger V2 multi-page dashboard.

The approved direction is **Glacier Scale / 冰川刻度**:

> A restrained, premium, breathable financial interface built on mist-white natural light, high-luminance ice blue, thin translucent surfaces, and small precise visual accents. Glass is most noticeable in interactive and temporary surfaces, but every surface remains close to the page rather than appearing prominently elevated.

The user explicitly approved entering the specification stage on 2026-08-30. This specification does not authorize implementation. A separate implementation plan must be written and approved before code changes begin.

This document supersedes the visual-language decisions in `2026-08-28-v2-multi-page-ice-crystal-design.md`. It does not supersede that specification's information architecture, routes, financial semantics, persistence behavior, or product scope unless this document explicitly says so.

## 2. Existing context

The current V2 dashboard already provides a shared sidebar and five desktop routes:

- `/` — monthly review
- `/records` — monthly record entry and deletion
- `/portfolio` — read-only portfolio analysis
- `/trends` — historical charts and table
- `/data` — local backup and restore

The current Ice Crystal implementation is functionally complete and verified, but its visual treatment is too uniformly pale. Large areas read as similar white boxes, the hierarchy is understated, and the product lacks a restrained but memorable accent.

The redesign must improve visual identity and material hierarchy without changing the existing information density, financial workflow, or V2 application structure.

## 3. Design goals

The redesign must:

- Feel restrained, premium, breathable, clear, quiet, and precise.
- Use a cool, high-luminance ice blue as the primary theme color.
- Make the interface feel more transparent and airy without sacrificing data legibility.
- Use glass to communicate function and depth, not to decorate every region.
- Make interactive and temporary surfaces the clearest expression of glass.
- Keep cards, buttons, popovers, and dialogs close to the page with only slight elevation.
- Give Gold-Finger a recognizable visual rhythm through small ice-blue scales, lines, selections, and chart accents.
- Preserve the current page density and desktop information throughput.
- Keep financial data more visually important than surface effects.
- Continue to work clearly without `backdrop-filter` and with reduced motion.

## 4. Non-goals

This redesign will not:

- Copy macOS, iOS, visionOS, or Apple component geometry directly.
- Turn the application into a Web3, crypto, trading-terminal, or neon dashboard.
- Use large saturated gradients, visible colored light circles, strong glow, or mouse-following effects.
- Apply blur or transparency evenly to all cards and controls.
- Create glass-inside-glass nesting.
- Create a wall of elevated white cards or heavily rounded capsules.
- Increase information density or create deliberately larger empty regions.
- Add decorative illustrations, glass objects, or background animation.
- Add dark mode, user-selectable themes, or a new font.
- Add mobile layouts, a collapsed mobile sidebar, or narrow-screen acceptance scope.
- Add product features unrelated to the visual redesign.

## 5. Theme language

### 5.1 Keywords

Primary keywords:

- restrained
- premium
- breathable
- transparent
- calm
- precise

Supporting keywords:

- mist-white natural light
- glacier haze
- ice-blue scale
- thin glass
- slight elevation
- quiet order

### 5.2 Visual proportion

The intended visual balance is:

- 75% clear, quiet, light financial interface
- 15% thin persistent frosted surfaces
- 10% interactive glass and ice-blue accents

The page must read as a dependable financial product before it reads as glass.

## 6. Background and ambient-light system

### 6.1 Base background

The base canvas is a cool mist white:

```css
--background: #f4f8fb;
```

It must remain close enough to white that the product feels open and breathable. It must not drift toward gray-green, teal, beige, or visibly blue paper.

### 6.2 Ambient light

Ambient light is static and extremely low contrast:

```css
--ambient-ice: rgb(168 221 248 / 14%);
--ambient-air: rgb(211 235 249 / 12%);
```

Rules:

- Ambient color may appear near outer edges, the top of the workspace, or broad content gaps.
- The center of the reading area remains visually clean.
- A user must not be able to identify a distinct gradient circle at first glance.
- Ambient light does not change by route, month, financial result, or interaction.
- The background does not animate.
- Low-performance and transparency-disabled environments may use the solid base background only.

## 7. Glass and surface hierarchy

### 7.1 L0 — Environment

Used for the page canvas.

- Solid mist-white base plus faint ambient ice light.
- No blur.
- No semantic meaning.

### 7.2 L1 — Data surface

Used for tables, form fields, chart canvases, allocation rows, fund rows, and dense content interiors.

```css
--surface-solid: rgb(255 255 255 / 82%);
```

- No `backdrop-filter`.
- Stable enough for long-form reading and data entry.
- Uses soft cool borders and dividers instead of shadow.
- May sit inside one L2 outer shell without adding a second glass layer.

### 7.3 L2 — Persistent frosted surface

Used selectively for the sidebar, net-worth card, main page panels, and the outer shell of a major grouped region.

```css
--surface-frosted: rgb(255 255 255 / 48%);
--blur-frosted: 16px;
```

- Light background transmission must be visible without making underlying content identifiable.
- The surface uses a thin white lit edge and an optional faint cool secondary edge.
- Elevation remains slight.
- A content region may have only one persistent blurred ancestor.

### 7.4 L3 — Interactive glass

Used for month switching, primary actions, segmented controls, dropdowns, popovers, tooltips, and other small interactive surfaces.

```css
--surface-interactive: rgb(238 248 255 / 60%);
--blur-interactive: 22px;
```

- This is the most perceptible glass level.
- It remains small in area and limited in quantity.
- It may sit above L2, but must not look like a thick floating capsule.
- Hover increases clarity and ice-blue edge intensity more than elevation.
- Active state may compress slightly without spring or bounce.

### 7.5 L4 — Temporary priority layer

Used for dialogs, irreversible confirmations, and temporary modal content.

- Uses an L3-like glass panel with a low-opacity cool-gray page veil.
- The page veil must not add another full-screen blur.
- Priority comes from focus containment, outline, spacing, and the veil rather than a heavy shadow.

### 7.6 Universal surface rules

- No persistent glass-inside-glass.
- Tables, chart canvases, inputs, and nested rows never use blur.
- Buttons remain close to their parent surface and only slightly elevated.
- A visible glass edge is more important than a strong shadow.
- Blur cannot compensate for an unclear component hierarchy.
- Content opacity and contrast are independent from the transparency of the surrounding shell.

## 8. Color system and tokens

### 8.1 Core palette

```css
:root {
  --background: #f4f8fb;
  --ambient-ice: rgb(168 221 248 / 14%);
  --ambient-air: rgb(211 235 249 / 12%);

  --surface-solid: rgb(255 255 255 / 82%);
  --surface-frosted: rgb(255 255 255 / 48%);
  --surface-interactive: rgb(238 248 255 / 60%);
  --surface-frosted-fallback: rgb(249 252 254 / 94%);
  --surface-interactive-fallback: rgb(242 249 253 / 96%);

  --text-primary: #22313a;
  --text-secondary: #657784;
  --text-muted: #8294a0;

  --ice-blue: #82bde2;
  --ice-blue-strong: #3f7fa8;
  --ice-blue-soft: rgb(130 189 226 / 12%);

  --positive: #487f9b;
  --negative: #a36f75;
  --warning: #8a744d;

  --border-soft: rgb(91 139 169 / 12%);
  --border-glass: rgb(255 255 255 / 78%);
  --border-glass-cool: rgb(109 174 214 / 14%);
  --focus-ring: #3f7fa8;

  --shadow-frosted: 0 8px 28px rgb(66 112 140 / 4%);
  --shadow-interactive: 0 6px 18px rgb(68 137 180 / 6%);
  --blur-frosted: 16px;
  --blur-interactive: 22px;
}
```

The values are approved calibration targets. Browser QA may make small numerical corrections when required for real compositing, contrast, or cross-browser consistency, but it must preserve the defined roles and relative strength.

### 8.2 Color budget

- Ice blue is not a large card fill.
- Clearly visible ice blue should normally occupy less than approximately 8% of a desktop viewport.
- Ice blue is concentrated in current navigation, primary interaction, focus, selected state, chart primary series, and small scale details.
- `ice-blue` is appropriate for graphics and decoration; readable interactive text uses `ice-blue-strong`.
- Positive values use cool blue plus an explicit sign or label; green is not part of the primary theme.
- Negative and warning colors appear only when semantics require them and never become background theme colors.
- Selection, positive, negative, warning, and error states never rely on color alone.

## 9. Typography and financial data

- Keep the existing system font stack.
- Do not enlarge page titles beyond the current V2 hierarchy.
- Use weight, spacing, and alignment before increasing font size.
- Key amounts, table data, form content, primary body text, and controls must meet WCAG AA contrast.
- Supporting descriptions and non-critical metadata may be softer but must remain comfortably readable.
- Do not use ice blue for long text passages.
- All amounts, percentages, month labels, and tabular values use tabular numerals.
- Currency symbols and decimal fractions may have slightly lower visual weight without becoming smaller than comfortably readable text.
- The primary net-worth figure remains the strongest numeric element on the page.
- Currency symbols, signs, decimal places, and columns align consistently across all five routes.
- Positive and negative values keep explicit `+` or `-` signs or unambiguous labels.

## 10. Spacing, radius, border, shadow, and density

### 10.1 Spacing and density

- Continue to use a 4px base spacing grid.
- Preserve the current page gutters, card spacing, and overall information density.
- Improve consistency of title, description, content, divider, and action spacing rather than increasing empty space.
- Do not reduce the amount of information visible in the existing desktop layouts.

### 10.2 Radius

- Page-level major panels: 16–18px.
- Ordinary grouped surfaces: 12–14px.
- Inputs and buttons: 10–12px.
- Full pill radius is reserved for true segmented controls, compact state labels, and pill semantics.
- Components must not all use one oversized radius.

### 10.3 Border and elevation

- L1 relies on `border-soft` and dividers.
- L2 uses `border-glass`, an optional cool secondary edge, and `shadow-frosted`.
- L3 uses a slightly clearer lit edge and `shadow-interactive`.
- Hover normally changes background opacity, border intensity, or accent concentration.
- Hover must not visibly lift a card or control.
- Shadows are the final separation cue, not the primary hierarchy mechanism.

## 11. Sidebar and navigation

- Keep the existing expanded text sidebar and its route order.
- The sidebar uses one L2 lightly frosted side plate continuous with the page environment.
- Product identity remains text-led: `Gold-Finger` plus the existing descriptor.
- A short ice-blue scale may be added as a restrained brand detail; no complex new logo is required.
- The current navigation item uses a faint ice-blue background plus a small linear scale or edge marker.
- Remove the impression of a thick outlined or elevated white selected block.
- Unselected navigation remains transparent.
- Hover only increases the ice-blue concentration slightly.
- `/data` remains at the bottom with lower weight than the four business routes.
- Current route uses `aria-current="page"`.
- Focus and selected states remain distinguishable when present together.

## 12. Component material rules

### 12.1 Cards and page panels

- The net-worth card and major page shells may use L2.
- Inner metrics use alignment and dividers, not nested frosted cards.
- Ordinary summaries remain closer to L1 than L2.
- Do not turn each metric or allocation row into an individual card.

### 12.2 Tables and allocation rows

- Table headers and rows use stable L1 data surfaces.
- Dividers are faint cool blue-gray.
- Row hover uses approximately 4–6% ice-blue background, without blur, shadow, movement, or a separate card radius.
- Selected rows require a structural marker in addition to background color.
- Amounts and percentages align by column.

### 12.3 Forms

- Inputs, selects, and fund rows use stable ice-white L1 surfaces.
- Default boundaries remain light but visible.
- Hover slightly strengthens the cool edge.
- Focus uses a clear 2px ice-blue ring and does not change component dimensions.
- Form groups rely on numbering, headings, spacing, and dividers rather than nested glass panels.
- The main save action uses restrained L3 interactive glass.
- Add-fund stays secondary.
- Remove and delete actions remain low weight until irreversible confirmation.

### 12.4 Buttons and segmented controls

- Primary buttons are pale interactive glass, not saturated blue fills.
- Secondary buttons are transparent or near-solid with a soft border.
- Buttons use slight elevation only.
- Segmented controls use one shared L3 shell with a faint ice-blue selected segment.
- Control states must remain clear without strong capsules, glow, or thick outlines.

### 12.5 Charts

- Chart canvases use transparent or L1 backgrounds and never use blur.
- The main series uses ice blue; secondary series use low-saturation blue-gray and distinct line styles or clear labels.
- Grid lines are subtle but visible on typical desktop displays.
- Data nodes remain quiet until hover or keyboard focus.
- Tooltip is the only clearly frosted chart element and uses L3.
- Trend lines use a smooth monotone curve rather than straight polyline segments.
- Interpolation must pass through the real monthly data points and must not overshoot, introduce false peaks, or imply values outside the underlying range.
- A single point renders as a point; insufficient data falls back to an accurate point or line segment rather than an invented curve.
- Tooltips and the historical table always display the exact stored or calculated values.
- Charts do not use glow, illuminated area fills, continuous motion, or decorative drawing animation.

### 12.6 Popovers and dialogs

- Popovers, dropdowns, and tooltips share the L3 glass treatment.
- Dialogs use an L3/L4 panel plus a low-opacity cool veil.
- The full page behind a dialog is not blurred again.
- Dialog priority comes from focus, outline, veil, and spacing rather than a heavy shadow.
- Irreversible confirmation introduces restrained cool rose only at the confirmation stage.

## 13. Interaction states

### 13.1 Hover

- Slightly increase ice-blue background, border clarity, or surface opacity.
- Shadow may increase by one subtle level.
- No prominent lift.

### 13.2 Active

- A small press response up to approximately `scale(0.99)` is allowed.
- No bounce, spring, or rubber response.

### 13.3 Focus

- Use a visible 2px `focus-ring` with suitable offset.
- The focus ring must remain visible over mist-white, L1, L2, and L3 surfaces.

### 13.4 Selected

- Use at least two of: an ice-blue scale, pale background, text weight, explicit label, icon, or structural marker.

### 13.5 Loading

- Preserve page geometry.
- Use static ice-white placeholders or a slight opacity change.
- Do not use shimmer, sweeping light, or glowing skeletons.

### 13.6 Success, warning, error, and disabled

- Success uses text or icon plus cool blue; color alone is insufficient.
- Warning uses structure and text; restrained amber is secondary.
- Error uses summary, field boundary, message, and focus movement; restrained cool rose is secondary.
- Disabled controls retain a visible boundary and do not disappear through excessive transparency.

### 13.7 Empty states

- Use concise text and one clear next action.
- Do not add large illustrations or decorative glass objects.

## 14. Motion

The approved motion level is **light functional motion**.

- Standard state transitions use approximately 140–200ms `ease-out`.
- Button press may use a minimal downward or scale response.
- Segmented selection may slide a short distance without spring.
- Menus, tooltips, and dialogs may fade in with 2–4px of movement.
- Routes do not add page transitions.
- Amounts do not roll or count up.
- Charts may fade in but do not draw themselves progressively.
- Ambient light and surface highlights remain static.

Under `prefers-reduced-motion: reduce`:

- Remove translation, scaling, smooth scrolling, and non-essential animation.
- Preserve immediate visual state changes.

## 15. Accessibility

- Key amounts, table data, form content, primary body text, and all controls meet WCAG AA contrast.
- Secondary explanations and non-critical metadata may be softer but remain comfortably readable.
- No state relies on color alone.
- Sidebar navigation, month switching, segmented controls, disclosure rows, chart points, forms, popovers, and dialogs remain keyboard operable.
- Chart points expose readable labels and exact values.
- Dialogs contain focus and return it to the trigger on close.
- DOM reading order matches visual order.
- Interactive targets remain at least approximately 40px.
- At 200% browser zoom, financial values remain uncut and controls remain reachable.
- Error handling preserves entered data and moves focus to the first invalid field as currently required.
- Focus indication is not hidden by glass edges or clipping.

## 16. Performance and fallback

### 16.1 Blur limits

- Only L2 major surfaces and small L3/L4 interactive surfaces use `backdrop-filter`.
- Tables, forms, allocation rows, charts, and nested content never use blur.
- One persistent blurred ancestor is the maximum for a content region.
- Page veils do not add background blur.
- No dynamic blur, mouse-following highlight, or animated ambient gradient.
- Long-form scrolling must limit both the number and area of blurred surfaces.

### 16.2 Fallback

- Provide both standard and WebKit backdrop-filter properties.
- Without support, L2 uses `surface-frosted-fallback` at approximately 94% opacity.
- Without support, L3/L4 use `surface-interactive-fallback` at approximately 96% opacity.
- Border, spacing, and color differences continue to express hierarchy.
- Fallback must never leave text over an uncontrolled transparent background.
- If real devices show blur-related degradation, remove blur before reducing readability or responsiveness.

## 17. Route-specific changes

### 17.1 `/` — Monthly review

- Preserve the toolbar, net-worth card, five-metric strip, and two-column analysis layout.
- Use a more transparent L2 Glacier Haze treatment for the net-worth card.
- Keep internal metrics unblurred and organized by alignment and dividers.
- Make month switching and the update action the clearest L3 interactive glass.
- Preserve the five-metric strip and current density.
- Use cool blue plus explicit signs for positive values.
- Render the trend preview with non-overshooting smooth curves.
- Use ice blue, light blue-gray, and near-white allocation colors.
- Concentrate accents in current navigation, primary action, the main chart line, and a few key values.

### 17.2 `/records` — Monthly records

- Preserve fields, step order, form width, and overall density.
- Use one light outer shell; fields and fund rows use L1.
- Turn step numbers into small ice-blue scales rather than heavy blocks.
- Make input focus clear with an ice-blue ring.
- Organize fund rows with spacing and dividers, not individually elevated glass cards.
- Keep update/save as pale L3 interactive glass.
- Keep add-fund secondary.
- Keep remove and delete visually restrained until confirmation.
- Preserve validation, focus movement, zero confirmation, data retention, and post-save navigation.

### 17.3 `/portfolio` — Portfolio

- Use L2 for the outer overview only; keep numbers stable and high contrast.
- Use one L2 allocation shell and unblurred internal rows.
- Use ice blue for the primary allocation sequence with light blue-gray supporting colors.
- Row hover remains flat and faint.
- Keep the holdings table L1 with aligned values and percentages.
- Express hierarchy using indentation, small scales, weight, and percentages.
- Remain read-only.

### 17.4 `/trends` — Historical trends

- Keep chart canvases transparent or L1.
- Use monotone smooth curves through real data points.
- Use ice blue for the primary series and distinguish secondary series with tone, line style, and labels.
- Use L3 for segmented controls and tooltips.
- Enhance data nodes only on interaction.
- Keep the six-month data table as the exact-value reference.
- Preserve the existing financial color and sign semantics where they express business meaning.
- Do not invent a curve when there is insufficient data.

### 17.5 `/data` — Data safety

- Use one light L2 main panel with L1 export and restore groups.
- Keep local-only storage as the primary message without illustration.
- Use restrained L3 for export.
- Keep file selection and restore preparation secondary.
- Introduce cool rose boundary, icon, and explicit text only during permanent-replacement confirmation.
- Avoid large red fills.
- Preserve validation, rollback safety, live-region messages, backup format, and post-restore navigation.

## 18. Scope boundaries

The implementation must not:

- Change the five routes or their information architecture.
- Change financial calculations, field semantics, month logic, or category semantics.
- Change SQLite/Drizzle schema or migrations.
- Change export, backup, or restore formats.
- Add accounts, login, avatars, settings, cloud sync, budgets, goals, advice, scoring, or reminders.
- Add an asset-management route or a second editing entry point.
- Add mobile design or narrow-screen acceptance scope.
- Add new chart features beyond the approved visual curve treatment.
- Add dark mode or theme customization.
- Add a font or visual dependency without a separate justified decision.
- Refactor components unrelated to implementing the approved visual system.
- Modify unrelated existing worktree changes in `next-env.d.ts`, demo startup scripts, or database-client files.

## 19. Verification criteria

Implementation is visually acceptable only when:

- All five routes share the Glacier Scale visual language.
- The product reads as calm financial software before it reads as glass.
- Ice blue feels cool, high-luminance, and clean rather than dark, gray-green, or dirty.
- Ambient color does not appear as visible gradient circles.
- L2 surfaces are thin and only slightly elevated.
- L3 controls are the clearest glass surfaces but do not protrude.
- No persistent glass-inside-glass is visible.
- Tables, forms, allocation rows, and charts remain unblurred and data-first.
- Trend curves are smooth, pass through real data points, and do not overshoot.
- Required text and controls meet the approved contrast boundary.
- Keyboard focus, selected, error, and danger states are clear without color alone.
- Reduced motion removes translation and scaling.
- Unsupported `backdrop-filter` produces readable near-solid surfaces.
- Desktop widths and 200% zoom do not clip financial values or controls.
- Scrolling and interactive overlays show no obvious blur-related performance degradation.

## 20. Resolved decisions

- Dominant character: restrained and elegant with a small highlight.
- Primary color: cool high-luminance ice blue.
- Background: mist-white natural light with highly restrained color variation.
- Glass intensity: between barely perceptible and clearly perceptible.
- Strongest glass role: interactive and temporary surfaces.
- Sidebar: lightly frosted side plate.
- Density: preserve the current V2 density.
- Motion: light functional motion.
- Elevation: slight, never prominently raised.
- Contrast: key data and controls meet WCAG AA; secondary metadata may be softer but remains readable.
- Chart geometry: non-overshooting smooth curves rather than straight polyline segments.
- Apple influence: material restraint and clarity, not component imitation.

There are no unresolved design questions in this specification.
