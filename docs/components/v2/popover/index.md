# Popover

`Popover` opens a positioned panel from a trigger. The panel can contain interactive actions and supports outside-press and Android Back dismissal, plus `asChild` trigger composition.

## Example

- [Basic, interactive actions, placements and theme](../../../../packages/tsuki/src/popover/__fixtures__/overview.tsx)

```tsx
import { Button, Popover } from '@ftsukic/tsuki'
import { Text } from 'react-native'

function Actions() {
  return (
    <Popover content={<Text>Custom menu content</Text>} placement="bottom-start" asChild>
      <Button>More actions</Button>
    </Popover>
  )
}
```

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Trigger content. Wrapped in an accessible `Pressable` by default, or cloned directly when `asChild` is `true`. |
| `content` | `ReactNode` | — | Panel content. Strings and numbers use the themed text slot. |
| `visible` | `boolean` | uncontrolled | Controlled visibility. |
| `defaultVisible` | `boolean` | `false` | Initial visibility when `visible` is not supplied. |
| `onVisibleChange` | `(visible: boolean) => void` | — | Called when the trigger, outside press, or Back requests a visibility change. |
| `afterOpen`, `afterClose` | `() => void` | — | Lifecycle callbacks fired after enter/exit transitions finish. |
| `placement` | `PopoverPlacement` | `'bottom'` | Preferred side and alignment (`top`, `bottom`, `left`, `right`, each with optional `-start` or `-end`), or `'auto'` to pick the side with the most available space. |
| `offset` | `number` | `8` | Gap between the trigger and panel, in React Native layout units. |
| `arrow` | `boolean` | `true` | Renders a directional arrow triangle on the edge facing the trigger, automatically aligned with the trigger center even after edge shifting. |
| `collisionPadding` | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `8` | Minimum spacing from the root Host edges. |
| `avoidCollisions` | `boolean` | `true` | Flip to the opposite side and keep the panel within the Host bounds when possible. |
| `repositionKey` | `string \| number` | — | Change this value to request a fresh anchor measurement, such as from a ScrollView `onScroll`. |
| `scrollBehavior` | `'follow' \| 'dismiss'` | `'follow'` | Behavior when an ancestor `FloatingScrollView` / `FloatingScrollScope` scrolls: `'follow'` tracks the trigger on the UI thread (0-jitter with `FloatingScrollView`) and remeasures on scroll end; `'dismiss'` closes the Popover when scrolling starts. |
| `asChild` | `boolean` | `false` | Clones the single React element child and merges `onPress` and accessibility state without adding an extra `Pressable` wrapper (useful for `<Button>` triggers). |
| `closeOnPressOutside` | `boolean` | `true` | Adds a transparent full-screen hit-test area that closes the Popover on outside press. |
| `closeOnBack` | `boolean` | `true` | Whether Android Back requests dismissal. |
| `disabled` | `boolean` | `false` | Disables trigger presses. |
| `initialFocusRef`, `returnFocusRef` | `RefObject<ComponentRef<typeof View> \| null>` | — | Optional explicit accessibility focus targets on open and close. |
| `accessibilityLabel` | `string` | — | Label for the trigger button. |
| `accessibilityHint` | `string` | generated | Hint describing how to open and dismiss the panel. |
| `className`, `style` | `string`, `StyleProp<ViewStyle>` | — | Styles the trigger container. |
| `classNames` | `PopoverClassNames` | — | NativeWind classes for `root`, `content` and `text`. |
| `styles` | `PopoverStyles` | — | React Native styles for `root`, `content` and `text`. |
| `testID` | `string` | — | Test identifier for the trigger container. |

`visible` and `defaultVisible` follow the standard controlled/uncontrolled pattern. When `visible` is supplied, update it in response to `onVisibleChange` to apply requested changes.

Popover uses the root `OverlayPortal` lifecycle for dismissal and exit transitions. Its default outside hit-test area covers the screen while open, so unrelated touches do not pass through until it closes. Set `closeOnPressOutside={false}` to remove that hit-test area; the trigger and panel remain interactive. Android Back requests dismissal when `closeOnBack` is `true`.

Floating measures the trigger and root Host and translates window coordinates into root-local coordinates before placement, and freezes the last measured position during exit transitions so the panel never flashes or jumps while fading out. A ScrollView that moves the trigger while the panel is open should pass its changing scroll offset as `repositionKey`.

The panel renders with NativeWind-first semantic token classes (`bg-tsuki-surface-elevated`, `border-tsuki-border`, `text-tsuki-foreground`) bridged through `TsukiProvider`'s `renderThemeScope`.
