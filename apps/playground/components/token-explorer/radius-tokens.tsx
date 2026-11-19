import { TokenSection } from './token-section'
import type { TokenDetail } from './token-types'

export function RadiusTokens({ tokens }: { tokens: TokenDetail[] }) {
  return (
    <TokenSection
      title="Radius"
      description="Component border radii are shown as defined by the current Theme API."
      tokens={tokens}
      testID="radius-tokens"
    />
  )
}
