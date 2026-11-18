# Tsuki Native 实施计划

每批审查完整差异，记录实际命令、结果与未解决问题，达到验收条件后提交。

| 批次 | 交付与验收 |
| --- | --- |
| 0 | 独立工作树、仓库基线与架构记录。审查文档差异并验证两个工作树的状态。 |
| 1 | 建立包、双入口、Codegen 配置、Podspec、Android Library 与构建配置。检查 workspace 识别、类型、lint、构建和 tarball。 |
| 2 | RN 0.82 双端 Fabric smoke test。验证 Codegen、原生注册、挂载、属性更新、卸载和事件。 |
| 3 | 在隔离 CLI fixture 和 Playground 开发构建验证同一包的 Autolinking、Gradle、CocoaPods 与 Expo Prebuild，核对 EAS 配置和远程验收权限。按实测结果确定兼容范围。 |
| 4 | 验证受限宽度下的原生自动测量、字体缩放、行高、多行与混排。 |
| 5 | 验证长按、拖动、多行选区、局部几何、Unicode 边界与文本更新时的清理。 |
| 6 | 验证双端高亮、手柄尺寸、触区、RTL 与拖动时的视觉一致性。 |
| 7 | 验证系统菜单、自定义模式抑制系统菜单、稳定选区事件及 clearSelection。 |
| 8 | 验收双端真机、模拟器、CLI、Expo、FlashList、无障碍和性能，检查独立 tarball 与发布配置并完善 API 文档。 |

### 原生验证重点

- 在 RN 0.82 官方示例与源码中核对 Codegen schema、iOS 注册和 Android delegate，再用生成产物验证。同步检查 Playground 版本的生成差异。
- 在实现完整排版之前验证 Yoga 测量路径。固定高度的 smoke test 只覆盖注册与通信。
- 在实现视觉之前验证 UIKit 选择视图替换和菜单抑制，以及 Android ActionMode 抑制后选区与拖动是否保留。通过目标 OS 的实测结果确定兼容路径。
- 根 CI 的 JavaScript 导出通过后，仍需分别记录 Android 原生构建、iOS 模拟器及真机行为。
