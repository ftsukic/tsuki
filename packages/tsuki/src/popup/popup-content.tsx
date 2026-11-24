import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode, RefAttributes } from 'react'
import type { LayoutChangeEvent, PressableProps, ViewProps } from 'react-native'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View as NativeView,
} from 'react-native'
import { measureViewInWindow } from '../floating/measure'
import { Icon } from '../icon'
import { semanticClassName } from '../style/semantic'
import {
  getPopupContainerStyle,
  getPopupKeyboardOverlap,
  getPopupRoundClass,
  getPopupSafeAreaInset,
  getPopupTopSafeAreaInset,
  getPopupWrapperStyle,
  popupLayoutStyles,
} from './style'
import type { PopupHostFrame } from './style'
import type { PopupPosition, PopupProps } from './types'

interface PopupContentProps {
  position: PopupPosition
  round: boolean
  scrollable: boolean
  closeable: boolean
  closeIcon?: ReactNode
  onClose?: () => void
  keyboardAvoiding: boolean
  safeAreaInsetTop: boolean
  safeAreaInsetBottom: boolean
  topSafeAreaInset: number
  bottomSafeAreaInset: number
  testID?: string
  children: PopupProps['children']
  className?: string
  classNames?: PopupProps['classNames']
  style?: PopupProps['style']
  styles?: PopupProps['styles']
}

function sameFrame(left: PopupHostFrame, right: PopupHostFrame) {
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height
  )
}

export function PopupContent({
  position,
  round,
  scrollable,
  closeable,
  closeIcon,
  onClose,
  keyboardAvoiding,
  safeAreaInsetTop,
  safeAreaInsetBottom,
  topSafeAreaInset,
  bottomSafeAreaInset,
  testID,
  children,
  className,
  classNames,
  style,
  styles,
}: PopupContentProps) {
  const rootRef = useRef<NativeView>(null)
  const measureGenRef = useRef(0)
  const [hostFrame, setHostFrame] = useState<PopupHostFrame>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [availableSize, setAvailableSize] = useState({ width: 0, height: 0 })
  const [keyboardScreenY, setKeyboardScreenY] = useState<number | null>(null)

  useEffect(() => {
    if (!keyboardAvoiding) {
      setKeyboardScreenY(null)
      return
    }

    const currentKeyboard = Keyboard.metrics()
    setKeyboardScreenY(currentKeyboard?.screenY ?? null)
    const onKeyboardFrame = (event: { endCoordinates: { height: number; screenY: number } }) => {
      setKeyboardScreenY(event.endCoordinates.height > 0 ? event.endCoordinates.screenY : null)
    }
    const onKeyboardHide = () => setKeyboardScreenY(null)
    const subscriptions =
      Platform.OS === 'ios'
        ? [
            Keyboard.addListener('keyboardWillChangeFrame', onKeyboardFrame),
            Keyboard.addListener('keyboardWillHide', onKeyboardHide),
          ]
        : [
            Keyboard.addListener('keyboardDidShow', onKeyboardFrame),
            Keyboard.addListener('keyboardDidHide', onKeyboardHide),
          ]

    return () => subscriptions.forEach((subscription) => subscription.remove())
  }, [keyboardAvoiding])

  const handleRootLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    const localFrame = { x: 0, y: 0, width, height }
    setHostFrame((current) => (sameFrame(current, localFrame) ? current : localFrame))

    const generation = ++measureGenRef.current
    void measureViewInWindow(rootRef.current).then((windowFrame) => {
      if (measureGenRef.current !== generation || !windowFrame) return
      setHostFrame((current) => (sameFrame(current, windowFrame) ? current : windowFrame))
    })
  }, [])

  const handleAvailableLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setAvailableSize((current) =>
      current.width === width && current.height === height ? current : { width, height },
    )
  }, [])

  const keyboardOverlap =
    keyboardAvoiding && Platform.OS !== 'ios'
      ? getPopupKeyboardOverlap(hostFrame, keyboardScreenY)
      : 0
  const keyboardVisible = keyboardAvoiding && keyboardScreenY !== null
  const topInset = safeAreaInsetTop ? getPopupTopSafeAreaInset(position, topSafeAreaInset) : 0
  const bottomInset = safeAreaInsetBottom
    ? getPopupSafeAreaInset(position, bottomSafeAreaInset, keyboardVisible)
    : 0
  const layoutWidth = availableSize.width || hostFrame.width
  const layoutHeight = availableSize.height || Math.max(0, hostFrame.height - keyboardOverlap)
  const rootTestID = testID ? `${testID}-root` : 'popup-root'
  const containerTestID = testID ? `${testID}-container` : 'popup-container'
  const body = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={popupLayoutStyles.scroll}
    >
      {children}
    </ScrollView>
  ) : (
    children
  )

  return createElement(
    NativeView,
    {
      className: semanticClassName(classNames, 'root', 'flex-1'),
      collapsable: false,
      onLayout: handleRootLayout,
      pointerEvents: 'box-none',
      ref: rootRef,
      style: [popupLayoutStyles.root, styles?.root],
      testID: rootTestID,
    } as ViewProps & RefAttributes<NativeView>,
    <KeyboardAvoidingView
      behavior={keyboardAvoiding && Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={keyboardAvoiding && Platform.OS === 'ios'}
      pointerEvents="box-none"
      style={popupLayoutStyles.keyboardLayer}
    >
      {createElement(
        NativeView,
        {
          className: semanticClassName(classNames, 'wrapper', 'flex-1'),
          onLayout: handleAvailableLayout,
          pointerEvents: 'box-none',
          style: [
            popupLayoutStyles.wrapper,
            getPopupWrapperStyle(position, keyboardOverlap),
            styles?.wrapper,
          ],
          testID: testID ? `${testID}-wrapper` : undefined,
        } as ViewProps,
        createElement(
          NativeView,
          {
            className: semanticClassName(
              classNames,
              'container',
              ['overflow-hidden bg-tsuki-popup-background', getPopupRoundClass(position, round)],
              className,
            ),
            style: [
              popupLayoutStyles.container,
              getPopupContainerStyle(position, layoutWidth, layoutHeight),
              styles?.container,
              style,
            ],
            testID: containerTestID,
          } as ViewProps,
          topInset > 0
            ? createElement(NativeView, {
                accessibilityElementsHidden: true,
                importantForAccessibility: 'no-hide-descendants',
                style: [popupLayoutStyles.safeAreaSpacer, { height: topInset }],
                testID: testID ? `${testID}-safe-area-top` : undefined,
              } as ViewProps)
            : null,
          body,
          closeable
            ? createElement(
                Pressable,
                {
                  accessibilityLabel: 'Close',
                  accessibilityRole: 'button',
                  className: 'absolute right-3 top-3 z-10 h-8 w-8 items-center justify-center',
                  hitSlop: 8,
                  onPress: onClose,
                  testID: testID ? `${testID}-close` : 'popup-close',
                } as PressableProps,
                closeIcon ?? <Icon name="CloseOutlined" size={18} />,
              )
            : null,
          bottomInset > 0
            ? createElement(NativeView, {
                accessibilityElementsHidden: true,
                importantForAccessibility: 'no-hide-descendants',
                style: [popupLayoutStyles.safeAreaSpacer, { height: bottomInset }],
                testID: testID ? `${testID}-safe-area` : undefined,
              } as ViewProps)
            : null,
        ),
      )}
    </KeyboardAvoidingView>,
  )
}
