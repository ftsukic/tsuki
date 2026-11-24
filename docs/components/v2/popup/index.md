# Popup

`Popup` presents custom content in the current Tsuki Root Overlay Host. It supports five positions, controlled or uncontrolled visibility, a touch-blocking mask, Android Back, optional scrolling, optional close icon, keyboard avoidance, top/bottom safe-area spacing, and enter/exit transitions.

```tsx
import { Popup } from '@ftsukic/tsuki'

;<Popup visible={visible} onVisibleChange={setVisible} position="bottom" round>
  <Text>Custom content</Text>
</Popup>
```

See the canonical [basic example](../../../../packages/tsuki/src/popup/__fixtures__/examples/basic.tsx). The [Popup overview](../../../../packages/tsuki/src/popup/__fixtures__/overview.tsx) combines all published examples.

## Visibility and closing

- When `visible` is supplied, the owner controls visibility. Popup calls `onVisibleChange` with a close request; the owner decides whether to update `visible`.
- When `visible` is omitted, Popup manages its state and starts at `defaultVisible` (`false`). `defaultVisible` is read on mount.
- The default mask blocks touches behind the panel. Tapping it calls `onPressOverlay`; `closeOnPressOverlay` defaults to `false`. When enabled, Popup calls `onPressOverlay` first and then requests `visible=false`.
- `overlay={false}` removes the mask and its full-screen touch blocker. `modal` independently controls accessibility isolation and defaults to `true`.
- Android Back is routed through the Root Registry to the top visible overlay when `closeOnBack` is `true` (default). An exiting Popup consumes additional Back presses until its transition completes.
- `afterOpen` and `afterClose` fire when enter and exit transitions finish. Reopening during exit reverses the active transition.

## Positions and sizing

| `position` | Layout | Directional `round` corners | Enter transition |
| --- | --- | --- | --- |
| `center` (default) | Natural content size, centered, constrained to 90% of measured host width and height | All four corners (`rounded-tsuki-popup`) | Scale and fade |
| `top` | Full available width, attached to the top | Bottom corners (`rounded-b-tsuki-popup`) | From above |
| `bottom` | Full available width, attached to the bottom | Top corners (`rounded-t-tsuki-popup`) | From below |
| `left` | Full available height, attached to the left | Right corners (`rounded-r-tsuki-popup`) | From the left |
| `right` | Full available height, attached to the right | Left corners (`rounded-l-tsuki-popup`) | From the right |

The host is measured from its actual layout. Side and edge panels are constrained to the available host size. By default, `scrollable` is `false` so virtualized lists (`FlatList` / `FlashList`) and `flex: 1` drawer layouts work directly without nested `ScrollView` conflicts; set `scrollable={true}` when wrapping long static content or forms.

## Safe area and keyboard

