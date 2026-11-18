import { View } from 'react-native'
import type { ReactElement, ReactNode } from 'react'
import type { StyleProp, TextStyle } from 'react-native'
import { Text } from '../text'
import type { FieldResolvedStyles } from './style'
import type { FieldSemanticStyles, FieldStatus } from './types'

function isVisible(value: ReactNode): boolean {
  return value !== null && value !== undefined && value !== false && value !== ''
}

export function resolveFieldStatus(
  status: FieldStatus | undefined,
  errorMessage: ReactNode,
): FieldStatus {
  return status ?? (isVisible(errorMessage) ? 'error' : 'default')
}

function renderFeedback(value: ReactNode, style: StyleProp<TextStyle>) {
  if (!isVisible(value)) return null
  if (typeof value === 'string' || typeof value === 'number') {
    return <Text style={style}>{value}</Text>
  }
  return value
}

export function renderFieldFeedback(
  help: ReactNode,
  errorMessage: ReactNode,
  resolved: FieldResolvedStyles,
  semantic?: FieldSemanticStyles,
): ReactElement | null {
  if (!isVisible(help) && !isVisible(errorMessage)) return null

  return (
    <View style={[resolved.feedback, semantic?.feedback]}>
      {renderFeedback(help, [resolved.description, semantic?.help])}
      {isVisible(errorMessage) ? (
        <View accessibilityRole="alert" accessibilityLiveRegion="polite">
          {renderFeedback(errorMessage, [resolved.error, semantic?.error])}
        </View>
      ) : null}
    </View>
  )
}
