import type { AliasToken } from '../theme'

export function getPickerGroupStyles(token: AliasToken) {
  return {
    root: { backgroundColor: token.colorBgContainer },
    tabs: { marginTop: token.paddingXXS },
    tabTitle: { marginRight: 16 },
  } as const
}