- `safeAreaInsetTop` and `safeAreaInsetBottom` default to `false`. When enabled on matching edge positions (`top`/`left`/`right` for top inset; `bottom`/`left`/`right` for bottom inset), the corresponding `react-native-safe-area-context` inset is rendered inside the panel so the panel background extends through it.
- `keyboardAvoiding` defaults to `false`. On iOS, Popup uses React Native's `KeyboardAvoidingView`. On Android, Popup measures the real window frame of its root container (`measureInWindow`) against the keyboard frame; when the window already resized to the keyboard, the overlap is zero and no second offset is added.
- A visible keyboard suppresses the bottom safe-area spacer because the keyboard already replaces that bottom region. When `scrollable={true}`, the internal `ScrollView` uses `keyboardShouldPersistTaps="handled"`.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | — | Controlled visibility when supplied. |
| `defaultVisible` | `boolean` | `false` | Initial visibility when uncontrolled. |
| `onVisibleChange` | `(visible: boolean) => void` | — | Receives a state change or close request. |
| `afterOpen`, `afterClose` | `() => void` | — | Lifecycle callbacks fired after enter/exit transitions finish. |
| `position` | `PopupPosition` | `'center'` | One of `center`, `top`, `bottom`, `left`, or `right`. |
| `round` | `boolean` | `false` | Applies directional Popup border-radius token to the panel. |
| `overlay` | `boolean` | `true` | Renders the mask and its touch blocker. |
| `closeOnPressOverlay` | `boolean` | `false` | Requests close after a mask press. |
| `onPressOverlay` | `() => void` | — | Called when the rendered mask is pressed. |
| `closeOnBack` | `boolean` | `true` | Whether Android Back requests dismissal. |
| `modal` | `boolean` | `true` | Enables modal accessibility isolation; independent of `overlay`. |
| `scrollable` | `boolean` | `false` | Wraps panel children in a vertical `ScrollView`. |
| `closeable` | `boolean` | `false` | Renders a top-right close button inside the panel. |
| `closeIcon` | `ReactNode` | — | Custom close icon content when `closeable` is enabled. |
| `keyboardAvoiding` | `boolean` | `false` | Moves the available panel area above the keyboard. |
| `safeAreaInsetTop` | `boolean` | `false` | Adds the current top safe-area inset for `top`, `left`, and `right` panels. |
| `safeAreaInsetBottom` | `boolean` | `false` | Adds the current bottom safe-area inset for `bottom`, `left`, and `right` panels. |
| `initialFocusRef`, `returnFocusRef` | `RefObject<ComponentRef<typeof View> \| null>` | — | Optional explicit accessibility focus targets on open and close. |
| `className`, `style` | `string`, `StyleProp<ViewStyle>` | — | Applied to the visual panel (`container` slot). |
| `classNames`, `styles` | `PopupClassNames`, `PopupStyles` | — | Semantic slot overrides for `root`, `mask`, `wrapper`, and `container`. |
| `testID` | `string` | — | Prefix for the Popup root, wrapper, panel, mask, close button, and safe-area spacer test IDs. |
| `children` | `ReactNode` | — | Panel content. |

`PopupProps` is a composite overlay contract; it does not inherit all `ViewProps` and does not forward a ref to one of its several internal views. Use `testID`, `classNames`, and `styles` to address the named parts.

## Styling and theme

`className` and `style` target the visual panel (`container`), overriding `classNames.container` and `styles.container`. `classNames` and `styles` expose these semantic slots:

- `root`: full-screen content layout root.
- `mask`: touch-blocking overlay mask.
- `wrapper`: position and size constraint layer.
- `container`: visible panel.

Animation transforms and opacity run on a separate Overlay transition layer. Popup component tokens are `backgroundColor`, `overlayColor`, `borderRadius`, and `animationDuration` (milliseconds). Override them through `ConfigProvider` using `components.Popup`. NativeWind v4 and v5 expose `bg-tsuki-popup-background`, `bg-tsuki-popup-overlay`, `rounded-tsuki-popup` (plus directional `rounded-t/b/l/r-tsuki-popup`), and `duration-tsuki-popup`.

## Accessibility

`modal={true}` registers the Popup as an accessibility modal so the underlying page and lower overlays are isolated. `modal={false}` leaves the Popup non-modal. The mask is hidden from accessibility navigation; provide labels and actions on the Popup's own controls and content.

## Examples

- [Five positions](../../../../packages/tsuki/src/popup/__fixtures__/examples/positions.tsx)
- [Controlled visibility](../../../../packages/tsuki/src/popup/__fixtures__/examples/controlled.tsx)
- [Overlay press](../../../../packages/tsuki/src/popup/__fixtures__/examples/overlay.tsx)
- [Rounded panel](../../../../packages/tsuki/src/popup/__fixtures__/examples/round.tsx)
- [Bottom safe area](../../../../packages/tsuki/src/popup/__fixtures__/examples/safe-area.tsx)
- [Keyboard form](../../../../packages/tsuki/src/popup/__fixtures__/examples/keyboard.tsx)
- [Scrollable content](../../../../packages/tsuki/src/popup/__fixtures__/examples/scroll-content.tsx)
- [Theme override](../../../../packages/tsuki/src/popup/__fixtures__/examples/theme.tsx)
- [Nested Dialog and Portal](../../../../packages/tsuki/src/popup/__fixtures__/examples/nested-overlay.tsx)

Popup does not include an imperative service, cached hidden content, or a compound component API.
