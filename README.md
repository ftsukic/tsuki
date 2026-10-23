# Tsuki

`@ftsukic/tsuki` 是一个面向 React Native 的基础 UI 组件库。

当前版本：`0.0.1`

兼容基线：React `19.2.3`、React Native `0.86.0+`。手势能力以可选 peer dependency 提供，安全区能力使用 `react-native-safe-area-context` peer dependency；TsukiProvider 默认提供手势根节点，也可通过 `gesture={false}` 关闭，并通过 `TsukiProvider safeArea` 提供安全区根节点。浮层依赖 `react-native-teleport`；应用需在 TsukiProvider 外层挂载 Teleport `PortalProvider`。Teleport 支持 iOS、Android 和 Web；当前不支持 Harmony。

## 当前状态

当前版本已完成组件包、组件文档与 Expo 预览，并实现首轮 TsukiProvider、Theme、Button、Cell、Grid、Input、Icon、Loading、Skeleton、Radio、Avatar、Badge、Portal、Overlay、Popup、Dialog、Toast 和 Notify。

计划中的基础组件包括：

- Button、Text、Icon、Avatar、Badge
- Divider、Flex、Cell、Card、Tag
- Switch、Checkbox、Input、Textarea、Search
- Modal、Empty

暂不纳入首版：Form、Upload、Picker、DatePicker、Keyboard、复杂 List 和 IM 业务组件。

## 仓库结构

```text
src/                         # 组件源码与 canonical fixtures
docs/                        # Markdown 指南与组件文档
example/                     # 独立 Expo 原生预览应用
scripts/                     # 仓库脚本
```

## 开发

```bash
corepack enable
yarn install
yarn typecheck
yarn lint
yarn test
yarn format:check
```

`example` 是使用 Expo Router 的独立预览应用，直接引用根目录 `src`。首页支持组件搜索和系统 / 浅色 / 深色主题切换，组件详情位于 `/components/[id]`，键盘实验位于 `/labs/keyboard-chat`。根布局统一接入 Teleport `PortalProvider`、Tsuki `TsukiProvider`（主题、手势、Safe Area）和 `KeyboardProvider`，所有组件页面继续复用 canonical Fixture。运行 `yarn example:dev` 后可在 development build 中检查原生行为；组件文档位于 `docs/components/`，并链接到源码旁的同一批 fixtures。

Example 固定使用 Expo SDK 57、React Native 0.86.3 和 React 19.2.3。为验证组件库当前依赖，Reanimated 4.7.1、Worklets 0.13.0、SVG 15.16.0、Gesture Handler 2.33.1、Safe Area Context 5.10.1、Keyboard Controller 1.22.8 和 FlashList 2.3.3 单独维护版本，并通过 `expo.install.exclude` 避免被 SDK 默认版本覆盖。原生依赖更新后需运行 `yarn --cwd example ios` 或 `yarn --cwd example android` 重新构建开发客户端，不能使用 Expo Go 内置的原生版本验证。

使用手势组件或 UI thread 动画时，请参考 [快速开始](docs/guide/index.md) 安装 `react-native-gesture-handler`、`react-native-reanimated` 和 `react-native-worklets`。业务 App 可以自行提供对应 root，也可以在应用入口使用 `TsukiProvider` 的 `gesture` / `safeArea` capability；已有外部 root 时保持对应选项默认值即可。

## License

MIT
