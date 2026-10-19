# Releasing

The `0.x` branch maintains and publishes `0.*` versions independently. `main` is the development and release branch for the new major version. Release tags must belong to the corresponding branch: `v0.*` to `0.x`, all other stable versions to `main`.

On `0.x`, Changesets use `0.x` as their base branch. Version bumps follow the intended `0.x` release number; any breaking changes must still be explicitly documented with migration instructions in the release notes.

1. Run `yarn release:version` after the Changesets have been merged into the corresponding release branch.
2. Review `package.json` and `CHANGELOG.md`.
3. Commit the release version.
4. Push the corresponding release branch.
5. Wait until CI for that exact release commit is successful.
6. Create the matching `vX.Y.Z` tag only after CI is green.
7. Push the tag.
8. GitHub Actions validates the tag, builds the package, and publishes it to npm with Trusted Publishing.
9. GitHub Actions verifies the published version and `latest` dist-tag.

Do not create or push the release tag while the release commit CI is pending or failing.

Configure the npm Trusted Publisher with:

- Workflow filename: `publish.yml`
- Environment name: `npm-publish`
- Allowed action: `npm publish`

Maintainers do not need `npm login`, `NPM_TOKEN`, publish OTP, or local `npm publish`. Version and tag creation remain manual; the workflow only publishes an existing stable release tag.
