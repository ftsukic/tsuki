# Button v2

Tsuki v2 Button wraps React Native Pressable. It keeps native interaction and accessibility props, adds CVA variants, a leading icon slot, and a loading state, and exposes utility classes and semantic slots.

- [Variant examples](../../../../packages/tsuki/src/button/__fixtures__/examples/basic.tsx)
- [Semantic classes and native styles](../../../../packages/tsuki/src/button/__fixtures__/examples/semantic-classes.tsx)

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Button content. String and number children render as a Text label. |
| `icon` | `ReactNode` | — | Optional leading icon content. |
| `variant` | `'solid' \| 'outlined' \| 'ghost'` | `'solid'` | Visual treatment. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Height and horizontal padding variant. |
| `disabled` | `boolean` | `false` | Prevents the Pressable action. |
| `loading` | `boolean` | `false` | Shows a themed activity indicator, disables presses, and exposes the busy accessibility state. |
| `onPress` | `PressableProps['onPress']` | — | Inherited Pressable action. |
| `className` | `string` | — | Root utility classes. |
| `classNames` | `{ root?: string; content?: string; icon?: string }` | — | Semantic utility classes for the root, generated text label, and leading icon. |
| `style` | `StyleProp<ViewStyle>` | — | Native style for the root Pressable. |
| `styles` | `{ root?: StyleProp<ViewStyle>; content?: StyleProp<TextStyle>; icon?: StyleProp<ViewStyle> }` | — | Native styles for named slots. |

Button inherits the remaining React Native `PressableProps`. Its default accessibility role is `button`; provide `accessibilityLabel` when the visible children do not name the action. While loading, Button keeps its children, blocks presses, and reports `busy`. The `icon` is placed before the children. Native `style` props are applied after utility classes on the same slot; root `style` is last among the two root native styles and takes precedence over `styles.root`. `styles.content` only affects string or number children rendered by Button.

The root classes use `bg-tsuki-primary`, `rounded-tsuki-button`, and `h-tsuki-button`. Override their CSS variables through `TsukiProvider` and `ConfigProvider`; the NativeWind bridge stays in the consuming app.

```tsx
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
