# circa-input Project Roadmap

---

## Vision

Complete a UI primitive that allows users to input both a "value" and its "ambiguity" simultaneously,
delivered as 3 npm-publishable packages + a demo site.

---

## Overall Milestones

```
M1        M2            M3          M4            M5
 ●────────●─────────────●───────────●─────────────●
core      WC working    Demo live   React support npm publish prep
```

---

## M1: Core Package Completion

**Goal**: The framework-agnostic logic layer meets all requirements in the specification.

**Status**: Basic implementation and 28 tests all green. Build succeeds.

**Remaining Tasks**:
- [x] Snap processing via `step` attribute (logic to round values to step intervals)
- [x] Symmetric mode synchronization (sync marginLow/marginHigh when `asymmetric=false`)
- [x] Tests for the above

**Completion Criteria**:
- `pnpm --filter @circa-input/core test` all green
- `pnpm --filter @circa-input/core build` succeeds
- All logic from spec Sections 2-6 is covered in core

---

## M2: Web Component Working

**Goal**: Simply writing `<circa-input min="0" max="100"></circa-input>` in HTML enables
mouse/touch interaction for inputting values and ambiguity, with `CircaValue` available via the `change` event.

**Sub-milestones**:

### M2-a: Minimal Rendering and Value Setting
- [x] Shadow DOM structure (track + value indicator)
- [x] HTML attribute bindings (min, max, value, margin-low, margin-high)
- [x] Set `value` via click/tap
- [x] ARIA attributes (role="slider", aria-valuenow, etc.) and keyboard operations (arrow keys)
- [x] CSS Custom Properties foundation for style customization

### M2-b: Margin Manipulation
- [x] Drag to expand/contract margin symmetrically
- [x] Margin area visualization (range display on track)
- [x] `input` event (real-time during operation) and `change` event (on operation completion) firing

### M2-c: Asymmetric Mode and Controlled/Uncontrolled
- [x] Edge handles when `asymmetric=true`
- [x] Support for both Controlled attributes (value, margin-low, margin-high) and Uncontrolled attributes (default-*)

### M2-d: Form Integration and Mobile
- [x] FormData integration via `name` attribute
- [x] Validation via `required` attribute
- [x] Touch event support

**Completion Criteria**:
- `<circa-input>` can be written in an HTML file and operated in a browser
- `change` event detail contains the correct `CircaValue`
- Both Controlled and Uncontrolled modes work
- Form submission includes JSON in FormData

---

## M3: Demo Site

**Goal**: A page where anyone can understand and experience the behavior and concept of circa-input.

**Status**: Demo site implementation complete.

**Content**:
- [x] Basic usage (symmetric mode)
- [x] Asymmetric mode demo
- [x] Various use cases (time input, price input, etc.)
- [x] Real-time event output display
- [x] Control panel for dynamically switching attributes
- [x] Form integration demo (FormData + required validation)

**Completion Criteria**:
- [x] Launches locally with `pnpm dev`
- [x] Someone who has never used circa-input can understand how to use it from the page

---

## M4: React Adapter

**Goal**: Usable as `<CircaInput min={0} max={100} onChange={(v) => ...} />`.

**Content**:
- [x] React wrapper for the Web Component
- [x] props to HTML attribute conversion
- [x] CustomEvent to React callback conversion
- [x] React-idiomatic DX for Controlled/Uncontrolled
- [x] TypeScript type definition exports

**Completion Criteria**:
- `<CircaInput>` works correctly within a React app
- Type autocompletion works
- Tests are green

---

## M5: Publish Preparation

**Goal**: Ready for `npm publish`.

**Content**:
- Build output verification for each package (ESM + CJS + type definitions)
- package.json metadata (license, repository, keywords, etc.)
- CHANGELOG / README
- CI (lint + test + build)
- [x] Demo site bilingual support (EN/JA)
  - i18n module (language toggle, translation objects, `t()` function)
  - HTML `data-i18n` attribute conversion + `translatePage()` function
  - Language toggle UI (EN / JA toggle)
  - Locale-aware formatter strings (format.ts)
  - Dynamic string support in section modules
  - Test updates (add en locale tests)
- [x] Source code comment translation to English (JSDoc, inline comments, test descriptions)
- [x] Documentation translation to English (spec.md, ROADMAP.md, CONTRIB.md)
  - CLAUDE.md remains in Japanese

**Completion Criteria**:
- `pnpm build && pnpm test` succeeds for all packages
- `npm pack --dry-run` includes only the intended files

---

## Dependencies

```
M1 ──→ M2 ──→ M3
              ↘
               M4 ──→ M5
```

