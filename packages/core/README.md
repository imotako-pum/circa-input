# @circa-input/core

Framework-agnostic core logic for [circa-input](https://github.com/imotako-pum/circa-input) — a UI primitive for entering a value and its ambiguity.

## Install

```bash
npm install @circa-input/core
```

## Usage

```typescript
import {
  buildInitialValue,
  updateValue,
  validateConfig,
  type CircaValue,
  type CircaInputConfig,
} from "@circa-input/core";

// Create initial state
const config: CircaInputConfig = { min: 0, max: 100 };
validateConfig(config);
const value = buildInitialValue(config);

// Update value
const updated = updateValue(value, { value: 42 }, config);
console.log(updated);
// { value: 42, marginLow: 0, marginHigh: 0, distribution: "normal", distributionParams: {} }
```

## API

### Types

- `CircaValue` — Output data structure with value, margins, and distribution
- `CircaInputConfig` — Configuration (min, max, step, marginMax, etc.)
- `Distribution` — `"normal" | "uniform" | "skewed"`

### Functions

- `buildInitialValue(config, defaults?)` — Create an initial CircaValue
- `updateValue(current, changes, config)` — Update with clamping and validation
- `validateConfig(config)` — Validate configuration, throws on invalid
- `checkRequired(value, config)` — Check form required constraint
- `toPlainValue(value)` — Extract plain number from CircaValue
- `snapToStep(value, step, min)` — Snap a value to the nearest step

## License

MIT
