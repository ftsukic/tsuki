# Releasing

## Branches and npm channels

| Branch | Supported React Native | Version        | npm dist-tag |
| ------ | ---------------------- | -------------- | ------------ |
| `0.x`  | 0.82–0.84              | stable `0.x.y` | `latest`     |
| `main` | 0.86+                  | `1.0.0-beta.N` | `next`       |

The tag must match `package.json` and belong to the corresponding remote branch. The workflow selects and verifies the npm channel explicitly. Beta releases never update `latest`. Stable 1.x publication requires a separate channel-policy change when 1.x is ready.

Use separate worktrees and install dependencies in each. Forward-port fixes with their tests and canonical fixtures, adapting branch-specific documentation. Do not merge maintenance release commits or version numbers into main.

## Versioning

Changesets use the current release branch as `baseBranch`: `0.x` on maintenance and `main` on development.

- On `0.x`, run `yarn release:version` for the next maintenance version. Breaking changes must still include migration notes.
- On `main`, enter prerelease mode once with `yarn changeset pre enter beta`, then run `yarn release:version`. Keep `.changeset/pre.json` committed. Later beta releases use new Changesets and `yarn release:version`; do not exit prerelease mode until preparing the stable release.

## Publishing

1. Merge the scoped Changesets and fixes into the corresponding release branch.
2. Generate the version and review `package.json`, `CHANGELOG.md`, and prerelease state where applicable.
3. Commit and push the release branch.
4. Wait until CI for that exact release commit is successful.
5. Create and push the matching annotated version tag (for example, `v0.1.4` or `v1.0.0-beta.0`).
6. GitHub Actions validates the version, channel and branch ancestry, builds the package, and publishes with npm Trusted Publishing.
7. Verify the published version and its channel (`latest` or `next`).

Do not create or push a release tag while the release commit CI is pending or failing. Create beta GitHub Releases with `--prerelease --latest=false`.

Configure the npm Trusted Publisher with:

- Workflow filename: `publish.yml`
- Environment name: `npm-publish`
- Allowed action: `npm publish`

Maintainers do not need `npm login`, `NPM_TOKEN`, publish OTP, or local `npm publish`.
