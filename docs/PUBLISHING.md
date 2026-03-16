# Publishing Guide

How to publish circa-input packages to npm and manage subsequent updates.

---

## Prerequisites

### 1. npm Account

Create an account at [npmjs.com](https://www.npmjs.com/) if you don't have one.

```bash
# Log in from terminal
npm login

# Verify login
npm whoami
```

### 2. npm Organization

Since circa-input uses scoped packages (`@circa-input/*`), you need an npm Organization named `circa-input`.

1. Go to https://www.npmjs.com/org/create
2. Enter `circa-input` as the Organization name
3. Select the free plan

### 3. publishConfig

Scoped packages are **private by default** on npm. To publish them as free public packages, add the following to each package's `package.json`:

```json
"publishConfig": {
  "access": "public"
}
```

Applies to:
- `packages/core/package.json`
- `packages/web-component/package.json`
- `packages/react/package.json`

---

## Initial Publish (v0.1.0)

### Step 1: Build and Test

```bash
pnpm build && pnpm test
```

All tests must pass and builds must succeed before publishing.

### Step 2: Verify Package Contents

```bash
# Check what files will be included in each package
cd packages/core && npm pack --dry-run
cd ../web-component && npm pack --dry-run
cd ../react && npm pack --dry-run
```

Confirm that only the `dist/` directory is included (controlled by the `files` field in package.json). Source code, test files, and config files should NOT appear.

### Step 3: Publish in Dependency Order

**Order matters.** Packages must be published in dependency order because downstream packages reference upstream ones:

```
core (no deps) → web-component (depends on core) → react (depends on web-component)
```

```bash
# 1. core first
cd packages/core
npm publish --access public

# 2. web-component second
cd ../web-component
npm publish --access public

# 3. react last
cd ../react
npm publish --access public
```

### Step 4: Verify on npm

Visit the following URLs to confirm:
- https://www.npmjs.com/package/@circa-input/core
- https://www.npmjs.com/package/@circa-input/web-component
- https://www.npmjs.com/package/@circa-input/react

---

## Updating (Publishing New Versions)

### Semantic Versioning (SemVer)

npm uses `MAJOR.MINOR.PATCH` versioning:

| Change Type | Version Bump | Example |
|---|---|---|
| Bug fix (no breaking changes) | PATCH +1 | `0.1.0` → `0.1.1` |
| New feature (no breaking changes) | MINOR +1 | `0.1.0` → `0.2.0` |
| Breaking change (API changes) | MAJOR +1 | `0.1.0` → `1.0.0` |

> **Note:** While the version is `0.x.x` (pre-1.0.0), the package is considered unstable and breaking changes in MINOR bumps are conventionally acceptable.

### Manual Update Flow

```bash
# 1. Make changes, build, and test
pnpm build && pnpm test

# 2. Bump version (creates a git commit + tag automatically)
cd packages/core
npm version patch   # or minor / major

# 3. Publish
npm publish

# 4. Push the commit and tag to GitHub
git push && git push --tags
```

`npm version <patch|minor|major>` automatically:
- Updates `version` in package.json
- Creates a git commit
- Creates a git tag (e.g., `v0.1.1`)

### Updating Multiple Packages

When changes span multiple packages, update and publish them in dependency order:

```bash
# Example: core and web-component both changed
cd packages/core
npm version patch
npm publish

cd ../web-component
# Update the core dependency version in package.json if needed
npm version patch
npm publish

git push && git push --tags
```

---

## Recommended: Changesets (for Future Use)

[Changesets](https://github.com/changesets/changesets) is a tool designed for monorepo version management. It is recommended once the project matures.

### Setup

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

### Workflow

```bash
# 1. Record what changed (interactive prompt to select packages and bump type)
pnpm changeset

# 2. Apply version bumps + generate CHANGELOG
pnpm changeset version

# 3. Publish all changed packages
pnpm changeset publish

# 4. Push
git push && git push --tags
```

### Benefits

- Automatically keeps dependency versions in sync across packages
- Auto-generates CHANGELOG entries
- Can be integrated with CI for automated publishing
- Handles the publish order automatically

---

## Post-Publish Operations

### Deprecating a Version

If a published version has a critical issue, mark it as deprecated (users will see a warning on install):

```bash
npm deprecate @circa-input/core@0.1.0 "Critical bug found, please upgrade to 0.1.1+"
```

### Unpublishing a Version

Only possible within **72 hours** of publishing. After that, it cannot be removed.

```bash
npm unpublish @circa-input/core@0.1.0
```

> **Best practice:** Prefer `deprecate` + new version over `unpublish`.

### Provenance (Build Attestation)

When publishing from GitHub Actions, add `--provenance` to certify that the package was built from the repository's CI:

```bash
npm publish --provenance --access public
```

This adds a verified build badge on the npm package page.

### Checking Package Info

```bash
# View published package details
npm info @circa-input/core

# View all published versions
npm info @circa-input/core versions

# View download stats
npm info @circa-input/core
```

---

## CI Automated Publish (GitHub Actions)

Publishing is automated via `.github/workflows/publish.yml`. When a version tag (`v*`) is pushed, GitHub Actions automatically builds, tests, and publishes all three packages to npm.

### Authentication: OIDC Trusted Publishing

This project uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) instead of long-lived NPM_TOKEN secrets. GitHub Actions authenticates directly with npm via OIDC — no tokens to manage or rotate.

**How it works:**
1. GitHub Actions generates a short-lived OIDC token for the workflow run
2. npm verifies the token matches the trusted publisher configuration
3. The package is published with provenance attestation automatically

### Trusted Publisher Setup (already configured)

Each package has a trusted publisher configured on npmjs.com:

- https://www.npmjs.com/package/@circa-input/core/settings
- https://www.npmjs.com/package/@circa-input/web-component/settings
- https://www.npmjs.com/package/@circa-input/react/settings

Settings:
- **Publisher**: GitHub Actions
- **Username**: `imotako-pum`
- **Repository**: `circa-input`
- **Workflow filename**: `publish.yml`

### Workflow

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write   # Required for OIDC trusted publishing
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test

      - name: Publish @circa-input/core
        run: npm publish --provenance --access public
        working-directory: packages/core

      - name: Publish @circa-input/web-component
        run: npm publish --provenance --access public
        working-directory: packages/web-component

      - name: Publish @circa-input/react
        run: npm publish --provenance --access public
        working-directory: packages/react
```

> **Note:** `NODE_AUTH_TOKEN` is intentionally absent. OIDC trusted publishing activates only when this variable is not set.

### How to Release

```bash
# 1. Bump versions in package.json files
# 2. Commit and tag
git tag -a v0.2.0 -m "v0.2.0"
git push origin main --tags

# GitHub Actions handles the rest automatically
```

---

## Quick Reference

| Task | Command |
|---|---|
| Log in to npm | `npm login` |
| Check login | `npm whoami` |
| Preview package contents | `npm pack --dry-run` |
| Publish | `npm publish --access public` |
| Bump patch version | `npm version patch` |
| Bump minor version | `npm version minor` |
| Bump major version | `npm version major` |
| Deprecate a version | `npm deprecate @circa-input/core@x.y.z "message"` |
| View package info | `npm info @circa-input/core` |
