# Tsuki v2 Overlay Reference Study & Architecture Decision

| Item | Value |
| --- | --- |
| Study date | 2026-11-20 |
| Tsuki workspace baseline | `tsuki-1x-refactor` at `879b90d`; existing local edits are preserved. |
| Decision status | Batch 16A.2 study and architecture decision complete; Batch 16B runtime is not implemented. |
| Scope | React Native Reusables, rn-primitives, Arco Design Mobile, and react-native-screens `FullWindowOverlay`. |

This study reads the referenced projects' source and official documentation. It does not use Tsuki v1 as an implementation template, copy third-party runtime code, or validate native behavior on devices.

## 1. Scope and Version Baseline

The repository snapshots below are pinned to the upstream commits read for this study. Workspace package versions come from Tsuki's current manifests and lockfile.

| Project | Source baseline | Relevant version facts |
| --- | --- | --- |
| React Native Reusables | [commit `7df9e76c65c6f866a0865aa2697635c162d3484f`](https://github.com/founded-labs/react-native-reusables/tree/7df9e76c65c6f866a0865aa2697635c162d3484f) | The registry contains NativeWind and Uniwind component recipes. Its registry manifest depends on `react-native-screens ^4.25.2`. |
| rn-primitives | [commit `1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4`](https://github.com/roninoss/rn-primitives/tree/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4) | The Portal package is `@rn-primitives/portal 1.5.3`. |
| Arco Design Mobile | [commit `0aeba6f38778f73f89660a6d5877ad82ae783118`](https://github.com/arco-design/arco-design-mobile/tree/0aeba6f38778f73f89660a6d5877ad82ae783118) | The package manifest reports `@arco-design/mobile-react 2.39.1`. |
| react-native-screens | [commit `1ab993fdf809b6e63e04c4b3c312cfec7959080a`](https://github.com/software-mansion/react-native-screens/tree/1ab993fdf809b6e63e04c4b3c312cfec7959080a) | The Playground requests `react-native-screens ~4.26.2` and `react-native 0.86.3`; the lockfile resolves screens 4.26.2. |

The react-native-screens compatibility table lists `4.26.0+` for React Native `0.84.0+`. The workspace versions fit that documented range. The same table notes that screens 4.25.0 and later do not support the legacy Paper architecture. This package-level compatibility result does not establish FullWindowOverlay behavior in Tsuki's navigation setup. The upstream README and native implementation are linked in [Section 12](#12-official-source-links).

## 2. React Native Reusables

### Source facts

- The RNR Dialog registry recipe aliases `DialogPrimitive.Root`, `Trigger`, `Portal`, and `Close`, then adds styled Overlay, Content, Title, and Description wrappers.
- RNR delegates Dialog open state and portal registration to `@rn-primitives/dialog`. The primitive Root accepts controlled `open` or uncontrolled `defaultOpen` and reports changes through `onOpenChange`.
- The RNR NativeWind Dialog recipe conditionally wraps the Overlay in `react-native-screens`'s `FullWindowOverlay` on iOS. It uses Reanimated entering and exiting transitions for native presentation. The Uniwind recipe follows the same host-layer pattern.
- The primitive Dialog Content moves accessibility focus into the dialog; its Trigger restores focus when the dialog closes. Content registers an Android `BackHandler` in an effect and removes that listener when Content unmounts.
- The primitive Portal documentation places `PortalHost` after the navigation stack in the application root.

Sources: [RNR Dialog recipe](https://github.com/founded-labs/react-native-reusables/blob/7df9e76c65c6f866a0865aa2697635c162d3484f/packages/registry/src/nativewind/components/ui/dialog.tsx), [RNR Dialog documentation](https://github.com/founded-labs/react-native-reusables/blob/7df9e76c65c6f866a0865aa2697635c162d3484f/apps/docs/content/docs/components/dialog.mdx), and [rn-primitives Dialog source](https://github.com/roninoss/rn-primitives/blob/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4/packages/dialog/src/dialog.tsx).

### Assessment

RNR is a styled component recipe layer. The Portal store, Dialog state, component context, and native Back behavior live in rn-primitives. RNR demonstrates a compound API and shows that a component may conditionally use a native iOS layer wrapper. Its per-Content BackHandler is a primitive-level implementation choice; it does not provide the single Host-level Back dispatch required by Tsuki.

### Tsuki decision

Use compound composition as a future component API design input. Keep the Root state contract controlled/uncontrolled. Keep the Host and Registry independent of the recipe layer. Route Back through the Root Host adapter and Registry.

## 3. rn-primitives Portal Runtime

### Source facts

- `packages/portal/src/portal.tsx` creates one module-scoped Zustand store. Its map is keyed first by host name and then by Portal name.
- `PortalHost` selects entries for its host name. The default host name is a shared constant. A custom host name selects another map in the same store.
- `Portal` writes children to the store in an effect and removes the named entry in cleanup. Updates keep the same name.
- `PortalHost` renders each entry inside a React Fragment keyed by the Portal name. The source comment explains that stable keys prevent removing one Portal from transferring component state to the next entry.
- The store distinguishes named hosts, but contains no React Root identity. Host components read the shared store; they do not register and unregister Root-owned registries.
- Dialog Root creates a Dialog context value with state and a generated ID. Dialog Portal explicitly wraps its portalled children in that Dialog context. Dialog Content owns its BackHandler effect, focus entry, and accessibility role.

Sources: [Portal runtime](https://github.com/roninoss/rn-primitives/blob/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4/packages/portal/src/portal.tsx), [Dialog runtime](https://github.com/roninoss/rn-primitives/blob/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4/packages/dialog/src/dialog.tsx), [accessibility focus hook](https://github.com/roninoss/rn-primitives/blob/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4/packages/hooks/src/useAccessibilityFocus.tsx), and [focus restoration hook](https://github.com/roninoss/rn-primitives/blob/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4/packages/hooks/src/useRestoreAccessibilityFocus.tsx).

### Assessment

Named hosts allow placement choices inside one module store. They do not isolate multiple React Roots. Since every host reads the same module store, equal host names in separate Roots resolve to the same entries. This is a consequence of the source's store shape.

The explicit Dialog context Provider is a useful example of component-owned context bridging. Arbitrary application Context is not captured as a generic Portal contract. The Portal runtime also has no entry transition state or exit-completion protocol; the component and animation layer determine mount timing.

### Tsuki decision

Keep a private Registry per React Root. Give each entry a stable ID and use it as the React key for every update. Removing an intermediate entry must preserve the state of the remaining keyed entries. Do not copy the module-global Zustand store or use host names as a substitute for Root identity.

## 4. Arco Design Mobile Masking

### Source facts

- `Masking` is the base for its modal visual layer. It accepts controlled `visible` and a `close` callback. It supports separate mask and content transitions, `mountOnEnter`, and `unmountOnExit`; `unmountOnExit` defaults to true.
- `onOpen` and `onClose` run after the declared transition durations. The implementation waits for the maximum mask/content timeout before hiding its outer container and calling `onClose`.
- `Dialog` is composed on `Masking`. `Popup` also uses `Masking`; `ActionSheet` uses `Popup`. Their imperative helpers are generated from those layers.
- The implementation uses browser DOM nodes, `document`, `HTMLElement`, CSS classes, CSS transitions, and body-scroll handling.

Sources: [Masking implementation](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/masking/index.tsx), [Popup implementation](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/popup/index.tsx), [Dialog implementation](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/dialog/index.tsx), and [ActionSheet implementation](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/action-sheet/index.tsx).

### Assessment

Arco has a clear component stack: Masking provides the shared mask/content lifecycle, while Dialog, Popup, and ActionSheet add their own composition and semantics. Its API separates visibility, close request, and close-completion notification. Its DOM mount, CSS transition, and scroll-lock mechanics are browser-specific.

### Tsuki decision

Reuse the separation between component semantics and shared mounting lifecycle as an API-design reference. Tsuki's Registry will preserve an Entry through its exit animation and remove it only when Motion reports completion. Fixed timeout guesses will not control native unmount timing.

## 5. Arco Imperative API and Context

### Source facts

- `Masking.open(config)` creates a DOM container and schedules `visible=true` after `nextTick`. It returns `{ close, update }`. `close()` sets visibility false. `update(nextConfig)` normalizes, merges, and re-renders configuration.
- When `unmountOnExit` is true, the close-completion callback unmounts the React root and removes its DOM node. With `unmountOnExit` false, the helper can cache and reuse a React root by its container ID.
- The render helper creates a React DOM root when available and falls back to legacy `ReactDOM.render`. This is a separate React root per imperative mount.
- `GlobalContextParams` contains Arco-specific settings such as prefix, platform, dark mode, locale, theme variables, RTL, and an optional React 19 `createRoot` function.
- `CompWithGlobalContext` captures Arco's current `GlobalContext`, merges an optional explicit context argument, and provides that Arco context around the separately rendered component.

Sources: [Masking imperative methods](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/masking/methods.tsx), [React DOM root adapter](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/_helpers/render.tsx), [React DOM compatibility adapter](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/_helpers/react-dom.ts), and [GlobalContext provider](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/context-provider/index.tsx).

### Assessment

The returned handle is a useful shape for updateable imperative UI. The explicit context argument makes Arco's own context boundary visible. The DOM root and the limited Arco context wrapper do not imply automatic inheritance of arbitrary React Context.

### Tsuki decision

Use the `open(config)`, `update(config)`, and `close()` shape as a design reference only. Tsuki controllers must bind to an owning Root Registry. Do not create a new React Root per Entry or expose a module-level static renderer.

## 6. react-native-screens FullWindowOverlay

### Source facts

- The public wrapper is iOS-specific. It fills the window dimensions and renders a normal `View` on other platforms after warning.
- The iOS native component creates an `RNSFullWindowOverlayContainer`. When attached, it adds that container as a subview of the current `UIWindow`; a `UIWindow` category brings the overlay container to the front when later subviews are added.
- The container's `accessibilityViewIsModal` defaults to true. The wrapper exposes `unstable_accessibilityContainerViewIsModal` to configure it. On attachment, the native code posts an accessibility layout-changed notification for the container.
- Native hit testing walks the overlay's children in z-order and returns a child hit. The transparent container does not claim every empty area by itself.
- The implementation can fall back to `RCTKeyWindow()` when the parent view has no window; a source comment says this fallback can select the wrong window in multi-window apps.
- FullWindowOverlay changes a native view's placement. It does not create or manage a general Portal registry. React Native Screens' native stack is a navigation primitive; FullWindowOverlay is a separate view wrapper that can be rendered inside a screen.

Sources: [FullWindowOverlay documentation and compatibility table](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/README.md), [JS wrapper](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/src/legacy/components/FullWindowOverlay.tsx), [iOS native implementation](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/ios/legacy/RNSFullWindowOverlay.mm), [UIWindow ordering](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/ios/UIWindow+RNScreens.mm), and [native-stack sample](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/apps/src/tests/issue-tests/Test1096.tsx).

### Assessment

FullWindowOverlay can address iOS native view ordering above navigation content. Its accessibility container defaults to modal semantics, which can conflict with a shared Host containing modal and non-modal entries. Its native placement, multi-window fallback, navigation presentation, touch routing, and VoiceOver behavior require an app-specific check. It does not supply Registry ownership, Entry identity, Context Bridge, or cross-platform behavior.

### Tsuki decision

Use a regular React Native `View` as the baseline Host on all platforms. Evaluate FullWindowOverlay in a separate iOS-only Batch 16B.0 spike. Make it an optional native layer adapter only if that validation demonstrates a need. If adopted, set its accessibility modal behavior intentionally and preserve the same per-Root Registry and Entry lifecycle. Android and HarmonyOS retain the common View Host contract.

## 7. Reference Comparison

| Reference | Useful pattern | Constraint for Tsuki |
| --- | --- | --- |
| React Native Reusables | Styled compound components; controlled/uncontrolled state; animation at the component recipe. | RNR is a recipe layer and delegates Runtime behavior to rn-primitives. Its per-Content BackHandler does not meet Tsuki's Host-level dispatch contract. |
| rn-primitives | Named hosts, multiple entries, explicit Dialog context bridge, stable per-entry React keys, accessibility focus helpers. | Its module-scoped Zustand store does not isolate React Roots. Tsuki needs a private Registry per Root. |
| Arco Design Mobile | Shared Masking composition; clear visible/close/onClose split; imperative handle with update and close; explicit library context params. | Its DOM Portal, ReactDOM roots, CSS timeout lifecycle, and body-scroll code do not transfer to React Native. |
| react-native-screens | iOS native view ordering via UIWindow placement; configurable accessibility modal flag; child hit testing. | It is a platform host-layer primitive, not an Overlay Runtime. Its dependency and iOS behavior remain optional until verified. |

## 8. Tsuki v2 Requirement Mapping

| Requirement | Decision |
| --- | --- |
| Root isolation | Each React Root owns one private Registry and one Host through its root TsukiProvider. No module-global store or renderer selection. |
| Host location | Render the Host after navigation as a stable sibling under the root ThemeContext. It does not depend on Screen lifetime and does not carry component business semantics. |
| Rendering contract | Ordinary React Native View is the common baseline. Keep the root hit-test surface pass-through; individual content and masks own their hit regions. |
| Declarative components | Use Root / Trigger / Portal / Overlay / Content / Title / Description / Close composition. Root state supports controlled and uncontrolled modes. The component Root Context is explicitly bridged for registered content. |
| Imperative components | A tree call resolves its Registry and current ResolvedTheme from internal scope. A tree-external call requires an explicit Root-bound controller and uses that Root's theme. Unknown Root is an explicit error. |
| Public API | The compound API is a component-level design example. Do not add a generic public Portal API in this batch. Decide public controller signatures with the concrete component. |
| Entry identity | Every Entry has a stable unique ID within its Registry. Re-renders and updates retain the ID and React key; unmount removes that Entry without changing other keys. |
| Entry lifecycle | Registry presence is separate from transition progress. Keep an Entry registered through entering, entered, and exiting; unmount only after Motion's successful exit completion. |
| Back | One Host-level entry point dispatches to the top visible Entry only. Components do not register independent global Back listeners. |
| Theme | Bridge only Tsuki's existing `ThemeContext` / `ResolvedTheme` and explicit component-owned Root Context. Nested ConfigProvider updates propagate to live entries. Do not promise arbitrary Context inheritance. |
| iOS layer | Start with View. Run a FullWindowOverlay comparison in 16B.0; adoption remains conditional on z-order, accessibility, touch, and dependency validation. |

## 9. Final Architecture Decision

### Host and Registry

- The root TsukiProvider is the sole Host and Registry owner for its React Root. It renders the Host after the navigation subtree in a stable root position.
- Every Root gets its own Registry. Host registration and cleanup do not destroy Registry entries. Entry ordering is owned by that Registry.
- The common Host uses a pass-through React Native View. iOS may use FullWindowOverlay only as a validated optional native layer wrapper. It never replaces the Registry or defines a second Entry system.
- A Host does not own Dialog, Popup, Toast, Safe Area, Keyboard, anchor positioning, or animation semantics.

### Declarative API

Future components may use this composition:

```tsx
<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title />
      <Dialog.Description />
      <Dialog.Close />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

`Root` owns that component's open state and supports controlled and uncontrolled use. `Trigger` requests opening. The component-scoped `Portal` submits content to the private Registry. `Overlay` owns mask behavior. `Content` owns content layout and accessibility. `Title`, `Description`, and `Close` provide their component semantics. Component Root Context is explicitly bridged to the Host-rendered Entry. This does not add a generic public `Portal` component.

### Imperative API

The internal controller follows the Arco handle shape:

```ts
const instance = controller.open(config)
instance.update(nextConfig)
instance.close()
```

The controller is bound to one Root Registry. Tree-scoped calls obtain it from private Overlay Runtime Context and capture the current ResolvedTheme. A caller outside the React tree must hold an explicit controller bound to the intended Root. No module-level active renderer, last-registered fallback, global Registry, or implicit Root inference is allowed. The public API shape remains a component-design decision.

### Context Bridge

- Preserve Tsuki's existing ThemeContext and ResolvedTheme. A Theme Bridge wraps each Entry and updates its value when the source Theme scope changes.
- Declarative Entry content re-provides any component-owned Context required by that compound API, following the explicit Dialog Context pattern from rn-primitives.
- The Bridge does not copy arbitrary business Context. A tree-external controller uses the root TsukiProvider theme.
- ConfigProvider remains a Theme scope. It never creates a Host or Registry. Changes to its resolved Theme must update entries opened from that scope.

### Entry Lifecycle

Registry membership and presentation phase are separate. The expected phase sequence is:

```text
registered/mount
  -> entering
  -> entered (fully visible)
  -> exiting (still registered and rendered)
  -> Registry.unmount
```

- Motion drives entering and exiting progress. A successful Motion completion moves the Entry to the next phase; successful exit completion asks the Registry to unmount it.
- Reduced Motion and zero-duration transitions still notify completion, so close does not need a fixed timeout.
- Repeated close and unmount operations are idempotent. An exiting top Entry stays the Back target until it is removed, so one Back event cannot fall through to an underlying Entry.
- If an Entry is reopened while exiting, retain its ID and React key and invalidate the stale exit completion before it can unmount the reopened Entry.
- The existing `useTransitionProgress` initializes its value from the initial `visible` prop and animates on later changes. Batch 16B must explicitly stage the first enter transition instead of assuming `useTransitionProgress(true)` begins from zero.

### Back and Accessibility

Android and HarmonyOS use one Host-level Back adapter and dispatch only to the top visible Entry: `dismiss`, `consume`, or `passthrough`. iOS does not emulate Android Back. Entry components retain their accessibility roles, focus movement, and focus restoration. Host-level accessibility must not mark every entry modal.

## 10. Designs Not Adopted

- A module-level Zustand Registry shared by multiple React Roots.
- Root selection by global active renderer, the last registered Host, or an inferred default.
- A separate React Root for each overlay Entry.
- A generic public Portal API before a concrete public component requires it.
- Automatic inheritance of arbitrary React Context.
- A fixed timeout as the source of exit completion.
- Arco's DOM Portal, ReactDOM container, or CSS transition implementation.
- RNR or rn-primitives runtime code copied into Tsuki.
- FullWindowOverlay as a required dependency before iOS validation, or as a substitute for the common Host and Registry.
- React Native Modal as the general-purpose Overlay Host.

## 11. Batch 16B Implementation Route

| Batch | Scope | Acceptance focus |
| --- | --- | --- |
| 16B.0 | iOS Host Layer validation | Compare View and FullWindowOverlay in the real navigation setup; verify UIWindow z-order, touch routing, VoiceOver modal behavior, presentation boundaries, multi-window behavior, and dependency implications. Keep View if the evidence does not require FullWindowOverlay. |
| 16B.1 | Registry, Entry, subscriptions, lifecycle | Per-Root isolation; stable IDs and keys; ordered update; middle-entry removal preserving other state; idempotent unmount; exit completion contract. |
| 16B.2 | Host, root Provider, Theme Bridge | One stable Host after navigation; StrictMode-safe register/unregister; root and nested ConfigProvider theme updates; View touch-through. |
| 16B.3 | Internal declarative Portal primitive | Mount and update from the Registry; explicit component Root Context bridge; no public generic Portal. |
| 16B.4 | Root-bound imperative controller | Explicit Root binding, update/close handles, tree-scope Theme capture, and a clear failure when Root ownership is missing. |
| 16B.5 | Back, accessibility, Motion collaboration | Topmost-only Back; focus entry/restoration; modal semantics per Entry; enter/exit callbacks including Reduced Motion; no timeout-driven unmount. |
| 16B.6 | Overlay Lab and three-platform acceptance | Exercise stacking, touch-through, state retention, theme updates, lifecycle, Back, VoiceOver/TalkBack/Harmony accessibility, and navigation/platform boundaries. |

Each batch is reviewed separately. Batch 16A.2 completes the decision work only; it does not start 16B.0 or implement runtime code.

## 12. Official Source Links

- [RNR Dialog recipe](https://github.com/founded-labs/react-native-reusables/blob/7df9e76c65c6f866a0865aa2697635c162d3484f/packages/registry/src/nativewind/components/ui/dialog.tsx)
- [RNR Dialog documentation](https://github.com/founded-labs/react-native-reusables/blob/7df9e76c65c6f866a0865aa2697635c162d3484f/apps/docs/content/docs/components/dialog.mdx)
- [rn-primitives Portal source](https://github.com/roninoss/rn-primitives/blob/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4/packages/portal/src/portal.tsx)
- [rn-primitives Portal documentation](https://github.com/roninoss/rn-primitives/blob/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4/apps/docs/src/content/docs/portal.mdx)
- [rn-primitives Dialog source](https://github.com/roninoss/rn-primitives/blob/1bebe66b12e7ddd3c313226e0bc2ee02b6e78ab4/packages/dialog/src/dialog.tsx)
- [Arco Masking source](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/masking/index.tsx)
- [Arco imperative methods](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/masking/methods.tsx)
- [Arco Popup source](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/popup/index.tsx)
- [Arco Dialog source](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/dialog/index.tsx)
- [Arco ActionSheet source](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/action-sheet/index.tsx)
- [Arco GlobalContext source](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/context-provider/index.tsx)
- [Arco React DOM root adapter](https://github.com/arco-design/arco-design-mobile/blob/0aeba6f38778f73f89660a6d5877ad82ae783118/packages/arcodesign/components/_helpers/render.tsx)
- [react-native-screens FullWindowOverlay docs and compatibility table](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/README.md)
- [react-native-screens JS wrapper](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/src/legacy/components/FullWindowOverlay.tsx)
- [react-native-screens iOS implementation](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/ios/legacy/RNSFullWindowOverlay.mm)
- [react-native-screens UIWindow ordering](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/ios/UIWindow+RNScreens.mm)
- [react-native-screens native-stack sample](https://github.com/software-mansion/react-native-screens/blob/1ab993fdf809b6e63e04c4b3c312cfec7959080a/apps/src/tests/issue-tests/Test1096.tsx)
