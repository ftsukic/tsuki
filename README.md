# React Native UI

`@ftsukic/react-native-ui` 是一个面向 React Native 的基础 UI 组件库。

当前版本：`0.0.1`

兼容基线：React `19.1.1`、React Native `0.82.1+`；Harmony 使用 React Native `0.82.1` 基线。组件库不直接依赖 RNOH、Expo 或其他 Native Module。

## 当前状态

当前版本已完成仓库、组件包、dumi 文档 H5 预览，并实现首轮 Theme/Provider、Button、Cell、TextInput、Icon 和 LoadingIcon。文档使用 `dumi-theme-mobile`、`react-native-web` 和源码同目录 `__fixtures__`，不接入 Expo Snack。

计划中的基础组件包括：

- Button、Text、Icon、Avatar、Badge
- Divider、Space、Flex、Cell、Card、Tag
- Switch、Checkbox、Radio、Input、Textarea、Search
- Popup、Modal、Toast、Loading、Empty、Skeleton

暂不纳入首版：Form、Upload、Picker、DatePicker、Keyboard、复杂 List 和 IM 业务组件。

## Monorepo

```text
packages/ui/                 # @ftsukic/react-native-ui
packages/dumi-theme-rn-snack/ # 未来 Snack 主题占位，当前未接入
apps/docs/                   # dumi H5 文档站
examples/snack/              # 未来 Snack 示例约定，当前未接入
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

## License

MIT
