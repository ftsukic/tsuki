# Tsuki v2 Package and Consumer Architecture

This guide describes the architecture at the current repository state. The package manifest, source exports, consumer apps, fixture manifest, build scripts, release workflow, and CI are the authority when this document needs an update.

## Active source, archive, and package output

| Path | Role | Built or published? |
| --- | --- | --- |
| `packages/tsuki/src/` | Active v2 components, Theme, Style, tests, and canonical examples. `src/index.ts` is the package's JavaScript entry surface. | Bob compiles this tree into `dist/`; source itself is not packed. |
| `packages/tsuki/bak/src/` | Complete archived v1 source used by the Legacy Playground and historical tests. | Not compiled or included in the npm package. |
| `packages/tsuki/dist/` | Generated CommonJS, ES Module, TypeScript declaration, and Theme CSS outputs. | Included in the npm package. |
| `packages/consumer-fixtures/` | Private, shared NativeWind integration scenarios and their tests. | Workspace-only; excluded from `@ftsukic/tsuki`. |

`packages/tsuki/package.json` sets Bob's source to `src` and output to `dist`. `pnpm run build` runs Bob and `scripts/copy-theme-assets.cjs`. That script generates `theme.css` from the v2 defaults and serializer, then copies `theme.css`, `nativewind-v4-preset.cjs`, and `nativewind-v5.css` into `dist/theme/`.

The package `files` allowlist contains `assets`, `dist`, `README.md`, and `LICENSE`. The package validation script also checks required export targets and rejects archive source, Playground apps, tests, and fixtures from the tarball. NativeWind, Tailwind, and `react-native-css` are not runtime dependencies of Tsuki Core.

## Public package surface

Consumers import JavaScript APIs from `@ftsukic/tsuki`. The root export provides nine component families; `CellGroup` is exported alongside `Cell`:

| Family  | Public symbols                                    |
| ------- | ------------------------------------------------- |
| Button  | `Button` and Button props/types                   |
| Card    | `Card` and section props/types                    |
| Cell    | `Cell`, `CellGroup`, and row/group props/types    |
| Divider | `Divider`, `DividerProps`                         |
| Icon    | `Icon`, `IconName`, `IconDefinition`, `IconProps` |
| Input   | `Input` and props/types                           |
| Space   | `Space`, `SpaceProps`                             |
| Surface | `Surface`, `SurfaceProps`                         |
| Text    | `Text`, `TextClassContext`, text props/types      |

The same root entry exports `TsukiProvider`, `ConfigProvider`, `useTsukiTheme`, `serializeTheme`, `cn`, and their public types. There are no JavaScript subpath exports for individual components. The package export map is limited to the root JavaScript entry and these CSS/preset resources:

- `@ftsukic/tsuki/theme.css`
- `@ftsukic/tsuki/nativewind-v4-preset`
- `@ftsukic/tsuki/nativewind-v5.css`

`scripts/validate-package.cjs` checks this export map and verifies that every mapped file exists in the packed tarball.

## Theme API

`ThemeScheme` is `light | dark`. The app resolves system appearance, user preference, and persistence, then passes a scheme to `TsukiProvider`. The provider accepts an optional `ThemeConfig`; it does not accept `system` as a scheme.

`ThemeConfig` can partially override 10 semantic color tokens and six component token groups: Button, Input, Divider, Surface, Card, and Cell. `ConfigProvider` merges local semantic and component values with its parent by default. With `inherit: false`, it starts from the default theme for the active scheme before applying the local override. It does not change the scheme.

`useTsukiTheme()` returns the resolved scope. `serializeTheme()` maps semantic and component values to `--tsuki-*` CSS variables. Numeric values are serialized with `px`, except Cell's `disabledOpacity`, which remains unitless. See the [Theme v2 guide](../components/v2/theme/index.md) for token names, defaults, nested scopes, and both NativeWind bridges.

## CSS resources and NativeWind consumers

The app chooses its own CSS runtime, utility generation, and variable bridge. The v4 and v5 integration apps share only `@ftsukic/consumer-fixtures`; they keep separate NativeWind versions, PostCSS/Tailwind setup, and Metro configuration.

