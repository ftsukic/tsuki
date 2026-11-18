# Tsuki Native

`@ftsukic/tsuki-native` 是独立的 React Native Fabric 原生组件包。

```ts
import { SelectableText } from '@ftsukic/tsuki-native'
// 或使用组件子路径
import { SelectableText } from '@ftsukic/tsuki-native/selectable-text'
```

当前阶段提供包入口、`text` 属性的 Codegen 规范和原生构建配置。Fabric 挂载与文本行为将在后续批次实现。

peerDependencies 暂时限定于两个构建目标。RN CLI 基线为 RN 0.82.1 和 React 19.1.1，Playground 锁定 RN 0.86.3 和 React 19.2.3。双端原生兼容性待宿主构建验证。Expo 消费者使用 Development Build。

在仓库根目录运行 `pnpm --filter @ftsukic/tsuki-native build`，再运行 `pnpm --filter @ftsukic/tsuki-native release:check-package` 检查发布内容。独立 Git 标签使用 `tsuki-native-v<version>`，与 Tsuki 的 `v<version>` 分开。

该标签仅触发 publish-tsuki-native.yml。首次发布前需为新 npm 包配置该 workflow 的 Trusted Publishing 环境 npm-publish-native。版本从 main 发布，预发布进入 next，稳定版进入 latest。
