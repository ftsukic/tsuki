# Text 文本

从 `@ftsukic/tsuki` 导入 `Text`、`TextClassContext` 和类型 `TextProps`、`TextVariant`。每个 Text 渲染一个 React Native Text，可直接嵌套。组件透传原生 props 和 ref，包括 `style`、`selectable`、`numberOfLines`、`ellipsizeMode`、`onPress` 和无障碍属性。

| 属性        | 类型                                                      | 默认值 |
| ----------- | --------------------------------------------------------- | ------ |
| `variant`   | `body`、`body-sm`、`label`、`caption`、`title`、`heading` | `body` |
| `className` | `string`                                                  | —      |

类名按 variant、最近的 `TextClassContext`、当前 `className` 的顺序通过 `cn()` 合并。Text 将合并结果提供给后代。自定义组件可使用 `TextClassContext.Provider` 为内部 Text 提供类名，该 Provider 的值会替换外层 Context。

默认颜色来自 `text-tsuki-foreground`，caption 使用 `text-tsuki-muted`。用 `text-tsuki-primary` 等语义类可跟随应用的 NativeWind 主题变量。应用按所用 NativeWind 版本，将 `TsukiProvider` 或嵌套 `ConfigProvider` 中的主题通过 `serializeTheme` 注入对应的变量作用域。

- [基础与变体](../../../packages/tsuki/src/text/__fixtures__/overview.tsx)
- [多层嵌套](../../../packages/tsuki/src/text/__fixtures__/examples/deep-nested.tsx)
- [Context 覆盖](../../../packages/tsuki/src/text/__fixtures__/examples/override.tsx)

Button 会为内容中的 Text 提供对应变体的颜色、字号和字重，并应用 `classNames.content`。文本自己的 `className` 可以覆盖这些默认类。[`Button` 文本示例](../../../packages/tsuki/src/button/__fixtures__/overview.tsx)
