---
title: Overlay 遮罩层
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Overlay 遮罩层

<section className="component-doc-intro">

## 介绍

Overlay 提供覆盖页面的受控遮罩，可承载自定义内容。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

import { Overlay, OverlaySurface, Provider } from '@ftsukic/react-native-ui'

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="使用 visible 控制遮罩。"></code> <code src="./__fixtures__/examples/embedded.tsx" title="嵌入内容" description="通过 children 放置内容。"></code> <code src="./__fixtures__/examples/interactions.tsx" title="点击和动画" description="使用 onPress、onClosed 和 duration。"></code> <code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 backgroundColor 和 theme 覆盖外观。"></code>

## API

| 属性                 | 类型                  | 默认值                  | 说明                   |
| -------------------- | --------------------- | ----------------------- | ---------------------- |
| visible              | boolean               | false                   | 是否显示               |
| children             | ReactNode             | —                       | 遮罩上的内容           |
| backgroundColor      | ColorValue            | token.colorBgMask       | 遮罩颜色               |
| duration             | number                | token.animationDuration | 淡入淡出时长，单位毫秒 |
| zIndex               | number                | token.zIndex            | 层级                   |
| onPress              | function              | —                       | 点击遮罩               |
| onClosed             | function              | —                       | 退出动画完成           |
| onRequestClose       | () => boolean         | —                       | 请求关闭               |
| style / overlayStyle | StyleProp<ViewStyle>  | —                       | 根节点和遮罩样式       |
| theme                | Partial<OverlayToken> | —                       | 覆盖 Overlay token     |

Overlay 使用 active PortalHost；局部布局场景可直接使用 OverlaySurface。组件不自动修改 visible。
