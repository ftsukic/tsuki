# Cell / CellGroup

`Cell` presents one row of information or a settings action. `CellGroup` gives related rows a shared surface, header, and dividers. Import both from the package root.

```tsx
import { Cell, CellGroup, Icon } from '@ftsukic/tsuki'

;<CellGroup inset title="Account" extra="Personal">
  <Cell title="Name" value="Taylor" />
  <Cell vertical title="Email" description="Used for account recovery" value="taylor@example.com" />
  <Cell
    title="Privacy"
    leading={<Icon name="InfoCircleOutlined" />}
    showArrow
    onPress={openPrivacy}
  />
</CellGroup>
```

`Cell.Group` is the same component as `CellGroup`.

## Cell props

| Props | Behavior |
| --- | --- |
| `title`, `titleExtra`, `description`, `value`, `valueExtra` | Accept React nodes. Strings and numbers use Tsuki Text. Pass a custom element to control its own rendering and text styles. |
| `leading`, `trailing` | Optional areas on the outside of the main content. |
| `vertical`, `center` | Stack the title and value vertically, or center the outer row along its cross axis. Both default to false. |
| `valueAlign` | Align value text to `left`, `center`, or `right`. Defaults to right in horizontal rows and left in vertical rows. |
| `size` | `normal` (default) or `large`. |
| `titleLines`, `valueLines` | Line limits for automatically rendered text. Custom nodes control their own truncation. |
| `showArrow`, `arrowDirection` | Show an arrow facing `right` (default), `left`, `up`, or `down`. |
| `required` | Show a required marker next to the title. Set an accessible label when the marker conveys important context. |
| `clickable`, `disabled`, `onPress`, `onLongPress` | A callback or `clickable={true}` selects native Pressable. `clickable={false}` selects View and suppresses press callbacks. Disabled rows suppress interaction and expose the disabled state. |
| `border`, `divider` | Control the trailing divider. See the precedence below. |
| `className`, `style`, `classNames`, `styles` | Root and slot styling. |

Cell forwards native accessibility properties and press options. Interactive cells default to the button role. An explicit `role` or `accessibilityRole` takes precedence. Decorative arrows and divider lines are hidden from assistive technology.

## CellGroup props

| Props | Behavior |
| --- | --- |
| `children` | Renders Cells and other React nodes in order. Arrays and fragments are handled transparently. |
| `title`, `extra` | Optional left and right header content. |
| `inset` | Apply themed horizontal margins, rounded corners, and clipping to the body. |
| `border` | Enable the group’s outer border. Defaults to true. |
| `className`, `style`, `classNames`, `styles` | Root and slot styling. Other ViewProps are forwarded to the group root. |

Cell divider precedence is `border={false}`, then explicit `divider`, then group position. A standalone Cell has no divider by default. A group adds a divider after each direct Cell except the last. Other nodes render in place and do not count toward that position. A group's `border={false}` hides the outer border while retaining each row's divider behavior.

## Styling and theme

Use `classNames` for NativeWind classes and `styles` for native styles. Slot styles override slot classes. On the root, `className` overrides `classNames.root` and `style` overrides `styles.root`. Style the content of a custom React element directly.

| Component | Slots |
| --- | --- |
| Cell containers | `root`, `container`, `leading`, `titleContainer`, `titleRow`, `titleExtraContainer`, `valueContainer`, `valueExtraContainer`, `trailingContainer`, `arrow`, `divider` |
| Cell text | `title`, `titleExtra`, `description`, `value`, `valueExtra`, `trailing`, `required` |
| CellGroup | `root`, `header`, `title`, `extraContainer`, `extra`, `body` |

Override `theme.components.Cell` through `TsukiProvider` or a scoped `ConfigProvider`. It supplies row spacing, heights, text metrics, arrow size, divider width, group margins and radius, and disabled opacity. Background, text, required marker, and pressed colors follow semantic tokens for the active scheme. The same slots and tokens are available in NativeWind v4 and v5.

```tsx
<ConfigProvider theme={{ components: { Cell: { minHeight: 52, groupRadius: 16 } } }}>
  <Cell
    required
    title="Display name"
    className="px-8"
    classNames={{ title: 'font-semibold text-tsuki-primary' }}
    style={{ paddingHorizontal: 20 }}
  />
</ConfigProvider>
```

## Migration from v1

| Previous API | v2 |
| --- | --- |
| `leading`, `description`, `trailing`, `showArrow` | Same names. If migrating older `icon`, `label`, `extra`, or `isLink` usage, use these names respectively. Group `extra` is still a header prop. |
| `Cell.Group` | Still available. `CellGroup` is also a named export. |
| `clickable={false}` with a press handler | Remove `clickable={false}` to keep the handler active. |
| Visual token overrides in `components.Cell` | Move color overrides to semantic tokens or use slot styles for an individual row. Keep numeric layout and text metrics in `components.Cell`. |

The [v1 Cell documentation](../../cell/index.md) records the historical API.
