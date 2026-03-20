# @circa-input/core

Framework-agnostic core logic for [circa-input](https://github.com/imotako-pum/circa-input) — a UI primitive for entering a value and its ambiguity.

## Install

```bash
npm install @circa-input/core
```

## Usage

```typescript
import {
  createDefaultConfig,
  createInitialValue,
  updateValue,
  validateConfig,
  type CircaValue,
} from "@circa-input/core";

// Create initial state
const config = createDefaultConfig({ min: 0, max: 100 });
validateConfig(config);
const value = createInitialValue(config);

// Update value
const updated = updateValue(value, { value: 42 }, config);
console.log(updated);
// { value: 42, marginLow: null, marginHigh: null, distribution: "normal", distributionParams: {} }
```

## API

### Types

- `CircaValue` — Output data structure with value, margins, and distribution
- `CircaInputConfig` — Configuration (min, max, step, marginMax, initialMargin, etc.)
- `Distribution` — `"normal" | "uniform"`

#### `initialMargin`

The `initialMargin` field in `CircaInputConfig` controls the margin automatically applied when a value transitions from `null` to non-null (i.e., the user's first click). When set to `null` (the default), it auto-calculates as `(max - min) / 10`. Set to `0` to disable auto-margin. If `step` is configured, the value is snapped to the nearest step size.

### Functions

- `createDefaultConfig(overrides)` — Create a CircaInputConfig with defaults
- `createInitialValue(config)` — Create an initial (empty) CircaValue
- `updateValue(current, changes, config)` — Update with clamping and validation
- `validateConfig(config)` — Validate configuration, throws on invalid
- `checkRequired(value, config)` — Check form required constraint
- `toPlainValue(value)` — Extract plain number from CircaValue
- `clamp(value, min, max)` — Clamp a number to the [min, max] range
- `snapToStep(value, config)` — Snap a value to the nearest step

## License

MIT
