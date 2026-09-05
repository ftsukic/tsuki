# @ftsukic/react-native-ui

基础 React Native UI 组件库。

首轮提供 Theme/Provider、Button、Cell、Cell.Group、TextInput、Icon 和 LoadingIcon。

组件 API 采用 breaking change：使用 Vant Mobile 语义、Ant Design v6 token 分层和 React Native semantic slots，不提供 altron-app 旧 API 兼容层。

```bash
yarn add @ftsukic/react-native-ui
```

该包目标面向 React Native `0.82.1+` 和 React `19.1.1+`。

组件库本身不依赖 HarmonyOS、Expo、Gesture Handler、Reanimated 或 Safe Area Context。`react-native-svg` 是 peer dependency，宿主应用需要自行提供对应的原生运行环境。
