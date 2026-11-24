import { createElement } from 'react'
import { Pressable } from 'react-native'
import type { PressableProps, StyleProp, ViewStyle } from 'react-native'
import { semanticClassName } from '../style/semantic'
import type { PopupClassNames } from './types'
import { popupLayoutStyles } from './style'

export function PopupMask({
  classNames,
  onPress,
  style,
  testID,
}: {
  classNames?: PopupClassNames
  onPress: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}) {
  return createElement(Pressable, {
    accessible: false,
    accessibilityElementsHidden: true,
    className: semanticClassName(classNames, 'mask', 'absolute inset-0 bg-tsuki-popup-overlay'),
    importantForAccessibility: 'no-hide-descendants',
    onPress,
    pointerEvents: 'auto',
    style: [popupLayoutStyles.mask, style],
    testID,
  } as PressableProps)
}
