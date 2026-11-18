# Tsuki v2 Project Framework

## Active and historical code

`packages/tsuki/src/` is the v2 source and public entry point. The complete 1.x source tree is retained at `packages/tsuki/bak/src/` as a read-only reference. The v2 package build reads only `src/`, publishes only `dist/`, and does not import from `bak/`.

`apps/playground/` remains the 1.x history browser. Its TypeScript, Jest, and Metro aliases and the fixture catalog generator point to `bak/src`. The two `apps/nativewind-*-consumer/` projects are separate v2 integration consumers so their Tailwind and NativeWind versions do not share an app runtime.

## Public v2 surface

The package root exports the v2 `Button`, `Input`, `TsukiProvider`, `ConfigProvider`, `useTsukiTheme`, `serializeTheme`, and `cn` APIs. It does not re-export the archived 1.x component or JavaScript theme engine. CSS resources are explicit subpath exports; the root entry does not import CSS.

The v2 foundation keeps its first public components focused:

- `Button` wraps React Native `Pressable`, uses CVA variants, supports a leading icon and loading state, and defaults to the `button` accessibility role.
- `Input` wraps React Native `TextInput`, preserves its native props, and adds a styled root container, disabled and validation states, and prefix/suffix slots.
- Both use `className` for root utilities, `classNames` for named semantic slots, `style` for root React Native styles, and `styles` for named React Native style slots.
- `cn()` combines `clsx` conditionals with `tailwind-merge` conflict resolution.

Component documentation and canonical v2 examples live in `docs/components/v2/` and each v2 component's `__fixtures__/` directory. The historical Playground catalog intentionally continues to scan only `bak/src`.

## Theme contract

`ThemeScheme` is `light | dark`. The consuming project owns system appearance, user preference, and persistence, then passes the resolved `scheme` to `TsukiProvider`.

`ThemeConfig` can override the ten semantic color tokens and the Button/Input component tokens:

```ts
interface ThemeConfig {
  semantic?: Partial<SemanticTokens>
  components?: {
    Button?: Partial<{ borderRadius: number; height: number }>
    Input?: Partial<{ borderRadius: number; height: number }>
  }
  inherit?: boolean
}
```

`TsukiProvider` creates the root scope. Nested `ConfigProvider` scopes merge semantic and component values with their parent. `inherit: false` starts from the light or dark defaults for the current scheme, then applies that scope's overrides. Theme resolution is object merging; it does not migrate the 1.x Seed/Map/Alias engine.

`useTsukiTheme()` returns the resolved scope. `serializeTheme()` converts it to CSS custom properties such as `--tsuki-color-primary`, `--tsuki-button-height`, and `--tsuki-input-border-radius`. The app adapts this object to its NativeWind runtime:

```tsx
function ThemeVariables({ children }: PropsWithChildren) {
  const theme = useTsukiTheme()
  return <VariableContextProvider value={serializeTheme(theme)}>{children}</VariableContextProvider>
}
```

For NativeWind v4, the consumer uses `vars(serializeTheme(theme))` on a wrapping View. For v5, the consumer uses `VariableContextProvider`. Put the bridge inside each `ConfigProvider` when a nested scope needs its own runtime variables. The consumer apps include workspace paths for local development; the tarball check removes those TypeScript aliases before checking the installed package.

## CSS and package resources

The build generates `theme.css` from `theme/defaults.ts` and `theme/serialize-theme.ts`, then writes it to `src/theme/theme.css` and `dist/theme/theme.css`. It copies the NativeWind mappings into `dist/theme/` without cleaning `dist/`:

- `src/theme/nativewind-v4-preset.cjs` → `dist/theme/nativewind-v4-preset.cjs`
- `src/theme/nativewind-v5.css` → `dist/theme/nativewind-v5.css`

The consumer-facing paths are `@ftsukic/tsuki/theme.css`, `@ftsukic/tsuki/nativewind-v4-preset`, and `@ftsukic/tsuki/nativewind-v5.css`. Consumer apps import the required CSS and manage utility generation; Tsuki Core has no NativeWind, Tailwind, or `react-native-css` dependency. Tailwind 3's `postcss-import` does not resolve the package CSS export map in this workspace, so the v4 canary imports the installed package file from `node_modules/@ftsukic/tsuki/dist/theme/theme.css` directly.

The v4 consumer uses NativeWind `4.2.7` with Tailwind `3.4.17`, the NativeWind preset, the Tsuki preset, and Metro `withNativeWind`. It declares `react-native-css-interop` directly so Metro can resolve the JSX runtime emitted by the NativeWind Babel preset, and scans the app source plus `node_modules/@ftsukic/tsuki/dist`.

The v5 consumer uses NativeWind `5.0.0-rc.1`, `react-native-css` `3.1.0-rc.1`, Tailwind `4.1.12`, `@tailwindcss/postcss` `4.1.12`, PostCSS `8.5.6`, and Lightning CSS `1.30.1`. Its CSS entry maps tokens with `@theme inline`; Metro excludes the dynamic `--tsuki-*` variables from inlining. The workspace pins Lightning CSS to `1.30.1` and declares Expo Metro Config directly to keep the RC CSS bundler aligned. NativeWind v5 is a release candidate, and its official docs prefer `VariableContextProvider` for dynamic values. See [v5 Dynamic Themes](https://www.nativewind.dev/v5/guides/themes) and the [RC compatibility notes](https://github.com/nativewind/nativewind/blob/main/docs/rc-compatibility.md).

Both consumers target Expo 57 / React Native 0.86.3 / React 19.2.3 and retain the workspace's Reanimated 4.7.1 / Worklets 0.13.1 versions. They verify the same light/dark values, semantic overrides, component overrides, and nested scopes.

## Legacy isolation and checks

- Bob compiles only the new `src/` tree into `dist/`; the asset-copy script writes only `dist/theme/`.
- Jest's existing suite runs from `bak/src`. `test:v2` runs the v2 foundation tests from `src/`.
- The legacy Fixture Generator scans `bak/src` and writes the existing Playground catalog.
- The legacy Playground resolves `@ftsukic/tsuki` to `bak/src` at typecheck, Jest, and Metro time.
- `release:check-package` verifies the public exports and that `bak/`, `lib/`, source tests, and old fixtures are absent from the packed package.
- `consumers:tarball` creates a real npm tarball, installs it into two temporary projects, then typechecks and bundles both consumer configurations.
- Android Dev Build verification is recorded separately from static checks; a successful typecheck or CSS build does not establish device behavior.
