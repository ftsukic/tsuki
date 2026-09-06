---
title: Portal 浮层宿主
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Portal 浮层宿主

<section className="component-doc-intro">

## 介绍

Portal 将内容渲染到 PortalHost 的宿主层，供 Popup、Overlay、Dialog、Toast 等浮层复用。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

import { Portal, PortalHost, mountPortal, updatePortal, unmountPortal } from '@ftsukic/react-native-ui'

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="组件式 Portal" description="使用 PortalHost 和 Portal 渲染内容。"></code> <code src="./__fixtures__/examples/imperative.tsx" title="命令式挂载" description="使用 mountPortal、updatePortal 和 unmountPortal。"></code>

## API

Portal 和 PortalHost 只接收 children。后挂载的 entry 位于前一项上方；entry 使用 absolute fill 和 pointerEvents box-none。

mountPortal(children) 返回 PortalKey；没有 active Host 时抛错。updatePortal(key, children) 更新 entry；unmountPortal(key) 移除 entry。Portal 必须位于 active PortalHost 内，否则会抛出错误。不支持命名 Host、teleport 或 native Modal。
