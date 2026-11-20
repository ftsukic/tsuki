# Theme / Style 规则

## Theme contract

- 修改 Theme behavior 前，读取 `packages/tsuki/src/theme/` 的实际类型、默认值、合并、Provider 和序列化逻辑。不要假设仓库已经采用源码中不存在的 `SeedToken`、`MapToken`、`AliasToken` 或 `MappingAlgorithm` 层级。
- 当前 `ThemeConfig` 接受 semantic/component token 的 partial override 和可选 `inherit`；`ResolvedTheme` 包含 scheme 与合并后的 semantic/component tokens。遵循现有 `ConfigProvider`、ThemeContext 和合并语义。
- 设计系统共享的 visual value 使用合适的 semantic token；只有真正属于单个 component 且应允许 consumer 配置的值才放入该 component token。
- 保留 theme inheritance、override、dark/default behavior、component token 与 hairline behavior。不要把 theme change 伪装成 context 或 naming cleanup。

## Motion policy

- Motion 配置属于运行策略，不属于 CSS design token。运行时落地时，将 `MotionConfig` 纳入现有 `ThemeConfig` / `ResolvedTheme`，由当前 Provider / ConfigProvider 合并；不得另建 Theme Provider。
- Motion 默认策略为 `enabled: true`、`reducedMotion: 'system'`、`durationScale: 1`。系统 Reduced Motion 由 Motion runtime 共享订阅并解析。
- `serializeTheme()` 不输出 Motion policy，也不把它转换成 NativeWind CSS 变量。更新 theme defaults/merge 时，保留 serializer 只负责语义和组件样式变量的边界。
- 当前 v2 源码还没有 `ThemeConfig.motion`；以上是该运行时的目标约束，实施状态以源码为准。

## Component styling

- Public `style` / `styles` API semantics 由 `api-design.md` 定义。本 Rule 负责 semantic slot design、style resolution、precedence 和 theme integration。
- Semantic slot name 应与 UI meaning 相关。避免使用 `wrapper1`、`leftBox`、`innerView` 或 `content2` 等位置名称。
- 通过现有 style 和 token helper 解析样式，不要用 ad hoc constant 绕过 theme override。
- 只有 component 存在独立且可配置的 visual variable 时，才创建 component token definition。不要为了目录对称而创建空的 `token.ts`。
- NativeWind `className` 用于静态样式，动画 SharedValue 由 Reanimated animated style 消费；不要用 `cn` 或 `tailwind-merge` 处理动态 SharedValue。

## 变更边界

- 修改 styling 前，检查受影响 component 的 `style.ts`、token factory、type、theme provider usage 和测试。
- 不要将 token derivation、style precedence 或 public semantic slot 的变更作为 file-structure 或文档变更的附带内容。
