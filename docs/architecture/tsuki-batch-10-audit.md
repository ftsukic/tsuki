# Tsuki Batch 10 架构审查

| 项目         | 值                                         |
| ------------ | ------------------------------------------ |
| 审查日期     | 2026-11-19                                 |
| 仓库         | `D:\dev\code\tsuki`                        |
| 分支         | `tsuki-1x-refactor`                        |
| HEAD         | `60be72d9ae38337e8b08b6d7db7d4df4e26b6a53` |
| 审查时工作树 | 干净                                       |

## Consumer 重复与环境差异

`apps/nativewind-v4-consumer/App.tsx` 和 `apps/nativewind-v5-consumer/App.tsx` 各有 351 行。逐行比较后，只有 5 行环境差异：NativeWind 的变量桥接 import、桥接组件实现，以及标题中的版本名；其余 346 行相同（98.6%）。

相同部分已经覆盖 Button、Input、Text、Icon、Space、Divider、Surface、Card、Cell 和 CellGroup，以及主题覆盖、受控交互状态、Light/Dark/System 切换、嵌套 ConfigProvider、`className`/`classNames` 和原生 `style`/`styles` 覆盖。

| 项目 | v4 | v5 |
| --- | --- | --- |
| NativeWind | `4.2.7`，Tailwind `3.4.17` | `5.0.0-rc.1`，Tailwind `4.1.12`、`react-native-css` `3.1.0-rc.1` |
| CSS 入口 | 从已安装 Tsuki 包导入 `theme.css`，使用 Tailwind v3 指令 | Tailwind v4、NativeWind theme 与 Tsuki 两个 CSS 入口 |
| 动态变量桥接 | `vars(serializeTheme(theme))` 写入 RN `View.style` | `VariableContextProvider` 接收 `serializeTheme(theme)` |
| Metro | `withNativeWind`，带 v4 的 CSS 入口 | `withNativewind`，显式排除 Tsuki 动态变量内联 |
| React Native / Expo | `0.86.3` / `57.0.32` | `0.86.3` / `57.0.32` |

两套 Consumer 分别声明 NativeWind 版本，Metro 配置也分别运行；共享层不应依赖 NativeWind 或承担变量桥接。两个应用已有对 `@ftsukic/tsuki` workspace 包的解析，不配置自定义 `watchFolders`。根 workspace glob 已包含 `packages/*`。

## Tarball 与共享代码边界

`scripts/test-consumer-tarballs.cjs` 目前只把两个 `apps/<consumer>` 目录复制到临时项目，将 `@ftsukic/tsuki` 改为本地产生的 npm tarball，然后分别运行安装、类型检查、Expo 配置和 iOS/Android development bundle。它还按当前 Fixture Manifest 把 9 组 v2 canonical fixtures 暂存到两个 Consumer。

因此共享场景包应放在 `packages/consumer-fixtures/`，作为私有 workspace package，由两个 Consumer 以 `workspace:*` 引用；包内只通过 `@ftsukic/tsuki` 公共入口导入组件。tarball 脚本需要把该私有包复制到各临时 Consumer，并将其依赖改成临时本地路径，同时继续让 Tsuki 指向待验证的 tarball。共享包不导入 NativeWind、不进入 `packages/tsuki` 发布内容；根级增加其类型检查门禁，场景测试纳入现有 v2 Jest 门禁。

这个做法保留每个应用自己的 NativeWind 依赖图、CSS 初始化和 Provider 桥接。风险集中在 Metro 对第二个 workspace 包的解析以及 tarball 临时副本；分别执行两套类型检查、tarball bundle 和 Android 模拟器运行可验证这两处。

## v2 Theme API 与 Token

事实来源是 `packages/tsuki/src/theme/types.ts`、`defaults.ts`、`merge-theme.ts`、`config-provider.tsx`、`tsuki-provider.tsx`、`serialize-theme.ts` 及根 `src/index.ts`。

- `ThemeScheme` 只有 `light | dark`。`TsukiProvider` 接收 `scheme` 与可选 `theme`；`ConfigProvider` 接收局部 `theme`。
- `ThemeConfig` 可部分覆盖 `semantic` 和 `components`，并支持 `inherit?: boolean`。默认继承时与父主题浅合并；`inherit: false` 先回到当前 scheme 的默认主题，再应用本层覆盖。scheme 仍由父级决定。
- `useTsukiTheme()` 读取 resolved theme；`serializeTheme()` 将语义和组件值映射为 `--tsuki-*` 变量。除 `disabledOpacity` 外，序列化的组件数值附加 `px`。
- v2 公共根入口导出 Provider、ConfigProvider、`ThemeConfig`、`ThemeScheme`、`SemanticTokens`、组件 Token 类型、`serializeTheme` 和组件。Theme Playground 应从该 public entry 使用 API，不增加 Token 或修改默认值。

### Semantic Tokens

