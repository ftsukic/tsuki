# Tsuki v2 示例规范

## 源码与文档

每个 v2 组件使用 `packages/tsuki/src/<component>/__fixtures__/overview.tsx` 作为 Playground 入口。可独立阅读的示例放在 `examples/<scenario>.tsx`。用 kebab-case 命名文件，默认导出 PascalCase 函数组件，并提供 `@title` 和 `@description`。示例从 `@ftsukic/tsuki` 导入 Tsuki API。交互示例应更新可见状态或产生可观察结果。

Overview 导入并渲染全部示例。页面滚动容器统一使用 16 dp 内边距和间距，并保留键盘显示时的点击交互。Playground 路由负责安全区域，v2 预览负责背景和跟随首页设置的主题。Icon 使用该页面级主题读取前景和次色。Text 的 Dark Mode 示例单独使用深色 Provider，以便在浅色页面预览深色主题。

在 `docs/components/v2/<component>/index.md` 链接 Overview 和示例源文件。链接标题与对应的 `@title` 一致。历史文档保存在 `docs/components/`。

## Playground 入口

在 [Fixture Manifest](../../apps/playground/fixtures/manifest.json) 中登记组件 ID、版本、分类、排序、标题、描述及入口路径。类别顺序由其中的 `categories` 声明。v2 使用 `<component>-v2`，归档继续使用原始 ID。页面和搜索结果使用同一份生成目录，首页将 Tsuki v2 放在 Legacy v1 前面。

Playground 保留归档的入口解析供 v1 页面与导航使用。Metro 从 v2 Fixture 解析公共包名时加载 v2 源码。v2 示例由独立的 Fixture TypeScript 项目使用公共入口检查。主题的 NativeWind 变量只在 v2 预览内注入，v2 Tailwind 源扫描范围覆盖组件和示例。使用嵌套 `ConfigProvider` 时，NativeWind 变量作用域由消费端通过 `serializeTheme()` 建立。

## 验收

1. 运行 `pnpm run fixtures:generate` 重新生成目录，再运行 `pnpm run fixtures:check` 检查一致性。CI 会先运行只读检查。
2. 运行 `pnpm run package:fixtures:typecheck`、`pnpm run playground:typecheck` 和 `pnpm run playground:test`。
3. 验证两种 NativeWind 消费端的打包及公开入口。在 Android 上检查版本分类、亮暗主题、页面滚动和示例的真实交互。

归档例外记录在生成器中。Cell 的 `disabled`、`extra`、`theme`，ImagePreview 的 `navigation`、`preview-toolbar`，以及 Portal 的 `controlled-input` 保留原有引用状态。新增未引用的示例会使检查失败。
