# Portal

`Portal` renders arbitrary React content in the default Host or a named `PortalHost` owned by the nearest root `TsukiProvider`.

## Example

- [Default Host, named targets, concurrent entries and theme bridging](../../../../packages/tsuki/src/portal/__fixtures__/overview.tsx)

```tsx
import { Portal, PortalHost, Surface, Text } from '@ftsukic/tsuki'
import { View } from 'react-native'

function Screen() {
  return (
    <View style={{ flex: 1 }}>
      <PortalHost name="screen-overlay" />
      <Portal host="screen-overlay">
        <Surface bordered>
          <Text>Rendered inside this View's bounds</Text>
        </Surface>
      </Portal>
    </View>
  )
}
```

## API

### Portal

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Content rendered by a Host in the current root. |
| `host` | `string` | `root` | Target name. `root` selects the default Host; another value must match a mounted `PortalHost`. |

### PortalHost

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | — | Unique target name within the current root. The name `root` is reserved. |
| `style` | `StyleProp<ViewStyle>` | fills parent | Layout of the local native View that contains this target. |
| Other View props | `ViewProps` | — | Supported except `children` and `pointerEvents`; `pointerEvents` is fixed to `box-none` so unused area can receive touches. |

The entry is created when `Portal` mounts, updated in place when its children or `host` change, and removed when its owner unmounts. Updates preserve the entry's place in the stack. Later entries render above earlier entries at the same target. Moving an entry between Hosts can remount its React children, so child state is not preserved across that move.

Named targets use a registry separate from the unique root `OverlayHost`. Two live Hosts with the same name in one root throw an error; different roots may use the same name. If a named target has not mounted yet or is temporarily unmounted, its entry remains pending and renders when that Host returns. Content is never redirected to the root Host automatically.

A named `PortalHost` is a React Native View target, not an application-wide overlay layer. Its default bounds fill its parent and can be adjusted with `style`. Parent clipping, local `zIndex` and elevation, and native Window boundaries continue to apply.

## Behavior

`Portal` has no mask, transition, Android Back handling, or modal accessibility isolation. The default Host lets touches through outside Portal content. Each root has its own Registry and Host.

The calling Tsuki theme is bridged into the rendered content, including `ConfigProvider` updates. Other application React Context values are not automatically bridged; provide a required application context explicitly around the Portal content.

Portal content uses the styles, theme tokens, NativeWind classes and accessibility semantics of the content it contains. `Portal` has no `style` prop and does not define its own theme token.
