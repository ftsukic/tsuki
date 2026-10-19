# 发布 Rule

## Changeset policy

- Changeset 是条件性要求，不是每次仓库变更的必需项。
- Public package API 变更、用户可观察行为变更，以及应出现在 npm release notes 中的变更，通常需要 Changeset。
- Agent Context work、纯 internal maintenance，以及不会影响 published package behavior 的变更，通常不需要 Changeset。
- 不确定时，先检查受影响的 package surface 和 release documentation，再做决定；不要仅为满足清单而创建 placeholder Changeset。

## 发布流程的事实来源

- 使用 `docs/releasing.md`、`.github/workflows/publish.yml`、`.changeset/`、`scripts/validate-release.cjs` 和 `scripts/validate-package.cjs` 作为 release fact。本 Rule 不复制 workflow implementation。
- 文档化流程是 Changeset 合并到对应发布分支（`0.*` 使用 `0.x`，新主版本使用 `main`）、执行 release versioning 并 review、commit 和 push、CI 通过、创建匹配的 `vX.Y.Z` tag、push tag、GitHub Actions 以及 npm Trusted Publishing。
- 不要将本地 `npm publish`、本地 npm credential、token 或 OTP 引入为标准 release path。
- 不要在 component 或 Agent Context work 中顺便修改 release workflow、validation script、package content 或 versioning。
