---
title: Dialog 弹出框
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Dialog 弹出框

<section className="component-doc-intro">

## 介绍

Dialog 用于提示、确认和短文本输入，建立在 Popup 和 Portal 之上。

</section>

<code src="./__fixtures__/overview.tsx" title="组件预览"></code>

## 引入

import { Dialog, DialogInput, DialogKeyboard, Provider, showDialog } from '@ftsukic/react-native-ui'

命令式 API 需要应用中存在 Provider 或 PortalHost。

## 代码演示

<code src="./__fixtures__/examples/basic.tsx" title="基础提示" description="使用 visible、title 和 message。"></code> <code src="./__fixtures__/examples/confirm.tsx" title="确认操作" description="显示确认和取消按钮。"></code> <code src="./__fixtures__/examples/controlled.tsx" title="受控关闭" description="通过按钮回调更新 visible。"></code> <code src="./__fixtures__/examples/custom.tsx" title="自定义内容" description="使用 children 定制正文。"></code> <code src="./__fixtures__/examples/before-close.tsx" title="异步操作" description="使用按钮 loading 状态表达异步工作。"></code> <code src="./__fixtures__/examples/round.tsx" title="圆角面板" description="复用 Popup 的 round 属性。"></code> <code src="./__fixtures__/examples/interactions.tsx" title="交互边界" description="展示遮罩关闭和关闭回调。"></code> <code src="./__fixtures__/examples/theme.tsx" title="主题定制" description="通过 theme 覆盖 Dialog token。"></code> <code src="./__fixtures__/examples/queue.tsx" title="命令式调用" description="通过 showDialog 挂载 Dialog。"></code>

## API

Dialog 继承 Popup 的浮层属性，使用 visible 控制显示。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | boolean | false | 是否显示 |
| title / message / children | ReactNode | — | 标题、正文和自定义内容 |
| width | DimensionValue | token.width | 面板宽度 |
| messageAlign | center | left | right | center | 文本对齐 |
| showConfirmButton | boolean | true | 是否显示确认按钮 |
| showCancelButton | boolean | false | 是否显示取消按钮 |
| confirmButtonText / cancelButtonText | string | Locale 默认值 | 按钮文案 |
| confirmButtonLoading / cancelButtonLoading | boolean | false | 对应按钮加载状态 |
| showClose | boolean | false | 是否显示关闭图标 |
| buttonReverse | boolean | false | 是否反转按钮顺序 |
| onPressConfirm / onPressCancel / onPressClose | function | — | 按钮事件 |
| theme | Partial<DialogToken> | — | 覆盖 Dialog token |

style 作用于面板，footerStyle 作用于按钮区域。DialogInput 组合 TextInput、NumberInput 或 PasswordInput；DialogKeyboard 支持 safeAreaTop。showDialog 返回 Promise<void>，需要 active PortalHost。
