import { TokenSection } from './token-section'
import type { TokenDetail } from './token-types'

export function SpacingTokens({ tokens }: { tokens: TokenDetail[] }) {
  return (
    <TokenSection
      title="Spacing"
      description="Values come from component padding and gap tokens; the current Theme API has no global spacing scale."
      tokens={tokens}
      testID="spacing-tokens"
    />
  )
}
