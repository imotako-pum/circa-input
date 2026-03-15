# Development Guide (CONTRIB.md)

A guide covering the procedures and rules for contributing to circa-input development.

---

## Prerequisites

- **Node.js**: >= 18
- **Package Manager**: pnpm

---

## Setup

```bash
git clone https://github.com/imotako-pum/circa-input.git
cd circa-input
pnpm install
pnpm build
```

---

## Available Scripts

### Root (Entire Monorepo)

| Command | Description |
|---|---|
| `pnpm build` | Build all packages |
| `pnpm test` | Run tests for all packages |
| `pnpm dev` | Build all packages in watch mode |
| `pnpm lint` | Static analysis with Biome |
| `pnpm lint:fix` | Auto-fix with Biome |
| `pnpm format` | Format with Biome |
| `pnpm type-check` | TypeScript type checking for all packages |

### @circa-input/core

| Command | Description |
|---|---|
| `pnpm --filter @circa-input/core build` | Build core |
| `pnpm --filter @circa-input/core test` | Run core tests |
| `pnpm --filter @circa-input/core test:watch` | Run core tests in watch mode |
| `pnpm --filter @circa-input/core dev` | Build core in watch mode |
| `pnpm --filter @circa-input/core type-check` | Type check core |

### @circa-input/web-component

| Command | Description |
|---|---|
| `pnpm --filter @circa-input/web-component build` | Build web-component |
| `pnpm --filter @circa-input/web-component test` | Run web-component tests |
| `pnpm --filter @circa-input/web-component dev` | Build web-component in watch mode |
| `pnpm --filter @circa-input/web-component type-check` | Type check web-component |

---

## Testing

- **Framework**: Vitest
- **web-component test environment**: happy-dom (Shadow DOM support)
- **Coverage**: `@vitest/coverage-v8`

```bash
# Run all tests
pnpm test

# With coverage
pnpm --filter @circa-input/web-component test -- --coverage
```

---

## Linter & Formatter

**Biome** is used. Configuration is in `biome.json`.

```bash
# Check only
pnpm lint

# Auto-fix
pnpm lint:fix
```

Key rules:
- `noExplicitAny`: error (usage of `any` type is prohibited)
- Indentation: 2 spaces
- Line width: 80 characters
- Quotes: double quotes
- Semicolons: required

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Release |
| `develop` | Development integration |
| `feature/*` | Feature development |
| `fix/*` | Bug fixes |

---

## Package Structure

```
circa-input/
├── packages/
│   ├── core/           # Pure TS logic (no DOM dependency)
│   ├── web-component/  # <circa-input> custom element
│   └── react/          # React adapter (@circa-input/react)
├── apps/
│   ├── demo/           # Interactive demo site
│   └── demo-react/     # React demo site
├── docs/
│   ├── spec.md         # Technical specification (primary source of truth)
│   ├── ROADMAP.md      # Roadmap and progress
│   └── CONTRIB.md      # This file
├── CLAUDE.md           # Claude Code operational rules
└── biome.json          # Linter/formatter configuration
```

### Dependency Direction

```
core ← web-component ← react
```

- core does not depend on any other package
- web-component depends on core
- react wraps web-component

---

## Bundle Size Constraints

| Package | Target (gzip) |
|---|---|
| @circa-input/core | Under 2KB |
| @circa-input/web-component (includes core) | Under 8KB |

Check the gzip size of `dist/index.js` after building.

---

## Coding Rules

- Usage of `any` type is prohibited
- Type definitions + JSDoc comments required for all public APIs
- Use the `CircaInputError` custom class for errors
- Tests are required (especially for validation logic)
- See `CLAUDE.md` for details

---

## Release

Publishing **must** use `pnpm publish` (not `npm publish`) to correctly resolve `workspace:*` dependencies.

### Steps

1. Update version in all 3 `packages/*/package.json` files
2. Update `CHANGELOG.md`
3. Build: `pnpm build`
4. Test: `pnpm test`
5. Lint: `pnpm lint && pnpm type-check`
6. Publish in order (scoped packages require `--access public`):
   ```bash
   cd packages/core && pnpm publish --access public
   cd packages/web-component && pnpm publish --access public
   cd packages/react && pnpm publish --access public
   ```
7. Git tag: `git tag v<version> && git push --tags`
8. Create GitHub Release with changelog
