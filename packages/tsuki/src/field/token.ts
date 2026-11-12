import type { AliasToken, FieldToken } from '../theme'

export function getFieldToken(token: AliasToken): FieldToken {
  return {
    defaultTitleWidth: token.fontSize * 6.2,
    titleGap: token.paddingSM,
    descriptionGap: token.paddingXS,
    errorGap: token.paddingXS,
    descriptionColor: token.colorTextSecondary,
    errorColor: token.colorError,
    warningColor: token.colorWarning,
  }
}
