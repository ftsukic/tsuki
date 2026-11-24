# Tooltip

`Tooltip` shows a short hint next to its trigger via `OverlayPortal`. On mobile, its default trigger is a long press; it can also open on press, compose custom interactive triggers via `asChild`, auto-close after a duration, or follow controlled visibility.

## Example

- [Long press, placement, ScrollView updates and theme](../../../../packages/tsuki/src/tooltip/__fixtures__/overview.tsx)

```tsx
import { Button, Tooltip } from '@ftsukic/tsuki'

function HelpHint() {
  return (
    <Tooltip content="Explains what this setting changes." placement="top" asChild>
      <Button variant="ghost">Help</Button>
    </Tooltip>
  )
}
```

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Trigger content. Wrapped in an accessible `Pressable` by default, or cloned directly when `asChild` is `true`. |
| `content` | `ReactNode` | — | Hint content. Strings and numbers use the themed text slot. |
| `trigger` | `'long-press' \| 'press'` | `'long-press'` | Mobile gesture used to open the hint. A visible hint can also be dismissed by pressing its trigger. |
| `visible` | `boolean` | uncontrolled | Controlled visibility. |
| `defaultVisible` | `boolean` | `false` | Initial visibility when `visible` is not supplied. |
| `onVisibleChange` | `(visible: boolean) => void` | — | Called when the trigger, outside press, Back, or `autoCloseDuration` requests a visibility change. |
| `afterOpen`, `afterClose` | `() => void` | — | Lifecycle callbacks fired after enter/exit transitions finish. |
| `placement` | `TooltipPlacement` | `'top'` | Preferred side and alignment (`top`, `bottom`, `left`, `right`, each with optional `-start` or `-end`). |
| `offset` | `number` | `8` | Gap between the trigger and the hint, in React Native layout units. |
| `collisionPadding` | `number \| Partial<Record<'top' \| 'right' \| 'bottom' \| 'left', number>>` | `8` | Minimum spacing from the destination Host edges. |
| `avoidCollisions` | `boolean` | `true` | Flip to the opposite side and keep the hint within the Host bounds when possible. |
| `repositionKey` | `string \| number` | — | Change this value to request a fresh anchor measurement, for example from a ScrollView `onScroll`. |
| `asChild` | `boolean` | `false` | Clones the single React element child and merges press/long-press handlers and accessibility state without adding an extra `Pressable` wrapper. |
| `closeOnPressOutside` | `boolean` | `false` | When `true`, renders a transparent hit-test layer that closes the Tooltip on outside press. |
| `closeOnBack` | `boolean` | `true` | Whether Android Back requests dismissal. |
| `autoCloseDuration` | `number` | — | Optional duration in milliseconds after which an open Tooltip automatically requests dismissal. |
| `disabled` | `boolean` | `false` | Disables trigger interaction. |
| `initialFocusRef`, `returnFocusRef` | `RefObject<ComponentRef<typeof View> \| null>` | — | Optional explicit accessibility focus targets on open and close. |
| `accessibilityLabel` | `string` | — | Label for the trigger button. |
| `accessibilityHint` | `string` | generated | Hint announced for the trigger. Defaults to the action for the selected trigger gesture. |
| `className`, `style` | `string`, `StyleProp<ViewStyle>` | — | Styles the trigger container. |
| `classNames` | `TooltipClassNames` | — | NativeWind classes for `root`, `content` and `text`. |
| `styles` | `TooltipStyles` | — | React Native styles for `root`, `content` and `text`. |
| `testID` | `string` | — | Test identifier for the trigger container. |

`visible` and `defaultVisible` follow the standard controlled/uncontrolled pattern. When `visible` is supplied, update it in response to `onVisibleChange` to change the rendered state.

Tooltip renders through the root `OverlayPortal` as a non-modal overlay with enter/exit fade transitions and frozen exit coordinates. Its content bubble is non-interactive (`pointerEvents="none"`). By default, `closeOnPressOutside` is `false` so surrounding UI stays interactive; set `closeOnPressOutside={true}` to dismiss on outside tap.

Floating measures the trigger and root Host when the hint opens and when either View lays out, and responds to window-size changes and `repositionKey` updates.

The bubble uses NativeWind-first semantic classes (`bg-tsuki-foreground`, `text-tsuki-background`) bridged through `TsukiProvider`'s `renderThemeScope`.
