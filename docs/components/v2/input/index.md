# Input v2

Tsuki v2 Input wraps React Native TextInput with a themed native container. It keeps TextInput value, keyboard, focus, submission, and accessibility behavior, with optional prefix/suffix content and a validation error state.

- [Native input behavior](../../../../packages/tsuki/src/input/__fixtures__/examples/basic.tsx)
- [Prefix, suffix, and error](../../../../packages/tsuki/src/input/__fixtures__/examples/accessories.tsx)
- [Semantic classes and theme tokens](../../../../packages/tsuki/src/input/__fixtures__/examples/semantic-classes.tsx)

## API

Input inherits React Native `TextInputProps` except `style` and `className`, which have library-level root semantics. `disabled` sets `editable={false}` and marks the accessibility state as disabled.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `string` | — | Controlled or initial native text value. |
| `onChangeText` | `(value: string) => void` | — | Native text change callback. |
| `editable` | `boolean` | `true` | Inherited editing control. `disabled` takes precedence. |
| `disabled` | `boolean` | `false` | Disables editing and exposes disabled accessibility state. |
| `error` | `string` | — | Shows the danger border and appends the message to the accessibility hint. |
| `prefix` / `suffix` | `ReactNode` | — | Optional content before or after the native TextInput. |
| `className` | `string` | — | Root container utility classes. |
| `classNames` | `{ root?: string; input?: string; prefix?: string; suffix?: string }` | — | Semantic utility classes for the container, TextInput, and accessory slots. |
| `style` | `StyleProp<ViewStyle>` | — | Native style for the root container. |
| `styles` | `{ root?: StyleProp<ViewStyle>; input?: StyleProp<TextStyle>; prefix?: StyleProp<ViewStyle>; suffix?: StyleProp<ViewStyle> }` | — | Native styles for named slots. |

`accessibilityLabel`, `placeholder`, `keyboardType`, `secureTextEntry`, focus handlers, and other native TextInput props pass through unchanged. When `error` is set, Input appends its message to an existing `accessibilityHint` or uses it as the hint. Native `style` props are applied after utility classes on the same slot; root `style` is last among the two root native styles and takes precedence over `styles.root`. Use `styles.input` for native TextInput typography and sizing, and `styles.prefix` / `styles.suffix` for accessory containers.

The component reads `Input.borderRadius` and `Input.height` from the active scope through `--tsuki-input-border-radius` and `--tsuki-input-height`.
