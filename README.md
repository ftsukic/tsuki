# Tsuki

`@ftsukic/tsuki` 是一个面向 React Native 的基础 UI 组件库。

当前版本：`0.0.1`

兼容基线：React `19.1.1`、React Native `0.82.1+`；Harmony 使用 React Native `0.82.1` 基线。手势能力以可选 peer dependency 提供，安全区能力使用 `react-native-safe-area-context` peer dependency；Provider 默认提供手势根节点，也可通过 `gesture={false}` 关闭，并通过 `Provider safeArea` 提供安全区根节点。

## 当前状态

当前版本已完成仓库、组件包、dumi 文档 H5 预览，并实现首轮 Provider、Theme、Button、Cell、Grid、TextInput、Icon、Loading、Skeleton、Radio、Avatar、Badge、Portal、Overlay、Popup、Dialog、Toast 和 Notify。文档使用 `dumi-theme-mobile`、`react-native-web` 和源码同目录 `__fixtures__`，不接入 Expo Snack。

计划中的基础组件包括：

- Button、Text、Icon、Avatar、Badge
- Divider、Flex、Cell、Card、Tag
- Switch、Checkbox、Input、Textarea、Search
- Modal、Empty

暂不纳入首版：Form、Upload、Picker、DatePicker、Keyboard、复杂 List 和 IM 业务组件。

## 仓库结构

```text
src/                         # 组件源码与 canonical fixtures
docs/                        # Dumi 文档
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
yarn docs:dev
```

`example` 是独立的传统 Expo 原生预览应用，直接引用根目录 `src`。运行 `yarn example:dev` 后可在 Expo Go 或 development build 中检查原生行为；Dumi H5 文档使用 `react-native-web` 渲染源码旁的同一批 fixtures。

使用手势组件或 UI thread 动画时，请参考 [快速开始](docs/guide/index.md) 安装 `react-native-gesture-handler`、`react-native-reanimated` 和 `react-native-worklets`。业务 App 可以自行提供对应 root，也可以在应用入口使用 `Provider` 的 `gesture` / `safeArea` capability；已有外部 root 时保持对应选项默认值即可。

## License

MIT
