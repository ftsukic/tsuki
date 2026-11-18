/**
 * @title Variants
 * @description Demonstrates Text variants.
 */
import { Text } from '../../index'

export default function Variants() {
  return (
    <>
      {(['body', 'body-sm', 'label', 'caption', 'title', 'heading'] as const).map((variant) => (
        <Text key={variant} variant={variant}>
          {variant}
        </Text>
      ))}
    </>
  )
}
