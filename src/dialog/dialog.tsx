import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, useWindowDimensions, View } from 'react-native'
import { Button } from '../button'
import { PopupContent } from '../popup/popup'
import { Portal } from '../portal'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import type { DialogAction, DialogProps, DialogStyleState } from './types'
import { getDialogStyles } from './style'
import { getDialogToken } from './token'
import { getDialogLayoutState } from './utils'

function isTextContent(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

export const DialogContent = forwardRef<View, DialogProps>(function DialogContent(props, ref) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Dialog', getDialogToken)
  const {
    show = false,
    title,
    message,
    children,
    footer,
    width,
    theme = 'default',
    messageAlign = 'center',
    showConfirmButton = true,
    showCancelButton = false,
    cancelButtonText = '取消',
    cancelButtonColor,
    cancelButtonDisabled = false,
    confirmButtonText = '确认',
    confirmButtonColor,
    confirmButtonDisabled = false,
    overlay = true,
    overlayStyle,
    closeOnClickOverlay = false,
    zIndex = token.zIndex,
    beforeClose,
    style,
    styles,
    onShowChange,
    onConfirm,
    onCancel,
    onOpened,
    onClose,
    ...viewProps
  } = props
  const { height } = useWindowDimensions()
  const [closingAction, setClosingAction] = useState<DialogAction | null>(null)
  const mountedRef = useRef(true)
  const showRef = useRef(show)
  const beforeCloseRef = useRef(beforeClose)
  const onShowChangeRef = useRef(onShowChange)
  const onConfirmRef = useRef(onConfirm)
  const onCancelRef = useRef(onCancel)

  showRef.current = show
  beforeCloseRef.current = beforeClose
  onShowChangeRef.current = onShowChange
  onConfirmRef.current = onConfirm
  onCancelRef.current = onCancel

  useEffect(
    () => () => {
      mountedRef.current = false
    },
    [],
  )

  useEffect(() => {
    if (!show) setClosingAction(null)
  }, [show])

  const body = children !== undefined ? children : message
  const { titleVisible, bodyVisible, titleOnly, messageOnly, titleWithMessage } =
    getDialogLayoutState(title, body)

  const dialogProps: DialogProps = {
    ...props,
    show,
    title,
    message,
    children,
    footer,
    width,
    theme,
    messageAlign,
    showConfirmButton,
    showCancelButton,
    cancelButtonText,
    cancelButtonColor,
    cancelButtonDisabled,
    confirmButtonText,
    confirmButtonColor,
    confirmButtonDisabled,
    overlay,
    overlayStyle,
    closeOnClickOverlay,
    zIndex,
    beforeClose,
    style,
    styles,
    onShowChange,
    onConfirm,
    onCancel,
    onOpened,
    onClose,
  }
  const state: DialogStyleState = {
    show,
    theme,
    titleVisible,
    bodyVisible,
    titleOnly,
    messageOnly,
    titleWithMessage,
    closingAction,
    confirmLoading: closingAction === 'confirm',
    cancelLoading: closingAction === 'cancel',
  }
  const semantic = resolveStyles(styles, { props: dialogProps, state })
  const resolved = getDialogStyles(
    token,
    dialogProps,
    state,
    Math.max(1, height) * token.messageMaxHeightRatio,
  )

  const requestClose = useCallback(
    (action: DialogAction) => {
      if (!showRef.current || closingAction !== null) return

      const interceptor = beforeCloseRef.current
      if (action === 'confirm') onConfirmRef.current?.()
      else onCancelRef.current?.()

      if (!interceptor) {
        onShowChangeRef.current?.(false)
        return
      }

      setClosingAction(action)
      let result: boolean | void | Promise<boolean | void>
      try {
        result = interceptor(action)
      } catch {
        if (mountedRef.current) setClosingAction(null)
        return
      }

      Promise.resolve(result).then(
        (allowed) => {
          if (!mountedRef.current) return
          setClosingAction(null)
          if (allowed !== false && showRef.current) onShowChangeRef.current?.(false)
        },
        () => {
          if (mountedRef.current) setClosingAction(null)
        },
      )
    },
    [closingAction],
  )

  const handleOverlayClose = useCallback(() => {
    if (showRef.current && closingAction === null) onShowChangeRef.current?.(false)
  }, [closingAction])

  const bodyNode = isTextContent(body) ? (
    <Text style={[resolved.message, semantic?.message]}>{body}</Text>
  ) : (
    body
  )

  const renderButton = (action: DialogAction) => {
    const confirm = action === 'confirm'
    const loading = closingAction === action
    const disabled =
      loading || closingAction !== null || (confirm ? confirmButtonDisabled : cancelButtonDisabled)
    const text = confirm ? confirmButtonText : cancelButtonText
    const isRound = theme === 'round-button'
    const textColor = confirm
      ? (confirmButtonColor ?? (isRound ? undefined : token.confirmButtonColor))
      : (cancelButtonColor ?? (isRound ? undefined : token.cancelButtonColor))
    const buttonStyles = isRound
      ? textColor === undefined
        ? undefined
        : { label: { color: textColor } }
      : {
          root: { opacity: disabled ? token.buttonDisabledOpacity : 1 },
          label: { color: textColor, fontSize: token.buttonFontSize },
        }

    return (
      <Button
        key={action}
        testID={`dialog-${action}-button`}
        variant={isRound ? 'solid' : 'text'}
        type={isRound ? (confirm ? 'primary' : 'default') : 'default'}
        pressFeedback={isRound ? undefined : 'overlay'}
        pressedOverlayColor={isRound ? undefined : token.buttonPressedOverlayColor}
        round={isRound}
        square={!isRound}
        loading={loading}
        disabled={disabled}
        accessibilityLabel={isTextContent(text) ? String(text) : undefined}
        styles={buttonStyles}
        style={[
          confirm ? resolved.confirm : resolved.cancel,
          confirm ? semantic?.confirm : semantic?.cancel,
          confirm && showCancelButton && showConfirmButton && theme === 'default'
            ? { borderLeftWidth: token.dividerWidth, borderLeftColor: token.dividerColor }
            : null,
        ]}
        onPress={() => requestClose(action)}
      >
        {text}
      </Button>
    )
  }

  const defaultFooter =
    showCancelButton || showConfirmButton ? (
      <View style={[resolved.footer, semantic?.footer]}>
        {showCancelButton ? renderButton('cancel') : null}
        {showConfirmButton ? renderButton('confirm') : null}
      </View>
    ) : null

  return (
    <PopupContent
      visible={show}
      overlay={overlay}
      closeOnPressOverlay={closeOnClickOverlay}
      onRequestClose={closeOnClickOverlay ? handleOverlayClose : undefined}
      destroyOnClosed
      duration={themeToken.motion ? token.animationDuration : 0}
      zIndex={zIndex}
      overlayStyle={[{ backgroundColor: token.overlayColor }, overlayStyle]}
      style={[resolved.popupPanel, { backgroundColor: 'transparent' }]}
      styles={{ root: semantic?.host, overlay: semantic?.overlay }}
      onOpened={onOpened}
      onClosed={onClose}
    >
      <View
        ref={ref}
        {...viewProps}
        accessible
        accessibilityRole="alert"
        accessibilityViewIsModal
        style={[resolved.panel, semantic?.root, style]}
      >
        {titleOnly || titleWithMessage ? (
          <View testID="dialog-header" style={resolved.header}>
            {isTextContent(title) ? (
              <Text style={[resolved.title, semantic?.header]}>{title}</Text>
            ) : (
              title
            )}
          </View>
        ) : null}
        {messageOnly || titleWithMessage ? (
          <ScrollView
            testID="dialog-content"
            style={[resolved.content, semantic?.content]}
            showsVerticalScrollIndicator={false}
            accessibilityRole="none"
          >
            {bodyNode}
          </ScrollView>
        ) : null}
        {footer !== undefined ? (
          <View style={[resolved.footer, semantic?.footer]}>{footer}</View>
        ) : (
          defaultFooter
        )}
      </View>
    </PopupContent>
  )
})

DialogContent.displayName = 'Dialog.Content'

export const Dialog = forwardRef<View, DialogProps>(function Dialog(props, ref) {
  return (
    <Portal>
      <DialogContent {...props} ref={ref} />
    </Portal>
  )
})

Dialog.displayName = 'Dialog'
