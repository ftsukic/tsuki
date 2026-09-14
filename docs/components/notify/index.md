---
title: Notify 通知
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Notify 通知

<section className="component-doc-intro">

## 介绍

Notify 用于在页面顶部展示需要即时反馈的通知，支持四种语义类型、受控组件、命令式调用、自动关闭、顶部安全区和主题定制。

</section>

<code src="../../../src/notify/__fixtures__/overview.tsx" title="组件预览" description="Notify 汇总类型、受控显示、命令式交互、主题和顶部安全区示例。"></code>

## 引入

```tsx | pure
import { ConfigProvider, Notify, Provider, closeNotify, showNotify } from '@ftsukic/tsuki'
```

Notify 使用 Portal 渲染。受控组件和命令式 API 都需要当前应用存在 `PortalHost`，应用入口可以使用同时提供主题和 Portal 宿主的 `Provider`：

```tsx | pure
<Provider>
  <App />
</Provider>
```

也可以直接组合 `ConfigProvider` 和 `PortalHost`。

需要读取系统顶部安全区时，使用 `<Provider safeArea>`，或在宿主应用中自行挂载 `SafeAreaProvider`；`Provider` 的 `safeArea` 默认值为 `false`。

## 代码演示

<code src="../../../src/notify/__fixtures__/examples/types.tsx" title="通知类型" description="通过 type 展示 primary、success、warning 和 error 四种通知颜色。"></code>

<code src="../../../src/notify/__fixtures__/examples/controlled.tsx" title="受控组件" description="使用 visible 管理显示状态，并通过 ref.close 请求关闭。"></code>

<code src="../../../src/notify/__fixtures__/examples/interactions.tsx" title="命令式交互" description="showNotify 返回的实例可以更新 message 或关闭当前单例通知。"></code>

<code src="../../../src/notify/__fixtures__/examples/theme.tsx" title="主题和样式" description="通过 Notify token 和单次样式定制通知外观。"></code>

<code src="../../../src/notify/__fixtures__/examples/safe-area.tsx" title="顶部安全区" description="默认适配顶部安全区，也可以通过 safeAreaInsetTop 显式关闭。"></code>

## API

### NotifyProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `ReactNode` | — | 自定义内容；`message` 未设置时使用 |
| message | `ReactNode` | — | 通知内容；设置后优先于 `children` |
| type | `'primary' \| 'success' \| 'error' \| 'warning'` | `'primary'` | 语义类型，并决定默认背景色 |
| color | `ColorValue` | `'#ffffff'` | 文本颜色 |
| backgroundColor | `ColorValue` | 按 `type` 使用对应 token | 通知背景色 |
| visible | `boolean` | `true` | 是否显示；受控关闭时由父组件更新为 `false` |
| duration | `number` | `0` | 自动关闭毫秒数；`0` 或负数不自动关闭 |
| safeAreaInsetTop | `boolean` | `true` | 是否将 `SafeAreaInsetsContext` 的 `top` inset 加入通知顶部内边距 |
| style | `StyleProp<ViewStyle>` | — | 通知内容根 View 样式 |
| textStyle | `StyleProp<TextStyle>` | — | 字符串或数字 `message` 的文字样式 |
| onClosed | `() => void` | — | 关闭动画完成并卸载内容后调用 |

组件继承 React Native `ViewProps`，但由组件管理 `children` 和 `style`；其他 View props 会透传到通知的动画容器。`ref` 指向 `NotifyMethods`，不指向原生 View。`style` 只作用于通知内容根 View；自定义 `children` 需要自行负责其内部文字样式。

通知默认铺满容器宽度并固定在 Portal 顶部。启用 `safeAreaInsetTop` 时，安全区只增加通知顶部内边距，背景色仍覆盖安全区；没有 `SafeAreaProvider` 或 top inset 时按 `0` 处理。`message` 支持字符串、数字和 ReactNode；当 `message` 已设置时，它优先于 `children`。组件使用当前主题的 motion 配置执行顶部进入和退出动画。

### 受控显示

```tsx | pure
const [visible, setVisible] = useState(false)

<Notify
  visible={visible}
  duration={0}
  message="受控通知"
  onClosed={() => setVisible(false)}
/>
```

`Notify` 不会直接修改外部的 `visible`。调用 `ref.close()` 或自动关闭后，父组件应在 `onClosed` 中同步状态；如果需要重新显示，再将 `visible` 设置为 `true`。

### 命令式 API

```tsx | pure
const notify = showNotify({
  message: '正在保存',
  duration: 0,
})

notify.setMessage('保存成功')
notify.close()
closeNotify()
```

| API | 类型 | 说明 |
| --- | --- | --- |
| showNotify | `(options: NotifyProps \| string) => NotifyMethods` | 创建当前单例通知；传字符串时作为 `message` |
| closeNotify | `() => void` | 关闭当前命令式通知；没有实例时安全无效 |
| setNotifyDefaultOptions | `(options: Partial<NotifyProps>) => void` | 设置命令式调用的默认参数，显式参数优先 |
| resetNotifyDefaultOptions | `() => void` | 清除命令式默认参数 |

`NotifyMethods` 提供 `close()` 和 `setMessage(message)`。新的 `showNotify` 调用会先关闭当前实例，再创建新的单例；命令式实例通过当前 `PortalHost` 挂载。

## 主题定制

通过 `ConfigProvider` 的 `theme.components.Notify` 覆盖默认类型颜色、文字和间距：

```tsx | pure
<ConfigProvider
  theme={{
    components: {
      Notify: {
        primaryBackgroundColor: '#102a43',
        textColor: '#d9f7be',
        paddingHorizontal: 20,
        paddingVertical: 14,
      },
    },
  }}
>
  <Notify message="主题通知" />
</ConfigProvider>
```

支持的 Notify token：`primaryBackgroundColor`、`successBackgroundColor`、`errorBackgroundColor`、`warningBackgroundColor`、`textColor`、`fontFamily`、`fontSize`、`lineHeight`、`paddingHorizontal` 和 `paddingVertical`。

当前不提供 `styles` 插槽、位置切换、遮罩、图标、loading 状态或 Web 专用的 `teleport`、`className`、HTML 字符串和 transition API；需要复杂内容时传入 ReactNode `children`。顶部安全区适配依赖宿主提供 `SafeAreaProvider`，不会由 Notify 自行创建。
