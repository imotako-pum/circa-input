# circa-input — Technical Specification

---

## 1. Concept

A UI primitive that allows users to input both a "value" and its "ambiguity" simultaneously.

`circa` is derived from Latin, meaning "approximately." It eliminates the "false precision" forced by traditional input UIs, capturing the natural ambiguity of human intent as data.

| Variable | Meaning | Operation |
|----------|---------|-----------|
| **value (μ)** | Center value | Click/tap position |
| **marginLow** | Lower tolerance | Drag left/down |
| **marginHigh** | Upper tolerance | Drag right/up |

---

## 2. Data Structure

### Output Type (CircaValue)

```typescript
type Distribution = "normal" | "uniform";

/** Distribution-specific parameters (reserved for future extension; always {} in v0.1.x) */
type NormalDistributionParams = Record<string, never>;
type UniformDistributionParams = Record<string, never>;

interface DistributionParamsMap {
  normal: NormalDistributionParams;
  uniform: UniformDistributionParams;
}

type DistributionParams = DistributionParamsMap[Distribution];

interface CircaValue {
  value: number | null;
  marginLow: number | null;
  marginHigh: number | null;
  distribution: Distribution;
  distributionParams: DistributionParams;
}
```

### Initial State (No Input)

```json
{
  "value": null,
  "marginLow": null,
  "marginHigh": null,
  "distribution": "normal",
  "distributionParams": {}
}
```

### Input Example (Symmetric)

```json
{
  "value": 14.0,
  "marginLow": 1.0,
  "marginHigh": 1.0,
  "distribution": "normal",
  "distributionParams": {}
}
```

### Input Example (Asymmetric)

```json
{
  "value": 14.0,
  "marginLow": 0.5,
  "marginHigh": 2.0,
  "distribution": "normal",
  "distributionParams": {}
}
```

### Input Example (One-Sided Unbounded)

```json
{
  "value": 14.0,
  "marginLow": 0,
  "marginHigh": Infinity,
  "distribution": "normal",
  "distributionParams": {}
}
```

---

## 3. Attribute Specification

### Controlled Attributes

Used when managing values externally. When specified, these take priority over the component's internal state.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | number \| null | null | Center value |
| `margin-low` | number \| null | null | Lower tolerance |
| `margin-high` | number \| null | null | Upper tolerance |

### Uncontrolled Attributes

Used when the component manages its own internal state.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `default-value` | number \| null | null | Initial center value |
| `default-margin-low` | number \| null | null | Initial lower tolerance |
| `default-margin-high` | number \| null | null | Initial upper tolerance |

### Optional Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | number | 0 | Minimum selectable value |
| `max` | number | 100 | Maximum selectable value |
| `margin-max` | number \| null | null | Maximum margin value (null = no limit) |
| `distribution` | string | "normal" | Distribution shape |
| `asymmetric` | boolean | false | Enables asymmetric UI when true |
| `step` | number \| "any" | "any" | Value step size |
| `name` | string \| null | null | For form integration |
| `required` | boolean | false | Required validation |
| `no-clear` | boolean | false | Hides the clear button |
| `tick-interval` | number \| null | null | Tick mark interval (displays tick lines + numeric labels only when set) |
| `initial-margin` | number \| null | null | Default margin width applied when value is first set (null → value). When null, defaults to (max - min) / 10. Snapped to step if step is set. |
| `disabled` | boolean | false | Disables the component (pointer-events: none, opacity: 0.5, ARIA disabled) |

### Controlled Mode

Controlled mode is activated when the `value` attribute is present on the element. In controlled mode, the component does not update its internal state on user interaction; instead, it fires events and expects the external owner to update the attributes. Note: setting only `margin-low` or `margin-high` without `value` does NOT activate controlled mode.

### Slots

| Slot Name | Default | Description |
|-----------|---------|-------------|
| `clear` | `×` button | Allows replacing the clear button externally. Use as `<button slot="clear">Reset</button>` |

---

## 4. Event Specification

### change

Fires on operation completion (mouseup / touchend).

