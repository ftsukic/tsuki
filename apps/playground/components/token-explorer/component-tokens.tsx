import { TokenSection } from './token-section'
import type { TokenDetail } from './token-types'

export function ComponentTokens({ tokens }: { tokens: TokenDetail[] }) {
  return (
    <TokenSection
      title="Component Tokens"
      description="Complete component-level theme configuration for Button, Input, Divider, Surface, Card, Cell, Dialog, and Popup."
      tokens={tokens}
      testID="component-tokens"
    />
  )
}
