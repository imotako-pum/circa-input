# @circa-input/react

[![npm](https://img.shields.io/npm/v/@circa-input/react)](https://www.npmjs.com/package/@circa-input/react)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@circa-input/react)](https://bundlephobia.com/package/@circa-input/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/imotako-pum/circa-input/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

**One input. One action. Value + ambiguity.** A React component that captures not just a number, but how fuzzy that number is — in a single gesture.

No more wiring up two sliders, a min/max pair, or a number field plus tolerance. One `<CircaInput>` replaces them all.

![circa-input demo](https://raw.githubusercontent.com/imotako-pum/circa-input/main/docs/assets/demo.gif)

**[Live Demo](https://imotako-pum.github.io/circa-input/react/)** · **[Not using React? Use @circa-input/web-component](https://www.npmjs.com/package/@circa-input/web-component)**

## Install

```bash
npm install @circa-input/react
```

**Peer dependencies:** `react` >= 18, `react-dom` >= 18

## Quick Start

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
| `min` | number | Minimum value (default: 0) |
| `max` | number | Maximum value (default: 100) |
| `value` | number | Center value (controlled) |
| `marginLow` | number | Lower margin (controlled) |
| `marginHigh` | number | Upper margin (controlled) |
| `defaultValue` | number | Initial value (uncontrolled) |
| `defaultMarginLow` | number | Initial lower margin |
| `defaultMarginHigh` | number | Initial upper margin |
| `step` | number \| `"any"` | Value granularity |
| `marginMax` | number | Max margin size |
| `asymmetric` | boolean | Independent low/high margins |
| `initialMargin` | number \| null | Margin applied on first click. Default: `(max - min) / 10`. Set to `0` to disable. |
| `name` | string | Form field name |
| `required` | boolean | Form validation |
| `tickInterval` | number | Tick mark interval |
| `noClear` | boolean | Hide clear button |
| `disabled` | boolean | Disable interaction |
| `onChange` | `(value: CircaValue) => void` | Change handler |
| `onInput` | `(value: CircaValue) => void` | Input handler |

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

This package registers a custom element via `customElements.define()`, which runs only in the browser. For Next.js App Router, use it in a Client Component:

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

## Full Documentation

See the [circa-input monorepo](https://github.com/imotako-pum/circa-input) for CSS customization, keyboard shortcuts, form integration, and more.

## License

MIT
