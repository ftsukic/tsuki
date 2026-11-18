# Tsuki Native 架构

## 工作区与构建基线

从 `tsuki-1x-refactor` 的 `6974573468e5f9b230b8ff555c0c0fb21a2dc8ca` 创建 `feat/tsuki-native`。源工作树与新工作树的初始检查均为空。

- `pnpm-workspace.yaml` 已覆盖 `packages/*`。现有 Tsuki 使用 Bob 生成 ESM、CommonJS 和声明，按条件导出。新包采用同类构建和导出约定，另将 Codegen Spec、Podspec 和平台源码纳入 tarball。
- Playground 锁定 Expo 57.0.32、RN 0.86.3，已声明 expo-dev-client。当前可读的 Altron 移动端是 Expo 58、RN 0.88.1，因此以隔离的 RN 0.82 CLI fixture 作为 CLI 验证基线。
- 根脚本的 build、lint、test 和发布验证均有显式范围。CI 的 Playground build 执行 Expo export，原生编译需要独立验证。现有发布 workflow 与校验脚本绑定 Tsuki 包，独立发布路径留到发布阶段。
- Windows 本机已发现 JDK 17、ADB 和在线 Android 模拟器。iOS CocoaPods 和 Xcode 验收需要可用的 macOS 环境。原生最低版本、Kotlin、AGP 和 CocoaPods 基线以阶段 2–3 的宿主生成产物与构建结果为准。

## 包与组件边界

`@ftsukic/tsuki-native` 独立于 `@ftsukic/tsuki`。根入口和 `/selectable-text` 导出同一组件。宿主使用标准 Fabric Codegen 与各自的 Autolinking。Swift/UIKit 与 Objective-C++ Fabric 入口分工，Android 使用 Kotlin View 和生成的 Manager Delegate。

文字排版使用 UIKit/TextKit 与 Android TextView。测量 Spike 应验证 Fabric 在受限宽度下的 Yoga 高度及布局与绘制一致性。选择状态、手柄绘制和拖动保持在原生端。先验证系统选择行为的可扩展性，再决定是否需要自定义交互。

事件使用相对组件的 dp 坐标和 UTF-16 索引，原生层保护 grapheme cluster 边界。默认使用系统工具栏，自定义模式向业务发送稳定选区与关闭通知。业务负责自定义菜单渲染。文本替换、列表复用和命令清除需要覆盖选区生命周期。
