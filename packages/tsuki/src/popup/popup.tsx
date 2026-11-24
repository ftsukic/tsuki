import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { OverlayPortal } from '../overlay/overlay-portal'
import { OVERLAY_TRANSITION_PRESETS } from '../overlay/transition/presets'
import type { OverlayTransitionConfig } from '../overlay/transition/types'
import { useTsukiTheme } from '../theme/theme'
import { PopupContent } from './popup-content'
import { PopupMask } from './popup-mask'
import type { PopupPosition, PopupProps } from './types'

const TRANSITION_PRESET_BY_POSITION = {
  center: 'centerPopup',
  top: 'topPopup',
  bottom: 'bottomPopup',
  left: 'leftPopup',
  right: 'rightPopup',
} as const satisfies Record<PopupPosition, keyof typeof OVERLAY_TRANSITION_PRESETS>

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

  const transition = useMemo<OverlayTransitionConfig>(() => {
    const preset = OVERLAY_TRANSITION_PRESETS[TRANSITION_PRESET_BY_POSITION[position]]
    const animation = { duration: theme.components.Popup.animationDuration }
    return {
      mask: preset.mask ? { ...preset.mask, animation } : undefined,
      content: preset.content ? { ...preset.content, animation } : undefined,
    }
  }, [position, theme.components.Popup.animationDuration])
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
