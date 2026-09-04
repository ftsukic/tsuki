---
title: Expo Snack 预览
order: 3
---

# Expo Snack 预览

`@ftsukic/dumi-theme-rn-snack` 覆盖 dumi 默认的 H5 Previewer，并保留 dumi 原有 demo 写法。

主题会把 demo asset 转换为以下 Snack payload：

- `entry` 转为 `App.tsx`
- `FILE` dependency 转为 Snack file
- `NPM` dependency 转为 Snack dependency

当前骨架还没有已发布的 Snack ID，因此会显示占位状态。后续可以由 registry 或生成脚本为每个 demo 绑定 saved Snack。

依赖 Native Module、Fabric 原生组件或 HarmonyOS 专属能力的 demo，必须明确标记为 Native Runtime，不能把 Snack 结果当成原生验证结果。
