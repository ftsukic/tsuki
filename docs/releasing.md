# Releasing

1. Run `yarn release:version` after the Changesets have been merged into `main`.
2. Review `package.json` and `CHANGELOG.md`.
3. Commit the release version.
4. Push `main`.
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
