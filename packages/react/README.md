# @circa-input/react

React adapter for [circa-input](https://github.com/imotako-pum/circa-input) — a UI primitive for entering a value and its ambiguity.

## Install

```bash
npm install @circa-input/react
```

**Peer dependencies:** `react` >= 18, `react-dom` >= 18

## Usage

```tsx
import { CircaInput } from "@circa-input/react";

function App() {
  return (
    <CircaInput
      min={0}
      max={100}
      onChange={(value) => console.log(value)}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `min` | number | Minimum value (defaults to 0) |
| `max` | number | Maximum value (defaults to 100) |
| `value` | number | Center value (controlled) |
| `marginLow` | number | Lower margin (controlled) |
| `marginHigh` | number | Upper margin (controlled) |
| `defaultValue` | number | Initial value (uncontrolled) |
| `defaultMarginLow` | number | Initial lower margin |
| `defaultMarginHigh` | number | Initial upper margin |
| `step` | number \| "any" | Value granularity |
| `marginMax` | number | Max margin size |
| `asymmetric` | boolean | Independent low/high margins |
| `name` | string | Form field name |
| `required` | boolean | Form validation |
| `tickInterval` | number | Tick mark interval |
| `noClear` | boolean | Hide clear button |
| `disabled` | boolean | Disable interaction |
| `onChange` | (value: CircaValue) => void | Change handler |
| `onInput` | (value: CircaValue) => void | Input handler |

## Controlled Mode

```tsx
import { useState } from "react";
import { CircaInput, type CircaValue } from "@circa-input/react";

function App() {
  const [circa, setCirca] = useState<CircaValue | null>(null);

  return (
    <CircaInput
      min={0}
      max={100}
      value={circa?.value ?? undefined}
      marginLow={circa?.marginLow ?? undefined}
      marginHigh={circa?.marginHigh ?? undefined}
      onChange={setCirca}
    />
  );
}
```

## SSR / Server Components

This package imports `@circa-input/web-component`, which registers a custom element via `customElements.define()`. This runs only in browser environments. For Next.js App Router, ensure this component is used in a Client Component:

```tsx
"use client";
import { CircaInput } from "@circa-input/react";
```

## Ref API

```tsx
import { useRef } from "react";
import { CircaInput, type CircaInputHandle } from "@circa-input/react";

function App() {
  const ref = useRef<CircaInputHandle>(null);

  return (
    <>
      <CircaInput ref={ref} min={0} max={100} />
      <button onClick={() => console.log(ref.current?.circaValue)}>
        Get Value
      </button>
    </>
  );
}
```

## License

MIT
