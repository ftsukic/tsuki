import { createElement, forwardRef } from 'react'
import type { ReactNode, RefAttributes } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native'
import type {
  PressableProps,
  ScrollViewProps,
  StyleProp,
  View as NativeView,
  ViewProps,
  ViewStyle,
} from 'react-native'
import { semanticClassName } from '../style/semantic'
import { Text } from '../text'
import { useTsukiTheme } from '../theme/theme'
import { DialogActions } from './dialog-actions'
import type { DialogAction, DialogProps } from './types'

export interface DialogContentProps extends DialogProps {
  visible: boolean
  pendingAction: DialogAction | null
  busy: boolean
  onConfirmPress: () => void
  onCancelPress: () => void
}

function hasContent(content: ReactNode): boolean {
  if (content === null || content === undefined || typeof content === 'boolean') return false
  if (typeof content === 'string') return content.length > 0
  return true
}

function isTextContent(content: ReactNode): content is string | number {
  return typeof content === 'string' || typeof content === 'number'
}

export const DialogContent = forwardRef<NativeView, DialogContentProps>(
  function DialogContent(props, ref) {
    const {
      visible: _visible,
      defaultVisible: _defaultVisible,
      onVisibleChange: _onVisibleChange,
      afterOpen: _afterOpen,
      afterClose: _afterClose,
      closeOnBack: _closeOnBack,
      initialFocusRef: _initialFocusRef,
      returnFocusRef: _returnFocusRef,
      beforeClose: _beforeClose,
      onConfirm: _onConfirm,
      onCancel: _onCancel,
      overlay: _overlay,
      closeOnPressOverlay: _closeOnPressOverlay,
      keyboardAvoiding = true,
      pendingAction,
      busy,
      onConfirmPress,
      onCancelPress,
      title,
      message,
      children,
      footer,
      width,
      theme = 'default',
      showConfirmButton = true,
      showCancelButton = false,
      confirmButtonText = '确认',
      cancelButtonText = '取消',
      confirmButtonDisabled = false,
      cancelButtonDisabled = false,
      className,
      classNames,
      style,
      styles,
      testID,
      ...panelProps
    } = props
    const resolvedTheme = useTsukiTheme()
    const { height } = useWindowDimensions()
    const titleVisible = hasContent(title)
    const body = children !== undefined ? children : message
    const bodyVisible = hasContent(body)
    const contentPadding = resolvedTheme.components.Dialog.contentPadding
    const maxContainerHeight = Math.max(1, height) * 0.9
    const maxBodyHeight = Math.max(1, height) * 0.6

    const titleNode = isTextContent(title) ? (
      <Text
        className={semanticClassName(
          classNames,
          'title',
          'text-center text-tsuki-dialog-title font-semibold text-tsuki-foreground',
        )}
        style={styles?.title}
      >
        {title}
      </Text>
    ) : (
      title
    )
    const bodyNode = isTextContent(body) ? (
      <Text
        className={semanticClassName(classNames, 'message', [
          'text-center text-tsuki-dialog-message leading-6',
          titleVisible ? 'text-tsuki-muted' : 'text-tsuki-foreground',
        ])}
        style={styles?.message}
      >
        {body}
      </Text>
    ) : (
      body
    )

    const header = titleVisible
      ? createElement(
          View,
          {
            className: semanticClassName(classNames, 'header', [
              'px-tsuki-dialog-content pt-tsuki-dialog-content',
              bodyVisible ? 'pb-1' : 'pb-tsuki-dialog-content',
            ]),
            style: styles?.header,
            testID: 'dialog-header',
          } as ViewProps,
          titleNode,
        )
      : null

    const bodyView = bodyVisible
      ? createElement(
          ScrollView,
          {
            className: semanticClassName(classNames, 'body', 'shrink'),
            contentContainerStyle: {
              paddingHorizontal: contentPadding,
              paddingTop: titleVisible ? 0 : contentPadding,
              paddingBottom: contentPadding,
            },
            keyboardShouldPersistTaps: 'handled',
            showsVerticalScrollIndicator: false,
            style: [{ maxHeight: maxBodyHeight }, styles?.body],
            testID: 'dialog-body',
          } as ScrollViewProps,
          bodyNode,
        )
      : null

    const footerView =
      footer !== undefined ? (
        hasContent(footer) ? (
          createElement(
            View,
            {
              className: semanticClassName(classNames, 'footer', 'flex-row'),
              style: styles?.footer,
              testID: 'dialog-footer',
            } as ViewProps,
            footer,
          )
        ) : null
      ) : (
        <DialogActions
          busy={busy}
          cancelButtonDisabled={cancelButtonDisabled}
          cancelButtonText={cancelButtonText}
          classNames={classNames}
          confirmButtonDisabled={confirmButtonDisabled}
          confirmButtonText={confirmButtonText}
          onCancel={onCancelPress}
          onConfirm={onConfirmPress}
          pendingAction={pendingAction}
          showCancelButton={showCancelButton}
          showConfirmButton={showConfirmButton}
          styles={styles}
          theme={theme}
        />
      )

    const container = createElement(
      View,
      {
        ...panelProps,
        accessibilityRole: panelProps.accessibilityRole ?? 'alert',
        className: semanticClassName(
          classNames,
          'container',
          'w-tsuki-dialog max-w-[90%] overflow-hidden rounded-tsuki-dialog bg-tsuki-dialog-background',
          className,
        ),
        ref,
        style: [
          { maxHeight: maxContainerHeight },
          width !== undefined ? { width } : undefined,
          styles?.container,
          style,
        ],
        testID: testID ?? 'dialog-container',
      } as ViewProps & RefAttributes<NativeView>,
      header,
      bodyView,
      footerView,
    )

    const root = createElement(
      View,
      {
        className: semanticClassName(classNames, 'root', 'flex-1 items-center justify-center'),
        pointerEvents: 'box-none',
        style: styles?.root,
        testID: 'tsuki-dialog-root',
      } as ViewProps,
      container,
    )

    if (!keyboardAvoiding) return root

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={keyboardAvoiding}
        pointerEvents="box-none"
        style={{ flex: 1 }}
      >
        {root}
      </KeyboardAvoidingView>
    )
  },
)

export function DialogMask({
  closeOnPress,
  closeOnClick,
  classNames,
  style,
}: {
  closeOnPress: () => void
  closeOnClick: boolean
  classNames?: DialogProps['classNames']
  style?: StyleProp<ViewStyle>
}) {
  return createElement(Pressable, {
    accessible: false,
    accessibilityElementsHidden: true,
    className: semanticClassName(classNames, 'mask', 'absolute inset-0 bg-tsuki-dialog-overlay'),
    importantForAccessibility: 'no-hide-descendants',
    onPress: closeOnClick ? closeOnPress : undefined,
    pointerEvents: 'auto',
    style,
    testID: 'dialog-mask',
  } as PressableProps)
}
