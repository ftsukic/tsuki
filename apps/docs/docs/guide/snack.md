---
title: Native Runtime 验证
order: 3
---

# Native Runtime 验证

当前文档不接入 Expo Snack，所有组件 demo 通过 `react-native-web` 在 H5 页面中预览。

H5 预览适合检查：

- 组件布局、颜色和 token 派生结果
- Button、Cell、TextInput 等组件的基础交互
- Theme algorithm 和 token override 的切换效果

以下场景必须使用 Native Runtime：

- Native Module、原生权限、原生导航或平台系统 API
- Fabric 原生组件、原生动画性能和手势行为
- iOS、Android、HarmonyOS 的平台差异和安装包集成

`packages/dumi-theme-rn-snack` 和 `examples/snack` 暂作为未来占位保留，不参与当前文档构建，也不会加载 Snack embed script。
