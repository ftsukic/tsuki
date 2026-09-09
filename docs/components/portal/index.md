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

Portal 将内容渲染到当前 `PortalHost` 的宿主层，适合 Popup、Toast、Notify 以及显式包裹的 Overlay 等需要脱离页面布局的浮层。除了组件式 `Portal`，还提供用于命令式浮层的 `mountPortal`、`updatePortal` 和 `unmountPortal`。

</section>

<code src="../../../src/portal/__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

```tsx | pure
import {
  ConfigProvider,
  Portal,
  PortalHost,
  mountPortal,
  unmountPortal,
  updatePortal,
} from '@ftsukic/tsuki'
```

`Provider` 会自动挂载 `PortalHost`。需要自行组合主题和宿主时，使用 `ConfigProvider` 与 `PortalHost`：

```tsx | pure
<ConfigProvider>
  <PortalHost>
    <App />
  </PortalHost>
</ConfigProvider>
```

## 代码演示

<code src="../../../src/portal/__fixtures__/examples/basic.tsx" title="组件式 Portal" description="使用 Portal 将内容渲染到宿主层。"></code>

<code src="../../../src/portal/__fixtures__/examples/imperative.tsx" title="命令式挂载" description="使用 mountPortal、updatePortal 和 unmountPortal 管理动态内容。"></code>

## API

### Portal

| 属性       | 类型        | 默认值 | 说明                 |
| ---------- | ----------- | ------ | -------------------- |
| `children` | `ReactNode` | —      | 要渲染到宿主层的内容 |

`Portal` 必须渲染在 `PortalHost` 内部，否则会抛出 `Portal must be rendered inside Portal.Host`。Portal 会保留当前主题上下文，浮层内容可以继续使用 `useToken` 和组件 token。

### PortalHost

| 属性       | 类型        | 默认值 | 说明                         |
| ---------- | ----------- | ------ | ---------------------------- |
| `children` | `ReactNode` | —      | 宿主下方的页面内容，可以为空 |

同一运行时按一个 active `PortalHost` 使用。宿主会按挂载顺序渲染 entry，entry 层使用 `pointerEvents="box-none"`，宿主卸载时会清理全部内容。

### Imperative API

```text
mountPortal(children: ReactNode): PortalKey
updatePortal(key: PortalKey, children: ReactNode): void
unmountPortal(key: PortalKey): void
```

`PortalKey` 是由宿主生成的不透明数字 key。`mountPortal` 没有 active `PortalHost` 时抛出 `PortalHost must be rendered before mounting an imperative portal`；`updatePortal` 和 `unmountPortal` 在宿主或 key 无效时安全无效。

命令式 entry 与组件式 entry 共用同一个宿主层级和挂载顺序。Dialog、Toast 的命令式 API 使用这组函数，因此只需要 `ConfigProvider + PortalHost`，不需要单独的 `DialogProvider` 或 `ToastProvider`。
