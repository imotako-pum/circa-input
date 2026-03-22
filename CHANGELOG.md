# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.0] - 2026-03-22

### Added

- **@circa-input/core** — Gradient stop generation module for distribution visualization
- **@circa-input/core** — Runtime validation for `deserializeCircaValue` (#34)
- **@circa-input/core** — `Distribution` type derived from const array for improved type safety (#36)
- **@circa-input/web-component** — `range-only` attribute: margin-only mode without center value
- **@circa-input/web-component** — Gradient visualization (`gradient` attribute with `"relative"` / `"absolute"` modes)
- **Demo site** — Gradient and range-only sections with interactive examples
- **Demo site (React)** — Gradient, range-only sections and expanded use cases

### Fixed

- **@circa-input/web-component** — Controlled mode: Clear/Reset now correctly updates the visual display
- **@circa-input/web-component** — Pending attribute updates in uncontrolled mode after drag (#31)
- **@circa-input/web-component** — Range-only drag behavior
- **@circa-input/web-component** — Deduplicate `ElementInternals` console.warn (#36)

### Changed

- **Performance** — Throttle input events during drag with `requestAnimationFrame` (#35)
- **Docs** — README overhaul: new "One input. One action." tagline, Why section, `<details>` API reference, npm landing pages for all packages
- **Docs** — Updated demo GIF and use-cases screenshot
- **Metadata** — Added keywords (`circa`, `approximate-input`, `fuzzy-input`, `uncertainty-ui`, `value-tolerance`) to all packages

## [0.2.0] - 2026-03-20

### Added

- **@circa-input/core** — `initialMargin` property: auto-applies default margin width when value is first set (#21)
- **@circa-input/core** — Error codes (`CircaErrorCode`) and structured error messages with fix suggestions
- **@circa-input/web-component** — `initial-margin` attribute support
- **CI** — Playwright E2E tests, bundle size monitoring (size-limit)

### Fixed

- **@circa-input/web-component** — Controlled mode: value indicator now moves visually during drag (optimistic rendering) (#27)
- **@circa-input/web-component** — Attribute updates during drag are deferred until drag ends (#23)
- **@circa-input/react** — Removed removeChild/appendChild hack; use proper React event bridging (#6)
- **@circa-input/react** — `min`/`max` props are now optional (default 0/100)
- **@circa-input/core** — `countDecimals` handles scientific notation correctly
- **@circa-input/core** — `Infinity` JSON serialization scoped to numeric keys only

### Changed

- **@circa-input/core** — Removed unimplemented `"skewed"` from `Distribution` type (breaking: type narrowed)
- **@circa-input/core** — `distributionParams` is now type-safe per distribution type
- All packages now specify explicit browser targets

## [0.1.0] - 2026-03-15

Initial release of circa-input.

### Added

- **@circa-input/core** — Framework-agnostic core logic
  - `CircaValue` data structure (value, marginLow, marginHigh, distribution)
  - State management (`createInitialValue`, `createDefaultConfig`, `updateValue`)
  - Validation (`validateConfig`, `checkRequired`)
  - Step snapping (`snapToStep`)
  - Helper utilities (`toPlainValue`)
  - Custom error class (`CircaInputError`)

- **@circa-input/web-component** — `<circa-input>` custom element
  - Shadow DOM with accessible slider UI
  - Click to set value, drag to adjust margins
  - Symmetric and asymmetric margin modes
  - Controlled and uncontrolled attribute patterns
  - Keyboard navigation (arrows, Home/End, Delete)
  - ARIA attributes for screen readers
  - Form integration via `ElementInternals`
  - CSS Custom Properties for styling
  - Touch/pointer event support
  - Tick marks via `tick-interval` attribute
  - Clear button with slot customization

- **@circa-input/react** — React adapter
  - `<CircaInput>` component with full TypeScript props
  - `onChange`/`onInput` callback props
  - `forwardRef` with `CircaInputHandle` for imperative access
  - Controlled and uncontrolled patterns

- **Demo site** — Interactive documentation
  - Basic operation, asymmetric mode, use cases, playground, form integration
  - EN/JA language toggle (i18n)

- **CI** — GitHub Actions workflow (Node 18/20 matrix)