- M2 depends on M1 (core logic must be complete before building the Web Component)
- M3 depends on M2 (demo cannot be built without the Web Component)
- M4 depends on M2 (needs a component to wrap), but can run in parallel with M3
- M5 requires all milestones to be complete

---

## Architecture Decisions

Decided on 2026-02-23. See `docs/spec.md` Sections 8-11 for details.

| Item | Decision | Reason |
|------|----------|--------|
| a11y | Proper support from the start (role, ARIA, keyboard operations) | Retrofitting carries high risk of structural changes |
| CSS Customization | CSS Custom Properties | Simple and beginner-friendly |
| Browser Support | Modern only (latest 2 versions) | Lightweight without polyfills |
| License | MIT | OSS standard |
| Bundle Size | core + WC combined gzip under 5KB | Competitive as a lightweight library |
| React Design | Wrap the Web Component | Avoid duplicating rendering logic |

---

## Risks and Open Issues

| Risk | Impact | Mitigation |
|------|--------|------------|
| Web Component UX design | Biggest uncertainty in M2. Whether "drag to expand margin" is intuitive | Build minimum in M2-a, then adjust after hands-on testing |
| Touch UX | May not match desktop interaction feel | Design separately in M2-d; spec includes separate mobile operations |
| `distribution: "skewed"` UI | Listed as open issue in spec | Can be deferred to post-M5 |
| `distributionParams` design | Listed as open issue in spec | Can be deferred to post-M5 |
| React 18/19 compatibility | Potential differences via Web Component layer | Verify in M4 |

---

## Recommended Work Order

1. **Finish M1 first** (small scope: just adding step processing and symmetric synchronization)
2. **Focus on M2** (the core of the project; proceed incrementally a → b → c → d)
3. **M3 and M4 can run in parallel** (both can proceed independently once M2 is done)
4. **M5 after everything else stabilizes**

---

## Progress Log

| Date | Milestone | Details |
|------|-----------|---------|
| 2026-02-23 | M1 in progress | Core basic implementation done (types, state, validation, helpers, errors). 28 tests all green. Build succeeds. Step processing and symmetric synchronization not yet implemented. |
| 2026-02-23 | M1 complete | Implemented step attribute snap processing (snapToStep function) and symmetric mode synchronization. 45 tests all green. Build succeeds (gzip 0.97KB). |
| 2026-03-08 | M2 complete | Web Component implementation complete. 6 modules: dom-utils/attributes/styles/template/circa-input/index. Shadow DOM, click/keyboard/drag operations, symmetric/asymmetric margin, Controlled/Uncontrolled, form integration (ElementInternals), mobile support (pointercancel). 72 tests all green. Build succeeds (gzip 3.79KB, combined with core 4.76KB < 5KB). Coverage 91.2%. |
| 2026-03-08 | M2 quality improvement | Fixed all CRITICAL/HIGH 6 issues and MEDIUM/LOW 8 issues found in code review. Added handle-low/high keyboard operations, disabled state blocking, validateConfig calls, valueToPercent division-by-zero guard, --circa-value-color CSS variable. lint/type-check all clear. 87 tests all green. Combined gzip 4.95KB < 5KB. |
| 2026-03-08 | M3 complete | Demo site implementation complete. 5-section structure (basic operations, asymmetric mode, use case collection, playground, form integration). Modular section design (sections/ + utils/). Responsive support. Build succeeds. lint/type-check clear. All 132 tests green. |
| 2026-03-15 | M4 complete | React adapter implementation complete. CircaInput component (forwardRef + useImperativeHandle), type definitions (CircaInputProps/CircaInputHandle), camelCase to kebab-case attribute mapping, CustomEvent to callback bridging, Controlled/Uncontrolled support. 25 tests all green. Build succeeds (ESM gzip 0.97KB / CJS gzip 0.83KB). lint/type-check all clear. All 188 tests green. |
| 2026-03-15 | M5 complete | Publish preparation complete. package.json metadata (license, repository, keywords, sideEffects, version 0.1.0). GitHub Actions CI (Node 18/20 matrix). Source code comments translated to English (19 files across core/web-component/react). Demo site i18n (EN/JA toggle, data-i18n attributes, format.ts locale support). Documentation translated to English (spec.md, ROADMAP.md, CONTRIB.md). README for root + each package. CHANGELOG. LICENSE. All 224 tests green. lint/type-check all clear. npm pack verified. |

---

## Specification Change History

Record specification changes and additions made during implementation here. Always reflect changes in `docs/spec.md`.

| Date | Change | spec.md Updated |
|------|--------|-----------------|
| 2026-02-23 | Added Sections 8-11 (a11y, CSS customization, supported environments, license) | Done |
| 2026-03-20 | Added `initialMargin` property (Issue #20): auto-applies margin width on first value set | Done |
