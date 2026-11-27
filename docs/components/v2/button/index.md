# Button v2

Tsuki v2 Button wraps React Native Pressable. It keeps native interaction and accessibility props, adds CVA variants, a leading icon slot, and a loading state, and exposes utility classes and semantic slots.

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Button content. String and number children render as a Text label. |
| `icon` | `ReactNode` | — | Optional leading icon content. |
| `variant` | `'solid' \| 'outlined' \| 'ghost' \| 'link'` | `'solid'` | Visual treatment. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Height and horizontal padding variant. |
| `shape` | `'default' \| 'round' \| 'circle'` | `'default'` | Corner radius and circular icon button geometry. |
| `pressFeedback` | `'scale' \| 'opacity' \| 'overlay' \| 'none'` | `'scale'` (`'opacity'` for `link`) | Press feedback animation mode. |
| `disabled` | `boolean` | `false` | Prevents the Pressable action. |
| `loading` | `boolean` | `false` | Shows a themed activity indicator, disables presses, and exposes the busy accessibility state. |
| `onPress` | `PressableProps['onPress']` | — | Inherited Pressable action. |
| `className` | `string` | — | Root utility classes. |
| `classNames` | `{ root?: string; content?: string; icon?: string }` | — | Semantic utility classes for the root, generated text label, and leading icon. |
| `style` | `StyleProp<ViewStyle>` | — | Native style for the root Pressable. |
| `styles` | `{ root?: StyleProp<ViewStyle>; content?: StyleProp<TextStyle>; icon?: StyleProp<ViewStyle> }` | — | Native styles for named slots. |

Button inherits the remaining React Native `PressableProps`. Its default accessibility role is `button`; provide `accessibilityLabel` when the visible children do not name the action. While loading, Button keeps its children, blocks presses, and reports `busy`. The `icon` is placed before the children and only adds trailing spacing (`mr-2`) when renderable `children` are present. Use `shape="circle"` with `icon` (and `accessibilityLabel`) for circular icon buttons—it removes horizontal padding, sets `rounded-full`, and matches the width to the active `size` (`w-9`, `w-tsuki-button`, or `w-12`). `variant="link"` renders primary-colored text with compact sizing (`h-auto px-0`), adds an 8px default `hitSlop` when `hitSlop` is not provided, defaults `pressFeedback` to `'opacity'`, and keeps the default `accessibilityRole="button"`. A lightweight scale feedback moves the root to `0.98` while pressed and follows the nearest Theme Motion policy; set `pressFeedback` to `'opacity'`, `'overlay'`, or `'none'` to change or disable the pressed feedback. Native `style` props are applied after utility classes on the same slot; root `style` is last among the two root native styles and takes precedence over `styles.root`. Explicit root `transform` disables scale feedback for that property. `styles.content` only affects string or number children rendered by Button.

The root classes use `bg-tsuki-primary`, `rounded-tsuki-button`, and `h-tsuki-button`. Override their CSS variables through `TsukiProvider` and `ConfigProvider`; the NativeWind bridge stays in the consuming app.

```tsx
import { Button } from '@ftsukic/tsuki'
import { Text } from 'react-native'

;<Button
  className="bg-tsuki-primary rounded-tsuki-button"
  classNames={{ root: 'px-4', content: 'font-semibold', icon: 'mr-2' }}
  icon={<Text>✓</Text>}
  style={{ minWidth: 96 }}
  styles={{ content: { letterSpacing: 0.2 } }}
>
  Save
</Button>
```

## 示例

- [Playground Overview](../../../../packages/tsuki/src/button/__fixtures__/overview.tsx)
- [Basic](../../../../packages/tsuki/src/button/__fixtures__/examples/basic.tsx)
- [Custom Text](../../../../packages/tsuki/src/button/__fixtures__/examples/custom-text.tsx)
- [Nested Text](../../../../packages/tsuki/src/button/__fixtures__/examples/nested-text.tsx)
- [Text Cascade](../../../../packages/tsuki/src/button/__fixtures__/examples/text-cascade.tsx)
- [Classes and native styles](../../../../packages/tsuki/src/button/__fixtures__/examples/semantic-classes.tsx)
- [Variants](../../../../packages/tsuki/src/button/__fixtures__/examples/variants.tsx)
- [Sizes](../../../../packages/tsuki/src/button/__fixtures__/examples/sizes.tsx)
- [Shapes](../../../../packages/tsuki/src/button/__fixtures__/examples/shapes.tsx)
- [Press Feedback](../../../../packages/tsuki/src/button/__fixtures__/examples/press-feedback.tsx)
- [Loading and disabled](../../../../packages/tsuki/src/button/__fixtures__/examples/states.tsx)
- [Icon](../../../../packages/tsuki/src/button/__fixtures__/examples/icon.tsx)
- [Theme](../../../../packages/tsuki/src/button/__fixtures__/examples/theme.tsx)
