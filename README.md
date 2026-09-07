# Tsuki

`@ftsukic/tsuki` 是一个面向 React Native 的基础 UI 组件库。

当前版本：`0.0.1`

兼容基线：React `19.1.1`、React Native `0.82.1+`；Harmony 使用 React Native `0.82.1` 基线。组件库不直接依赖 RNOH、Expo 或其他 Native Module。

## 当前状态

当前版本已完成仓库、组件包、dumi 文档 H5 预览，并实现首轮 Provider、Theme、Button、Cell、Grid、TextInput、Icon、Loading、Radio、Avatar、Badge、Portal、Overlay、Popup、Dialog、Toast 和 Notify。文档使用 `dumi-theme-mobile`、`react-native-web` 和源码同目录 `__fixtures__`，不接入 Expo Snack。

计划中的基础组件包括：

- Button、Text、Icon、Avatar、Badge
- Divider、Flex、Cell、Card、Tag
- Switch、Checkbox、Input、Textarea、Search
- Modal、Empty、Skeleton

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

## License

MIT