```typescript
element.addEventListener('change', (e: CustomEvent<CircaValue>) => {
  console.log(e.detail);
  // { value: 14.0, marginLow: 0.5, marginHigh: 2.0, distribution: "normal", distributionParams: {} }
});
```

### input

Fires in real-time during operation (mousemove / touchmove).

```typescript
element.addEventListener('input', (e: CustomEvent<CircaValue>) => {
  console.log(e.detail); // Same type as change
});
```

---

## 5. Validation Specification

| Case | Action | Reason |
|------|--------|--------|
| `value < min` or `value > max` | Throw error | Developer mistake |
| `marginLow` or `marginHigh` is negative | Throw error | Meaningless |
| Value after margin application exceeds min/max | Clamp (auto-adjust) | Naturally occurs during user interaction |
| Margin exceeds `margin-max` | Clamp | Naturally occurs during user interaction |
| `initialMargin` is negative | Throw error | Meaningless |
| `required=true` and `value=null` | Validation error | Detected on form submission |

### Error Codes

Each `CircaInputError` includes a `code` property for programmatic handling:

| Code | Category | Trigger |
|------|----------|---------|
| `INVALID_RANGE` | Config | `min >= max` |
| `INVALID_MARGIN_MAX` | Config | `marginMax < 0` |
| `INVALID_STEP` | Config | `step <= 0` |
| `INVALID_INITIAL_MARGIN` | Config | `initialMargin < 0` |
| `VALUE_OUT_OF_RANGE` | Value | `value < min` or `value > max` |
| `INVALID_MARGIN_LOW` | Value | `marginLow < 0` |
| `INVALID_MARGIN_HIGH` | Value | `marginHigh < 0` |
| `DOM_ELEMENT_NOT_FOUND` | Internal | Shadow DOM element missing (library bug) |

---

## 6. Form Integration

When the `name` attribute is specified, the value is included in FormData as a JSON string.

`Infinity` and `-Infinity` are serialized as the strings `"Infinity"` and `"-Infinity"` respectively, because standard JSON cannot represent these values. Use `deserializeCircaValue()` from `@circa-input/core` to parse the JSON back into a `CircaValue` with proper `Infinity` restoration.

```html
<form>
  <circa-input name="delivery_time" min="9" max="21" />
</form>
```

```
// On FormData submission
delivery_time={"value":14.0,"marginLow":0.5,"marginHigh":2.0,"distribution":"normal","distributionParams":{}}
```

### Backward Compatibility Helper

For backends that do not yet support circa-input, a helper is provided to extract only the value.

```typescript
import { toPlainValue } from "@circa-input/core";

const plain = toPlainValue(circaValue); // 14.0
```

---

## 7. User Interaction Specification

### Basic Operations (Symmetric Mode)

| Operation | Result |
|-----------|--------|
| Click / Tap | Sets the value |
| Vertical drag | Expands marginLow and marginHigh symmetrically |
| × button / `Delete` key | Clears the value and returns to the no-input state |

### Asymmetric Operations (asymmetric=true)

The center thumb's vertical drag and the edge handles allow individual adjustment of marginLow and marginHigh.

| Operation | Result |
|-----------|--------|
| Drag center thumb up | Increases marginLow (left tolerance) |
| Drag center thumb down | Increases marginHigh (right tolerance) |
| Drag handle-low (left edge handle) left/right | Adjusts marginLow individually |
| Drag handle-high (right edge handle) left/right | Adjusts marginHigh individually |

#### Keyboard Operations (Asymmetric Mode)

| Key | Action |
|-----|--------|
| `Shift + ↑` / `Shift + ←` | Increases marginLow by 1 step |
| `Shift + ↓` / `Shift + →` | Increases marginHigh by 1 step |

### Mobile Support

- Handles are selected by tapping, then dragged
- Operations differ between desktop and mobile, but the output data structure is identical

---

## 8. Accessibility (a11y)

Properly supported from the start. Retrofitting carries a high risk of structural changes.

### ARIA

