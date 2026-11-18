# Tsuki Native Batch 2 验收记录

## 宿主和组件

隔离宿主位于 `fixtures/rn-0.82.1`，基于 RN 社区模板 0.82.1，固定 React 19.1.1、RN 0.82.1 和 CLI 20.0.0。依赖通过 `workspace:*` 链接，Android 启用 New Architecture。Metro 从宿主解析 React 和 React Native，并监视 workspace 源码。新包声明 Babel 运行时依赖，供 Metro 转译包入口使用。

`TsukiSelectableText` 接收必填 `text`，通过直接事件 `onContentSizeChange` 返回 `nativeEvent.width` 和 `nativeEvent.height`，单位为 RN dp。两端在本地用可用宽度测量文本，首次有布局时上报，后续只在尺寸改变时上报。fixture 为组件提供明确的容器尺寸，Yoga 自动高度留给 Batch 4。

- Android 由生成的 Manager Delegate 更新 `TextView`，根据 native view tag 和 surface ID 发送事件。原生容器在附着、布局和文字更新时安排子视图布局，分离时取消待执行的布局。
- iOS 使用一个 `UILabel`，由 `RCTViewComponentView` 管理。生成的 descriptor 对接 Fabric，事件通过生成的 C++ emitter 发送。回收时清除文字与上次事件状态。

## Codegen 与自动链接

在 fixture 目录使用 RN 0.82.1 自带脚本执行 iOS 和 Android 生成。

```text
node node_modules/react-native/scripts/generate-codegen-artifacts.js -p . -t ios -o android/build/ios-codegen
node node_modules/react-native/scripts/generate-codegen-artifacts.js -p . -t android -o android/build/android-codegen
pnpm exec react-native config
```

实际产物包括 `TsukiNativeSpec` 的 `Props.h`、`EventEmitters.h`、`ComponentDescriptors.h`，以及 Android `com.facebook.react.viewmanagers` 下的 `TsukiSelectableTextManagerInterface.java` 和 `TsukiSelectableTextManagerDelegate.java`。检查了 nullable Java setter 签名、C++ 字符串 prop、两个 Float 事件字段和 descriptor。CLI 输出分别识别了 `TsukiNative.podspec`、`TsukiNativePackage`、`TsukiNativeSpec`、descriptor 和 Android JNI CMake 路径。生成产物位于忽略目录。

## iOS 验证边界

Codegen 通过。生成的 `RCTThirdPartyComponentsProvider.mm` 使用 `NSClassFromString` 查找 `TsukiSelectableTextComponentView`，模板的 `RCTAppDependencyProvider` 接入该注册路径。静态检查确认 Podspec 的 glob 包含 `.mm`，RN 0.82.1 的 `install_modules_dependencies` 添加 React-RCTFabric 与 ReactCodegen。已核对 ComponentView 的基类签名和生成的 emitter。

Windows 下未运行 CocoaPods、Xcode 编译或 iOS 模拟器。macOS 可在 fixture 内执行 `bundle install`，进入 `ios` 执行 `bundle exec pod install`，再从 fixture 运行 `pnpm ios`。

## Android 复现

在仓库根目录运行 `pnpm install --frozen-lockfile`。在 fixture 目录启动 Metro，进入 `android` 运行 Gradle。以下以 Windows x86_64 模拟器为例。

```powershell
# 在 fixture 目录启动 Metro
pnpm start --port 8093

# 在 fixture 的 android 目录
.\gradlew.bat generateCodegenArtifactsFromSchema assembleDebug -PreactNativeArchitectures=x86_64
adb reverse tcp:8081 tcp:8093
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.ftsukic.tsukinative.smoke/com.helloworld.MainActivity
```

页面提供 Update text、Unmount text 和 Mount text 操作，并显示收到的事件次数和尺寸。

## Android 实际结果

Gradle 9.0.0 执行 `generateCodegenArtifactsFromSchema assembleDebug` 成功。生成的 `PackageList.java` 实例化 `TsukiNativePackage`，JNI `autolinking.cpp` 注册 `TsukiSelectableTextComponentDescriptor`。APK 安装成功并在 `emulator-5554` 冷启动。使用 ADB UI Automator 读取界面、点击按钮并断言各阶段的文字和事件计数。

| 操作 | 原生视图和事件 |
| --- | --- |
| 初次挂载 | 显示 Initial native text，1 个事件，102.1 × 19.4 dp |
| 更新 text | 显示 Updated native text 和 Second native line，累计 2 个事件，新尺寸 121.1 × 35.8 dp |
| 卸载 | 原生文本消失，fixture 显示 Unmounted 并清空事件记录 |
| 重新挂载 | 恢复两行原生文本，收到 1 个事件，121.1 × 35.8 dp |

首次运行发现 Metro 同时加载两份 RN 组件注册表。将生成代码使用的 `react-native/*` 子路径统一解析到 fixture 后，bundle 中只剩一份注册表，重新安装和运行通过。

## 包验证与剩余事项

冻结锁文件安装、包级 TypeScript、构建、ESLint、fixture ESLint、npm pack dry run 和实际归档检查通过。归档包含双入口、声明、Spec 和双端原生实现，不含 Codegen 生成文件。未改动 Playground、Altron 或原工作树。后续保留 iOS CocoaPods、Xcode 与模拟器实测，以及 Expo 宿主验证。
