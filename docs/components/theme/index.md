---
title: Theme
componentDoc: true
toc: false
nav:
  title: 组件
group:
  title: 主题
  order: 3
---

# Theme

<section className="component-doc-intro">

## 介绍

Theme 使用 `SeedToken → MappingAlgorithm → MapToken → AliasToken` 四层模型，输出适合 React Native 的绝对行高、毫秒动画和 Vant 移动端间距。组件自己的尺寸和视觉语义仍由 Component Token 派生。

</section>

<code src="../../../src/theme/__fixtures__/overview.tsx" title="组件预览"></code>

Provider 只负责全局 token、algorithm 和组件 overrides；组件自己的 token 派生函数位于组件目录内。

```text
import { Button, ConfigProvider, darkAlgorithm } from '@ftsukic/tsuki';

export function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        token: { colorPrimary: '#1989FA' },
        components: { Button: { borderRadius: 20 } },
      }}
    >
      <Button type="primary">保存</Button>
    </ConfigProvider>
  );
}
```

默认移动基线包括：

| Token                                                                 | 默认值               |
| --------------------------------------------------------------------- | -------------------- |
| `colorPrimary`                                                        | `#1989FA`            |
| `colorSuccess`                                                        | `#07C160`            |
| `colorWarning`                                                        | `#FF976A`            |
| `colorError`                                                          | `#EE0A24`            |
| `fontSizeXS / fontSizeSM / fontSize / fontSizeLG`                     | `10 / 12 / 14 / 16`  |
| `lineHeightXS / lineHeightSM / lineHeight / lineHeightLG`             | `14 / 18 / 20 / 22`  |
| `controlHeightXS / controlHeightSM / controlHeight / controlHeightLG` | `24 / 32 / 44 / 50`  |
| `borderRadiusXS / borderRadiusSM / borderRadius / borderRadiusLG`     | `1 / 2 / 4 / 8`      |
| `motionDurationFast / Mid / Slow`                                     | `100 / 200 / 300` ms |

公开 API：

```text
useToken();
useComponentToken('Button', getButtonToken);
getDesignToken({ token, algorithm });
```

`ThemeConfig.token` 使用 `Partial<AliasToken>`。嵌套 `ConfigProvider` 默认继承父级，设置 `inherit: false` 后从默认 seed 开始解析；组件 overrides 会按组件再合并一层。`getDesignToken()` 直接返回最终 `AliasToken`，`useToken()` 只返回 `{ token }`，没有 Provider 时回退默认主题。Theme 不包含业务主题或平台专用 token。

## 移动端 Token 边界

全局间距使用 `paddingXXS / paddingXS / paddingSM / padding / paddingLG / paddingXL`，对应 `4 / 8 / 12 / 16 / 24 / 32`。边框同时提供 `lineWidth` 和 `lineWidthHairline`：按钮、输入框使用普通边框，Cell/List 分割线使用 hairline。

核心主题不再生成 Web 专用的 Heading、hover、focus、link decoration、wireframe 和重复的 `blue1`/`blue-1` 调色板命名。预设色基础值仍可用于组件 API，调色板只保留 `blue-1` 这一类带连字符命名。

基础文本请使用库导出的 `Text`，它会自动应用 `colorText`，并支持 `secondary`、`tertiary`、`disabled` 语义；通用 `View` 不会自动添加背景色。
