import { generate } from '@ant-design/colors'

export interface SemanticColorSet {
  backgroundColor: string
  borderColor: string
  color: string
}

/**
 * Resolves the same three palette levels used by Ant Design Alert:
 * background, border and the semantic main color.
 */
export function generateSemanticColorSet(color: string): SemanticColorSet {
  const palette = generate(color)

  return {
    backgroundColor: palette[0] ?? color,
    borderColor: palette[2] ?? color,
    color: palette[5] ?? color,
  }
}
