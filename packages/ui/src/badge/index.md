---
title: Badge 徽标
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Badge 徽标

<section className="component-doc-intro">

## 介绍

Badge 在内容旁展示数字、红点或状态。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

import { Badge } from '@ftsukic/react-native-ui'

## 代码演示

<code src="./__fixtures__/examples/types.tsx" title="数字和红点" description="使用 count、dot、max 和 showZero。"></code> <code src="./__fixtures__/examples/status.tsx" title="状态" description="使用 status 展示语义化状态点。"></code> <code src="./__fixtures__/examples/theme.tsx" title="颜色和主题" description="使用 color 或 theme 覆盖徽标颜色。"></code>

## API

| 属性                        | 类型                | 默认值  | 说明                   |
| --------------------------- | ------------------- | ------- | ---------------------- |
| children                    | ReactNode           | —       | 被徽标包裹的内容       |
| count                       | number              | string  | —                      | 数字或文本 |
| dot                         | boolean             | false   | 只展示红点             |
| max                         | number              | —       | 数字上限               |
| showZero                    | boolean             | false   | 是否显示 0             |
| loading                     | boolean             | false   | 显示加载状态           |
| status                      | primary             | success | warning                | error      | —   | 状态颜色 |
| color                       | ColorValue          | —       | 自定义徽标颜色         |
| offset                      | [number, number]    | —       | 调整右上角偏移         |
| countStyle / countTextStyle | StyleProp           | —       | 覆盖徽标容器和文字样式 |
| theme                       | Partial<BadgeToken> | —       | 覆盖 Badge token       |

Badge 继承 React Native ViewProps；不提供 Web-only tooltip、teleport 或 className API。
