# Theme

## 介绍

Theme 使用 `SeedToken → MappingAlgorithm → MapToken → AliasToken` 四层模型，输出适合 React Native 的绝对行高、毫秒动画和 Vant 移动端间距。组件自己的尺寸和视觉语义仍由 Component Token 派生。

- [组件预览](../../../src/theme/__fixtures__/overview.tsx)

示例同步展示当前传入的 `mode`、`seed`、`token` 和 `components` 配置，以及解析后的关键全局 token 与 Button 参数；切换明暗主题后数值随之更新。

TsukiProvider 只负责全局 token、algorithm 和组件 overrides；组件自己的 token 派生函数位于组件目录内。

```text
import { Button, ConfigProvider } from '@ftsukic/tsuki';

export function App() {
  return (
    <ConfigProvider
      theme={{
        mode: 'dark',
        seed: { colorPrimary: '#1989FA' },
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
getDesignToken({ seed, token, mode, algorithm });
```

`ThemeConfig.seed` 配置基础输入（例如 `colorPrimary`、`fontSize`、`borderRadius` 和 `motion`）；`ThemeConfig.token` 只覆盖 Map / Alias 派生值，不接受 seed 字段。基础背景和文字色省略时由算法选择默认值，显式配置后参与中性色推导。嵌套 `ConfigProvider` 默认继承父级，设置 `inherit: false` 后从默认 seed 开始解析；组件 overrides 会按组件再合并一层。所有配置合并忽略 `undefined`，保留 `0`、`false` 和空字符串。显式 token 覆盖算法结果，组件 override 覆盖组件 factory。`getDesignToken()` 直接返回最终 `AliasToken`，`useToken()` 只返回 `{ token }`，没有 TsukiProvider 时回退默认主题。`useOptionalToken()` 在没有 TsukiProvider 时返回 `null`，存在 TsukiProvider 时与 `useToken()` 一样应用 Motion 策略；`getDesignToken()` 不读取系统动效设置。Theme 不包含业务主题或平台专用 token。

`ThemeConfig.mode` 支持 `'light'` 和 `'dark'`，TsukiProvider、ConfigProvider 与 getDesignToken 均可使用，无需导入内置算法。解析优先级为显式 `algorithm`、显式 `mode`、父级算法、默认浅色；显式 `mode: 'light'` 可以覆盖父级暗色。`inherit: false` 时不继承父级算法。Theme 不自动跟随系统明暗模式，应用应自行选择 mode 或 algorithm。声明式 Portal 保留当前位置的局部主题；命令式浮层使用 TsukiProvider 所在位置的主题。

公开算法为 `defaultAlgorithm` 和 `darkAlgorithm`；默认 seed、预设色配置与算法组合器为内部实现。多个算法通过 `algorithm: [first, second]` 按顺序执行，后续算法通过 `previous` 接收前一个结果。

## 移动端 Token 边界

全局间距使用 `paddingXXS / paddingXS / paddingSM / padding / paddingLG / paddingXL`，对应 `4 / 8 / 12 / 16 / 24 / 32`。边框同时提供 `lineWidth` 和 `lineWidthHairline`：按钮、输入框使用普通边框，Cell/List 分割线使用 hairline。

核心主题不再生成 Web 专用的 Heading、hover、focus、link decoration、wireframe 和重复的 `blue1`/`blue-1` 调色板命名。预设色基础值仍可用于组件 API，调色板只保留 `blue-1` 这一类带连字符命名。

基础文本请使用库导出的 `Text`，它会自动应用 `colorText`，并支持 `secondary`、`tertiary`、`disabled` 语义；通用 `View` 不会自动添加背景色。
