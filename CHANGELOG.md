# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

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