| Token                    | Light     | Dark      |
| ------------------------ | --------- | --------- |
| `colorPrimary`           | `#055FFD` | `#4D8DFF` |
| `colorPrimaryForeground` | `#ffffff` | `#111827` |
| `colorSuccess`           | `#15803d` | `#4ade80` |
| `colorWarning`           | `#b45309` | `#fbbf24` |
| `colorDanger`            | `#dc2626` | `#f87171` |
| `colorForeground`        | `#111827` | `#f9fafb` |
| `colorMuted`             | `#6b7280` | `#9ca3af` |
| `colorBackground`        | `#ffffff` | `#111827` |
| `colorSurface`           | `#f9fafb` | `#1f2937` |
| `colorBorder`            | `#e5e7eb` | `#374151` |

### Component Tokens

| Component | Token 名称 | 默认值 |
| --- | --- | --- |
| Button | `borderRadius`, `height` | `8`, `44` |
| Input | `borderRadius`, `height` | `8`, `44` |
| Divider | `thickness` | `StyleSheet.hairlineWidth` |
| Surface | `borderRadius`, `padding`, `borderWidth` | `12`, `16`, `StyleSheet.hairlineWidth` |
| Card | `borderRadius`, `padding`, `headerPadding`, `bodyPadding`, `footerPadding`, `gap` | `12`, `16`, `16`, `16`, `16`, `0` |
| Cell | `paddingHorizontal`, `paddingVertical`, `largePaddingVertical`, `minHeight`, `largeMinHeight`, `fontSize`, `largeFontSize`, `descriptionFontSize`, `lineHeight`, `descriptionLineHeight`, `iconSize`, `gap`, `verticalGap`, `titleExtraGap`, `valueExtraGap`, `dividerWidth`, `groupTitlePaddingHorizontal`, `groupTitlePaddingVertical`, `groupInsetMarginHorizontal`, `groupRadius`, `disabledOpacity` | `16`, `10`, `14`, `44`, `56`, `14`, `16`, `12`, `22`, `18`, `16`, `8`, `6`, `4`, `4`, `StyleSheet.hairlineWidth`, `16`, `10`, `16`, `12`, `0.4` |

当前共 10 个语义 Token 与 35 个组件 Token。没有独立的全局 Font Family、Font Weight、Letter Spacing、Spacing 或 Radius 类型；可浏览的字体、间距和圆角值只存在于上述组件 Token 中。Explorer 应按真实组件 Token 展示这些分类，不补造通用 Token。`StyleSheet.hairlineWidth` 具有平台差异，应显示当前 resolved 值。

## Playground 当前结构与兼容边界

- `apps/playground/app/index.tsx` 现在把 `/` 映射到完整 Fixture Explorer。`/components/[id]` 使用 Manifest ID 查找例子；Manifest 是唯一 catalog 来源，当前为 55 个 v1 与 9 个 v2 条目。v1/v2 ID 及 Fixture 路径由 `scripts/generate-fixture-catalog.cjs` 校验并生成，现有搜索会匹配版本、分类、标题、组件名和描述。
- `apps/playground/components/demo-provider.tsx` 使用 `packages/tsuki/bak/src` 对应的 Legacy v1 Theme API，负责应用级 System/Light/Dark 状态、Portal 和键盘 Provider。`tsconfig.json` 的 `@ftsukic/tsuki` 路径也指向 v1 archive。
- `apps/playground/components/v2-preview.tsx` 为 v2 Fixture 单独创建 v2 Provider 与 NativeWind v5 变量上下文，目前从 `packages/tsuki/src/theme` 深路径导入。Metro 会按 import 发起文件所在目录把 `@ftsukic/tsuki` 映射到 v1 archive 或 v2 source；从 Playground 页面直接使用该名称会落入 v1。新增 v2 页面需显式使用 v2 根 `packages/tsuki/src/index.ts` 公共入口，并沿用 v2 变量桥接。
- 低风险路由结构是在保留动态 `/components/[id]` 与全部 Manifest ID 的前提下，将现有目录页挂到 `/components`，让 `/` 提供 Components、Theme Playground、Design Tokens 三个入口，再新增两个独立页面路由。目录搜索和 Fixture 生成流程保持原样。
- Playground 已依赖 Expo SDK `57.0.32`、NativeWind v5；Manifest、generated catalog、Fixture Explorer 与已有导航/搜索测试需继续作为组件展示事实来源。检索确认 `expo-clipboard` 目前未出现在依赖清单或 lockfile；原生复制能力若采用该 Expo API，应只增加与现有 SDK 对齐的直接依赖，不升级其他包。

## 建议执行顺序与检查点

1. 先抽取 Consumer 场景到私有 `packages/consumer-fixtures`，两个 App 只保留各自 Provider、变量注入、CSS 与根容器；扩展临时 tarball staging，并将共享场景测试纳入根测试门禁。
2. 在 Playground 增加 `/components`、`/theme-playground`、`/design-tokens` 页面入口。Theme 页使用现有 v2 Theme API，复用应用 Appearance 状态，覆盖局部组件 Token 与多层继承；不调整 v1 Provider 或历史 Fixture。
3. Token Explorer 从 resolved v2 theme 读取语义与组件 Token，提供 Light/Dark 值对照和 Token 名复制；分类只由当前类型推导。
4. 每批先完成聚焦类型检查、测试、打包/页面配置检查，再独立提交；最后运行请求列出的完整自动化门禁，并在 Android `emulator-5554` 验收 Playground 与两个 Consumer。审查时 `adb` 已发现运行中的 Android 模拟器；这不代表任何页面已在设备通过。
