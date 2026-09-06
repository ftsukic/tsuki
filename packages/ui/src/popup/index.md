---
title: Popup 弹出层
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Popup 弹出层

<section className="component-doc-intro">

## 介绍

Popup 在当前页面上方展示内容，支持位置、遮罩、圆角和生命周期回调。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

import { Popup, Provider } from '@ftsukic/react-native-ui'

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础用法" description="使用 visible 控制居中弹层。"></code> <code src="./__fixtures__/examples/positions.tsx" title="位置" description="展示 top、bottom、left、right 和 center。"></code> <code src="./__fixtures__/examples/interactions.tsx" title="遮罩交互" description="通过 closeOnPressOverlay 和 onPressOverlay 处理关闭。"></code> <code src="./__fixtures__/examples/lifecycle.tsx" title="生命周期" description="观察打开和关闭回调。"></code> <code src="./__fixtures__/examples/safe-area.tsx" title="安全区" description="使用 safeAreaInsetTop 和 safeAreaInsetBottom。"></code> <code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 theme 覆盖 Popup token。"></code>

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | ReactNode | — | 弹层内容 |
| visible | boolean | false | 是否显示 |
| position | top | bottom | left | right | center | center | 弹出位置 |
| overlay | boolean | true | 是否显示遮罩 |
| closeOnPressOverlay | boolean | true | 点击遮罩是否调用 onPressOverlay |
| onPressOverlay / onRequestClose | function | — | 遮罩和返回键请求 |
| onOpen / onOpened / onClose / onClosed | function | — | 生命周期 |
| duration | number | 350 | 动画时长，单位毫秒 |
| round | boolean | false | 是否使用圆角 |
| safeAreaInsetTop / safeAreaInsetBottom | boolean | false | 是否加入安全区 padding |
| lazyRender | boolean | true | 首次显示前是否挂载 |
| destroyOnClosed | boolean | false | 关闭后是否销毁 |
| style | StyleProp<ViewStyle> | — | 面板样式 |
| theme | Partial<PopupToken> | — | 覆盖 Popup token |

Popup 是受控组件，不会自动修改 visible。Popup.Header 和 Popup.Page 提供标题栏及顶部安全区封装；需要 Provider 或 PortalHost 提供 active Portal。