| Consumer | Workspace runtime | CSS setup | Runtime variable bridge |
| --- | --- | --- | --- |
| `apps/playground-nw4/` | NativeWind `4.2.7`, Tailwind `3.4.17`, `react-native-css-interop` `0.2.7` | Tailwind preset `@ftsukic/tsuki/nativewind-v4-preset`; global CSS imports the installed `dist/theme/theme.css`. | `vars(serializeTheme(theme))` on a React Native `View`. |
| `apps/playground-nw5/` | NativeWind `5.0.0-rc.1`, `react-native-css` `3.1.0-rc.1`, Tailwind `4.1.12` | Global CSS imports Tailwind utilities, `nativewind/theme`, `@ftsukic/tsuki/theme.css`, and `@ftsukic/tsuki/nativewind-v5.css`. | `VariableContextProvider` receives `serializeTheme(theme)`. |

Both apps currently use Expo SDK `57.0.32`, React Native `0.86.3`, and React `19.2.3`. NativeWind v5 is a release candidate in this pinned workspace. For a nested theme scope, render that app's variable bridge within the matching `ConfigProvider`; this makes the child variables available to its descendants. Full runnable settings are in the [v4 Consumer](../../apps/playground-nw4/) and [v5 Consumer](../../apps/playground-nw5/).

## Playground and fixture catalog

`apps/playground/` is the component and theme development workbench. Its home screen links to Components, Theme Playground, and Design Tokens. Components includes both v2 and Legacy v1 entries; the separate theme and token pages do not enter the component catalog.

`apps/playground/fixtures/manifest.json` is the catalog source. It currently defines 64 component entries: 9 v2 and 55 Legacy v1. The v2 entries reference 73 runnable examples under `packages/tsuki/src/<component>/__fixtures__/examples/`. `scripts/generate-fixture-catalog.cjs` validates those fixture sets and generates `apps/playground/fixtures/catalog.ts`; the catalog must not be maintained separately.

The Playground's TypeScript and Jest aliases map `@ftsukic/tsuki` to `bak/src` for its legacy application shell. Metro resolves imports from v2 source files to the v2 root and other Playground imports to the v1 archive. `V2Preview` supplies a v2 `TsukiProvider` and NativeWind v5 variable context to v2 fixtures. This keeps historical v1 Theme behavior separate from v2 Theme demonstrations while preserving existing v1 fixture IDs and routes.

## Shared Consumer validation scenarios

`packages/consumer-fixtures/` is a private workspace package used by both NativeWind apps. It imports components only from `@ftsukic/tsuki` and contains the shared component, Theme override, nested scope, style precedence, and interaction scenarios. The v4 and v5 `App.tsx` files own their respective providers, CSS initialization, and variable bridge.

The tarball script stages the private fixtures beside each temporary consumer and points `@ftsukic/tsuki` at the actual npm tarball. It removes workspace TypeScript aliases before running installation, typecheck, Expo config, and iOS/Android development bundle checks. The private fixture package is not added to the published package contents.

## Build, validation, and release

The root scripts provide the following checks:

- `pnpm run build` builds the v2 package and copies its Theme CSS resources.
- `pnpm run fixtures:check` verifies the canonical fixture manifest and generated Playground catalog.
- `pnpm run typecheck` checks the package, package fixtures, private consumer fixtures, both consumers, and Playground.
- `pnpm run test` runs the archived v1 tests, v2 tests, and Playground tests.
- `pnpm run consumers:tarball` packs the library and validates both independent consumers against that tarball.
- `pnpm run release:check-package` validates package exports and contents using `npm pack --dry-run`.

The complete quality gate is `.github/workflows/ci.yml`. It also validates Consumer configs, lint, formatting, Playground bundles, and Changeset status. The publish workflow in `.github/workflows/publish.yml` runs only for a version tag, validates its version and release branch ancestry, then publishes `packages/tsuki` through npm Trusted Publishing. On `main`, `docs/releasing.md` defines the beta line and `next` dist-tag. Changeset prerelease mode stays active through beta releases; version generation and publishing are separate release actions.

A successful static check or bundle export does not prove Android or iOS runtime behavior. Record native launches and interactions separately from build and bundle validation.
