# Tsuki Native Batch 3 验收报告

本批复用 `fixtures/rn-0.82.1` 并接入 `apps/playground`。Playground 使用 workspace 依赖和同一份原生源码，Expo 保持 57.0.32，React Native 保持 0.86.3。验收页为 `/labs/selectable-text`，与 Fixture Catalog 独立。

| 项目 | 结果 |
| --- | --- |
| RN CLI 0.82.1 Android 回归 | `gradlew.bat assembleDebug -PreactNativeArchitectures=x86_64` 通过。挂载、更新、事件和卸载的设备证据见 Batch 2，本批复查构建。 |
| RN CLI 0.82.1 iOS | 重新生成 Codegen 通过。静态核对 descriptor、ComponentView、Podspec 和注册映射。CocoaPods 安装、Xcode 编译、模拟器与事件实测未执行。 |
| Expo Autolinking | iOS `expo-modules-autolinking react-native-config --platform ios` 识别 `TsukiNative.podspec`。Android 生成的 PackageList 和 JNI 注册包含 `TsukiNativePackage` 与 `TsukiSelectableTextComponentDescriptor`。 |
| RN 0.86.3 Codegen | 使用 Playground 的 RN 脚本生成 iOS 产物，并通过 Android Gradle 生成 Java Interface、Delegate 和 descriptor。Android Interface 和 Delegate 与 RN 0.82.1 产物无差异。iOS provider 映射到同一个 `TsukiSelectableTextComponentView`。 |
| Expo iOS | Codegen 与 Podspec 发现静态通过。Windows 未执行 iOS Prebuild、CocoaPods、Xcode、安装启动和生命周期实测。 |
| EAS | 原先没有 `eas.json`。新增 development profile，配置 Development Client、内部发布、Android APK 和 iOS Simulator。Expo 会话未登录，项目没有 EAS 项目 ID，远程构建与远程 Codegen 未执行。 |
| 包验证 | 冻结锁文件安装、包级 typecheck、build、ESLint、实际 tarball 和 dry run 通过。Playground Expo Config、typecheck 和验收页 ESLint 通过。 |

Android Prebuild 前确认两个原生目录均不存在、无 Git 跟踪文件。运行 `npx --yes @expo/agent-cli@latest prebuild --platform android --no-install`，生成目录被忽略。日志提示自动外观需要 `expo-system-ui`，保持现有依赖。Expo Go 无法运行此自定义原生组件。

RN 0.82.1 和 RN 0.86.3 的 peer 版本继续以现有精确声明为准。后续在 macOS 验证两个消费者的 CocoaPods／Xcode 和 iOS 生命周期，Batch 4 优先验证受限宽度下 Fabric 的自动高度。

## Expo Android 与 Metro 实测

在生成的 Android 工程执行 `gradlew.bat generateCodegenArtifactsFromSchema assembleDebug -PreactNativeArchitectures=x86_64 --console=plain`，756 个任务执行成功。通过 ADB 安装 APK，在 `emulator-5554` 冷启动 Development Client，连接端口 8094 的 Metro 后打开 `playground:///labs/selectable-text`。

| 操作      | UI Automator 实际观察                                        |
| --------- | ------------------------------------------------------------ |
| 初次挂载  | 文本长度 19，原生文本显示，1 次事件，102.1 × 19.4 dp         |
| 更新 text | 显示两行，文本长度 38，累计 2 次事件，新尺寸 121.1 × 35.8 dp |
| 卸载      | 原生文本消失，界面显示 Unmounted，清空事件记录               |
| 重新挂载  | 恢复两行文本，1 次事件，121.1 × 35.8 dp                      |

Android bundle 请求返回 HTTP 200。检查 bundle 的模块路径，`ReactNativeViewConfigRegistry.js` 只来自 RN 0.86.3，`NativeComponentRegistry` 也只有一份。运行日志确认 `fabric: true`，验收进程没有出现重复 ViewManager 或组件找不到的错误。沿用 Expo Autolinking 模块解析和现有 Metro 配置。
