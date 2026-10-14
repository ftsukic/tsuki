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

interface DialogContentProps extends DialogProps {
  requestIdentity?: object
}

export const DialogContent = forwardRef<View, DialogContentProps>(
  function DialogContent(props, ref) {
    const { requestIdentity, ...publicProps } = props
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
      confirmButtonProps,
      cancelButtonProps,
      overlay = true,
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
    } = publicProps
    const { height } = useWindowDimensions()
    const [closingAction, setClosingAction] = useState<DialogAction | null>(null)
    const requestVersion = useRef(0)
    const previousSession = useRef({ show, requestIdentity })
    if (
      previousSession.current.show !== show ||
      previousSession.current.requestIdentity !== requestIdentity
    ) {
      requestVersion.current += 1
      previousSession.current = { show, requestIdentity }
    }
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

    useEffect(() => {
      mountedRef.current = true
      return () => {
        mountedRef.current = false
        requestVersion.current += 1
      }
    }, [])

    useEffect(() => {
      setClosingAction(null)
    }, [show, requestIdentity])

    const body = children !== undefined ? children : message
    const { titleVisible, bodyVisible, titleOnly, messageOnly, titleWithMessage } =
      getDialogLayoutState(title, body)

    const dialogProps: DialogProps = {
      ...publicProps,
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
      confirmButtonProps,
      cancelButtonProps,
      overlay,
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

        const version = ++requestVersion.current
        const isCurrent = () => mountedRef.current && requestVersion.current === version
        const interceptor = beforeCloseRef.current
        if (action === 'confirm') onConfirmRef.current?.()
        else onCancelRef.current?.()
        if (!isCurrent()) return

        if (!interceptor) {
          onShowChangeRef.current?.(false)
          return
        }

        setClosingAction(action)
        let result: boolean | void | Promise<boolean | void>
        try {
          result = interceptor(action)
        } catch {
          if (isCurrent()) setClosingAction(null)
          return
        }

        Promise.resolve(result).then(
          (allowed) => {
            if (!isCurrent()) return
            setClosingAction(null)
            if (allowed !== false && showRef.current) onShowChangeRef.current?.(false)
          },
          () => {
            if (isCurrent()) setClosingAction(null)
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
        loading ||
        closingAction !== null ||
        (confirm ? confirmButtonDisabled : cancelButtonDisabled)
      const text = confirm ? confirmButtonText : cancelButtonText
      const isRound = theme === 'round-button'
      const textColor = confirm
        ? (confirmButtonColor ?? (isRound ? undefined : token.confirmButtonColor))
        : (cancelButtonColor ?? (isRound ? undefined : token.cancelButtonColor))
      const actionProps = confirm ? confirmButtonProps : cancelButtonProps
      const buttonStyles = isRound
        ? {
            content: {
              lineHeight: themeToken.lineHeight,
              ...(textColor === undefined ? {} : { color: textColor }),
            },
          }
        : {
            root: { opacity: disabled ? token.buttonDisabledOpacity : 1 },
            content: { color: textColor, fontSize: token.buttonFontSize },
          }

      return (
        <Button
          key={action}
          testID={`dialog-${action}-button`}
          variant={isRound ? 'solid' : 'text'}
          type={isRound ? (confirm ? 'primary' : 'default') : 'default'}
          pressFeedback={isRound ? undefined : 'overlay'}
          pressedOverlayColor={isRound ? undefined : token.buttonPressedOverlayColor}
          shape={isRound ? 'round' : 'square'}
          loading={loading}
          disabled={disabled}
          accessibilityLabel={isTextContent(text) ? String(text) : undefined}
          styles={(info) => {
            const custom = resolveStyles(actionProps?.styles, info)
            return {
              ...custom,
              root: [
                buttonStyles?.root,
                confirm ? semantic?.confirmButton : semantic?.cancelButton,
                custom?.root,
              ],
              content: [buttonStyles?.content, custom?.content],
            }
          }}
          style={[
            confirm ? resolved.confirm : resolved.cancel,
            confirm && showCancelButton && showConfirmButton && theme === 'default'
              ? { borderLeftWidth: token.dividerWidth, borderLeftColor: token.dividerColor }
              : null,
            actionProps?.style,
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
        style={style}
        styles={{
          root: semantic?.root,
          mask: [{ backgroundColor: token.overlayColor }, semantic?.mask],
          wrapper: semantic?.wrapper,
          container: [resolved.popupPanel, { backgroundColor: 'transparent' }],
        }}
        onOpened={onOpened}
        onClosed={onClose}
      >
        <View
          ref={ref}
          {...viewProps}
          accessible
          accessibilityRole="alert"
          accessibilityViewIsModal
          style={[resolved.panel, semantic?.container]}
        >
          {titleOnly || titleWithMessage ? (
            <View testID="dialog-header" style={[resolved.header, semantic?.header]}>
              {isTextContent(title) ? (
                <Text style={[resolved.title, semantic?.title]}>{title}</Text>
              ) : (
                title
              )}
            </View>
          ) : null}
          {messageOnly || titleWithMessage ? (
            <ScrollView
              testID="dialog-content"
              style={[resolved.content, semantic?.body]}
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
  },
)

DialogContent.displayName = 'Dialog.Content'

export const Dialog = forwardRef<View, DialogProps>(function Dialog(props, ref) {
  return (
    <Portal>
      <DialogContent {...props} ref={ref} />
    </Portal>
  )
})

Dialog.displayName = 'Dialog'
