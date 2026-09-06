---
title: Avatar 头像
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Avatar 头像

<section className="component-doc-intro">

## 介绍

头像用于代表用户或事物，支持图片、图标和字符，并提供图片失败回退、头像分组和分组溢出展示。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import { Avatar, Badge, Icon } from '@ftsukic/react-native-ui'
```

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="尺寸和形状" description="支持预设尺寸、自定义尺寸、圆形、方形、自定义圆角，以及小尺寸 icon 和文字自适应。"></code>

<code src="./__fixtures__/examples/sources.tsx" title="图片、图标和字符" description="图片失败后按 icon、children 顺序回退。"></code>

<code src="./__fixtures__/examples/group.tsx" title="头像分组" description="Avatar.Group 支持统一属性、头像叠放、maxCount 和 max 溢出头像配置。"></code>

## API

### Avatar

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| src | `string \| ImageSourcePropType` | — | 图片地址或 React Native Image source；图片失败后显示 fallback |
| icon | `ReactNode` | — | 图片失败或没有图片时的图标，优先级高于 `children` |
| children | `ReactNode` | — | 字符或自定义 fallback 内容 |
| alt | `string` | — | 图片和头像的无障碍描述 |
| size | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | 头像尺寸，单位为 RN 逻辑像素 |
| shape | `'circle' \| 'square'` | `'circle'` | 头像形状；`square` 使用主题圆角 |
| borderRadius | `number` | — | 根容器圆角；设置后覆盖 `shape` 的默认圆角，`style.borderRadius` 仍具有更高优先级 |
| gap | `number` | `4` | 字符内容左右预留的单位间距 |
| onError | `ImageProps['onError']` | — | 图片加载失败回调，组件仍会显示 fallback |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式，优先级高于 `styles.root` |
| styles | `AvatarStyles` | — | `root / image / icon / text / content` 语义样式 |

Avatar 继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`。头像默认暴露 `accessibilityRole="image"`；可通过 `accessibilityLabel` 覆盖 `alt`。

图片失败时回退顺序为 `icon`、`children`；两者都不存在时只保留头像容器。字符串和数字字符会单行显示并自动缩小；传入的非原生 icon 元素会按头像尺寸注入默认大小，显式设置的 icon `size` 不会覆盖。自定义节点需要自行控制尺寸。

### Avatar.Group

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 直接子级 Avatar；其他节点会被忽略 |
| size | `AvatarSize` | — | 子头像默认尺寸，子头像显式设置优先 |
| shape | `AvatarShape` | — | 子头像默认形状，子头像显式设置优先 |
| max | `{ count: number; style?: { color?: ColorValue; backgroundColor?: ColorValue } }` | — | 配置最多显示数量和 `+N` 头像的文字/背景颜色；与 `maxCount` 同时设置时优先使用 `max.count` |
| maxCount | `number` | — | 兼容旧 API；最多显示的头像数量，超出部分合并为 `+N` |
| onOverflowPress | `PressableProps['onPress']` | — | 点击 `+N` 溢出头像 |
| style | `StyleProp<ViewStyle>` | — | 根 View 样式 |
| styles | `AvatarGroupStyles` | — | `root / item / overflow` 语义样式 |

Group 使用主题中的 `groupOverlapping`、`groupBorderColor` 和 `groupBorderWidth` 控制叠放效果，默认叠放边框宽度为 `1`。当前不提供 Web Popover；如需查看完整列表，应在 `onOverflowPress` 中调用宿主应用的导航或弹层。

### 与 Web API 的差异

React Native 版本不提供 Web 专属的 `srcSet`、`crossOrigin`、`draggable`、响应式尺寸对象和 Popover。图片源使用 RN 的 `ImageSourcePropType` 语义。

## 主题定制

通过 `ThemeProvider` 的 `theme.components.Avatar` 配置容器尺寸、字体、分组边框和叠放间距。`styles` 用于单个实例的语义样式。

```tsx | pure
import { Avatar, ThemeProvider } from '@ftsukic/react-native-ui'

;<ThemeProvider
  theme={{
    components: {
      Avatar: {
        containerSize: 36,
        groupOverlapping: -10,
      },
    },
  }}
>
  <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
</ThemeProvider>
```
