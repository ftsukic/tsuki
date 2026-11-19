import { TokenSection } from './token-section'
import type { TokenDetail } from './token-types'

export function ComponentTokens({ tokens }: { tokens: TokenDetail[] }) {
  return (
    <TokenSection
      title="Component Tokens"
      description="Complete component-level theme configuration for Button, Input, Divider, Surface, Card, and Cell."
      tokens={tokens}
      testID="component-tokens"
    />
  )
}
