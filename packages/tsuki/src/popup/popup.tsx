import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { OverlayPortal } from '../overlay/overlay-portal'
import { createPopupTransition } from '../overlay/transition/presets'
import { useTsukiTheme } from '../theme/theme'
import { PopupContent } from './popup-content'
import { PopupMask } from './popup-mask'
import type { PopupProps } from './types'

export function Popup({
  visible,
  defaultVisible = false,
  onVisibleChange,
  afterOpen,
  afterClose,
  closeOnBack = true,
  initialFocusRef,
  returnFocusRef,
  position = 'center',
  round = false,
  overlay = true,
  closeOnPressOverlay = false,
  onPressOverlay,
  modal = true,
  scrollable = false,
  closeable = false,
  closeIcon,
  keyboardAvoiding = false,
  safeAreaInsetTop = false,
  safeAreaInsetBottom = false,
  className,
  classNames,
  style,
  styles,
  testID,
  children,
}: PopupProps) {
  const theme = useTsukiTheme()
  const safeAreaInsets = useContext(SafeAreaInsetsContext)
  const [uncontrolledVisible, setUncontrolledVisible] = useState(defaultVisible)
  const isControlled = visible !== undefined
  const isVisible = isControlled ? visible : uncontrolledVisible
  const visibleRef = useRef(isVisible)
  visibleRef.current = isVisible

  const requestVisible = useCallback(
    (nextVisible: boolean) => {
      if (visibleRef.current === nextVisible) return
      if (!isControlled) {
        visibleRef.current = nextVisible
        setUncontrolledVisible(nextVisible)
      }
      onVisibleChange?.(nextVisible)
    },
    [isControlled, onVisibleChange],
  )
  const handleClose = useCallback(() => {
    requestVisible(false)
  }, [requestVisible])
  const handleOverlayPress = useCallback(() => {
    onPressOverlay?.()
    if (closeOnPressOverlay) requestVisible(false)
  }, [closeOnPressOverlay, onPressOverlay, requestVisible])

  const transition = useMemo(
    () => createPopupTransition(position, theme.components.Popup.animationDuration),
    [position, theme.components.Popup.animationDuration],
  )
  const accessibility = useMemo(
    () => ({
      mode: modal ? ('modal' as const) : ('non-modal' as const),
      initialFocusRef,
      returnFocusRef,
    }),
    [initialFocusRef, modal, returnFocusRef],
  )

  return (
    <OverlayPortal
      accessibility={accessibility}
      backBehavior={closeOnBack ? 'dismiss' : 'consume'}
      mask={
        overlay ? (
          <PopupMask
            classNames={classNames}
            onPress={handleOverlayPress}
            style={styles?.mask}
            testID={testID ? `${testID}-mask` : 'popup-mask'}
          />
        ) : undefined
      }
      onBack={closeOnBack ? handleClose : undefined}
      onEntered={afterOpen}
      onExited={afterClose}
      transition={transition}
      visible={isVisible}
    >
      <PopupContent
        bottomSafeAreaInset={safeAreaInsets?.bottom ?? 0}
        className={className}
        classNames={classNames}
        closeIcon={closeIcon}
        closeable={closeable}
        keyboardAvoiding={keyboardAvoiding}
        onClose={handleClose}
        position={position}
        round={round}
        safeAreaInsetBottom={safeAreaInsetBottom}
        safeAreaInsetTop={safeAreaInsetTop}
        scrollable={scrollable}
        style={style}
        styles={styles}
        testID={testID}
        topSafeAreaInset={safeAreaInsets?.top ?? 0}
      >
        {children}
      </PopupContent>
    </OverlayPortal>
  )
}
