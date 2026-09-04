# React Native UI

`@ftsukic/react-native-ui` 是一个面向 React Native 的基础 UI 组件库。

当前版本：`0.0.1`

## 当前状态

当前版本完成仓库、组件包、dumi 文档和 Expo Snack Previewer 的基础骨架，暂不包含具体组件实现。

计划中的基础组件包括：

- Button、Text、Icon、Avatar、Badge
- Divider、Space、Flex、Cell、Card、Tag
- Switch、Checkbox、Radio、Input、Textarea、Search
- Popup、Modal、Toast、Loading、Empty、Skeleton

暂不纳入首版：Form、Upload、Picker、DatePicker、Keyboard、复杂 List 和 IM 业务组件。

## Monorepo

```text
packages/ui/                 # @ftsukic/react-native-ui
packages/dumi-theme-rn-snack/ # dumi Snack 主题
apps/docs/                   # dumi 文档站
examples/snack/              # Snack 示例源码约定
```

## 开发

```bash
corepack enable
yarn install
yarn typecheck
yarn lint
yarn test
yarn docs:dev
```

## License

MIT
