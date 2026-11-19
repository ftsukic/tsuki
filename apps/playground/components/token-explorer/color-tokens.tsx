import { TokenSection } from './token-section'
import type { TokenDetail } from './token-types'

export function ColorTokens({ tokens }: { tokens: TokenDetail[] }) {
  return (
    <TokenSection
      title="Colors"
      description="Semantic colors resolved for the current scheme, with Light and Dark defaults."
      tokens={tokens}
      testID="color-tokens"
    />
  )
}
