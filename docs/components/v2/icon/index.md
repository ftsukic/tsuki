# Icon v2

从 `@ftsukic/tsuki` 导入 `Icon` 和类型 `IconProps`、`IconName`、`IconDefinition`。

`name` 接受内置名称或 Ant Design SVG 定义。内置名称包括 `CheckCircleTwoTone`、`CheckOutlined`、`CloseOutlined`、`DeleteOutlined`、`InfoCircleOutlined`、`LeftOutlined`、`PlusOutlined`、`RightOutlined` 和 `SearchOutlined`。无效名称不渲染内容。应用可以按需从 `@ant-design/icons-svg/lib/asn/<名称>` 导入定义并传给 `name`。

| 属性 | 行为 |
| --- | --- |
| `size` | SVG 宽高，默认 24 |
| `color` | SVG 前景色，默认使用当前主题的 `colorForeground` |
| `twoToneColor` | 单值覆盖次色，默认次色为 `colorMuted`。也可传入 `[主色, 次色]` |
| `rotation` | SVG 旋转角度，单位为度 |
| `className`、`style` | 根容器样式。通过 `color` 设置 SVG 前景色 |
| `svgStyle` | SVG 自身样式，在 rotation 对应的 transform 之后应用 |
| `onPress`、`disabled` | 提供 `onPress` 时使用 React Native Pressable，默认无障碍角色为 button |
| `touchableSize`、`hitSlop` | 默认触摸目标为 44，超出 SVG 尺寸的部分通过 hit slop 扩展。显式 `hitSlop` 优先，父容器边界限制触摸范围 |

支持根容器的 React Native View props，包括 `accessibilityLabel`、`accessibilityRole` 和 `accessibilityState`。为可点击的图标提供描述操作的 `accessibilityLabel`。

静态和函数式 SVG AST 均可用。渲染器支持常见形状、分组、剪裁、遮罩、渐变及符号引用，转换诸如 `stroke-width` 的属性名，并以解析后的前景色替换 `currentColor`。

## 示例

- [Playground Overview](../../../../packages/tsuki/src/icon/__fixtures__/overview.tsx)
- [Basic](../../../../packages/tsuki/src/icon/__fixtures__/examples/basic.tsx)
- [Sizes](../../../../packages/tsuki/src/icon/__fixtures__/examples/sizes.tsx)
- [Colors](../../../../packages/tsuki/src/icon/__fixtures__/examples/colors.tsx)
- [Two Tone](../../../../packages/tsuki/src/icon/__fixtures__/examples/two-tone.tsx)
- [Custom](../../../../packages/tsuki/src/icon/__fixtures__/examples/custom.tsx)
- [Interactive](../../../../packages/tsuki/src/icon/__fixtures__/examples/interactive.tsx)
