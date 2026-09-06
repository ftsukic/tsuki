---
title: Toast 轻提示
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Toast 轻提示

<section className="component-doc-intro">

## 介绍

Toast 用于反馈操作结果或展示短暂状态，支持位置、加载/成功/失败类型和命令式调用。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

import { Toast, Provider, showToast } from '@ftsukic/react-native-ui'

命令式 API 需要 active PortalHost，通常由 Provider 提供。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础类型" description="展示 text、loading、success 和 fail。"></code> <code src="./__fixtures__/examples/positions.tsx" title="位置" description="使用 top、middle 或 bottom。"></code> <code src="./__fixtures__/examples/interactions.tsx" title="交互" description="使用 duration、closeOnPress 和 closeOnPressOverlay。"></code> <code src="./__fixtures__/examples/multiple.tsx" title="命令式实例" description="通过 Toast.show 和 Toast.hide 管理单例。"></code> <code src="./__fixtures__/examples/controlled.tsx" title="组件式调用" description="直接渲染 Toast 组件。"></code> <code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 theme 覆盖 Toast token。"></code>

## API

| 属性                | 类型                | 默认值  | 说明                         |
| ------------------- | ------------------- | ------- | ---------------------------- |
| type                | text                | loading | success                      | fail         | icon     | text | 提示类型 |
| message             | string              | —       | 文本内容                     |
| position            | top                 | middle  | bottom                       | middle       | 显示位置 |
| overlay             | boolean             | false   | 是否显示并拦截遮罩           |
| forbidPress         | boolean             | false   | 是否拦截底层触摸             |
| closeOnPress        | boolean             | false   | 点击提示本身关闭             |
| closeOnPressOverlay | boolean             | false   | 点击遮罩关闭                 |
| loadingType         | circular            | spinner | circular                     | loading 类型 |
| duration            | number              | 2000    | 自动关闭时长；0 表示持续显示 |
| icon                | ReactNode           | —       | 自定义 icon                  |
| onClosed            | function            | —       | 关闭完成回调                 |
| theme               | Partial<ToastToken> | —       | 覆盖 Toast token             |

组件式 Toast 自身创建可见状态；Toast.show(options) 和 showToast(options) 返回 close、setMessage 方法。没有 active PortalHost 时命令式调用会抛错。不支持 Web-only teleport、className 或 HTML 字符串。
