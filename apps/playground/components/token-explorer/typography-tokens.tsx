import { TokenSection } from './token-section'
import type { TokenDetail } from './token-types'

export function TypographyTokens({ tokens }: { tokens: TokenDetail[] }) {
  return (
    <TokenSection
      title="Typography"
      description="Cell exposes font sizes and line heights. Font family, font weight, and letter spacing are not global Theme tokens."
      tokens={tokens}
      testID="typography-tokens"
    />
  )
}