- `<circa-input>` wraps everything with `role="group"`
- The internal value control uses `role="slider"` + `aria-valuenow` / `aria-valuemin` / `aria-valuemax`
- Margin handles (in asymmetric mode) each have `role="slider"` as well
- `aria-label` distinguishes "center value," "lower tolerance," and "upper tolerance"

### Keyboard Operations

| Key | Action |
|-----|--------|
| `Tab` | Moves focus to the component |
| `←` / `→` | Increments/decrements value by 1 step (1% of range when step="any") |
| `Shift + ←` / `Shift + →` | Expands/contracts margin symmetrically |
| `Home` / `End` | Sets value to min / max |
| `Delete` / `Backspace` | Clears the value and returns to the no-input state |

### Screen Reader

- Updates `aria-valuenow` on value change and announces the change
- Example readout: "14, plus or minus 1"

---

## 9. CSS Customization

Styles inside the Shadow DOM can be customized externally via CSS Custom Properties.

### Provided CSS Variables (Initial Design)

| Variable Name | Default | Description |
|---------------|---------|-------------|
| `--circa-track-height` | `8px` | Track height |
| `--circa-track-color` | `#e0e0e0` | Track color |
| `--circa-track-radius` | `4px` | Track border radius |
| `--circa-value-color` | `#1976d2` | Value indicator color |
| `--circa-margin-color` | `rgba(25, 118, 210, 0.2)` | Margin area color |
| `--circa-handle-size` | `20px` | Handle size |
| `--circa-handle-color` | `#1976d2` | Handle color |
| `--circa-clear-color` | `#bbb` | Clear button color |
| `--circa-clear-hover-color` | `#888` | Clear button hover color |
| `--circa-tick-color` | `#999` | Tick line color |
| `--circa-tick-label-color` | `#666` | Tick label color |
| `--circa-tick-height` | `6px` | Tick line height |
| `--circa-tick-width` | `1px` | Tick line width |
| `--circa-tick-label-size` | `10px` | Tick label font size |

* Variables may be added as needed during implementation. Update this table when adding new variables.

---

## 10. Supported Environments

### Browsers

Latest 2 versions of modern browsers. No polyfills are used. Specific minimum versions (as of 2025-03):

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 131+ | |
| Edge | 131+ | Chromium-based, same engine as Chrome |
| Firefox | 133+ | ElementInternals unsupported; form integration uses graceful degradation |
| Safari | 18+ | |

See `.browserslistrc` in the repository root for tooling integration.

### Bundle Size Targets

| Package | Target (gzip) |
|---------|---------------|
| @circa-input/core | Under 2.1KB |
| @circa-input/web-component (includes core) | Under 8KB |

---

## 11. License

MIT

---

## 12. Implementation Priority

1. `packages/core` — Logic and validation
2. `packages/web-component` — `<circa-input>` tag implementation
3. `apps/demo` — Demo for testing and verification
4. `packages/react` — React adapter

---

## 13. Demo Site Internationalization (i18n) Specification

### Supported Languages

- Japanese (ja)
- English (en)

### Language Detection Priority

1. URL parameter `?lang=en`
2. `localStorage` key `circa-input-lang`
3. `navigator.language` prefix
4. Fallback: `en`

### i18n Architecture

- No external libraries; TypeScript object-based
- `Translations` type for type-safe management of all keys
- `t()` function to retrieve translations for the current locale
- `data-i18n` attribute to mark HTML elements as translation targets

### Translation Scope

- Static text in HTML (headings, descriptions, labels, etc.)
- Formatter strings in format.ts (units, separators, etc.)
- Dynamic strings in section modules (placeholders, etc.)

### Scope

Demo site (`apps/demo/`) only. Does not affect published packages (core, web-component, react).

---

## 14. Open Issues & Future Work

- [ ] How to implement the UI for `distribution: "skewed"`
- [ ] Concrete design of `distributionParams` contents (type extension point is in place via `DistributionParamsMap`)
- [ ] How to handle correlations between multiple fields
- [ ] Vue and Svelte adapter implementations
