import { forwardRef, useCallback, useContext, useEffect, useRef } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import type { ReactNode } from 'react'
import type { StyleProp, TextStyle } from 'react-native'
import { Pressable } from '../pressable'
import { Loading } from '../loading'
import { PopupContent } from '../popup/popup'
import { TeleportPortal as Portal } from '../portal/teleport-portal'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import type { ActionSheetAction, ActionSheetProps } from './types'
import { getActionSheetStyles } from './style'
import { getActionSheetToken } from './token'

type CloseReason = 'action' | 'cancel' | 'overlay'

interface ActionSheetContentProps extends ActionSheetProps {
  onAction?: (action: ActionSheetAction) => void
  onCancelAction?: () => void
  onRequestClose?: (reason: CloseReason) => void
}

function isRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function isTextContent(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}

export const ActionSheetContent = forwardRef<View, ActionSheetContentProps>(
  function ActionSheetContent(props, ref) {
    const token = useComponentToken('ActionSheet', getActionSheetToken)
    const safeAreaInsets = useContext(SafeAreaInsetsContext)
    const { height: windowHeight } = useWindowDimensions()
    const {
      visible = false,
      title,
      actions = [],
      cancelText = '取消',
      closeOnAction = true,
      closeOnPressOverlay = true,
      overlay = true,
      safeAreaInsetBottom = true,
      zIndex = token.zIndex,
      style,
      styles,
      onClose,
      onPressOverlay,
      onOpened,
      onClosed,
      onSelect,
      onAction,
      onCancelAction,
      onRequestClose,
      ...viewProps
    } = props
    const visibleRef = useRef(visible)
    const onCloseRef = useRef(onClose)
    const onRequestCloseRef = useRef(onRequestClose)
    const closeRequestedRef = useRef(false)

    visibleRef.current = visible
    onCloseRef.current = onClose
    onRequestCloseRef.current = onRequestClose

    useEffect(() => {
      if (!visible) closeRequestedRef.current = false
    }, [visible])

    const requestClose = useCallback((reason: CloseReason) => {
      if (!visibleRef.current || closeRequestedRef.current) return

      closeRequestedRef.current = true
      try {
        onCloseRef.current?.()
      } finally {
        onRequestCloseRef.current?.(reason)
      }
    }, [])

    const semantic = resolveStyles(styles, {
      props,
      state: { visible },
    })
    const resolved = getActionSheetStyles(token)
    const hasTitle = isRenderable(title)
    const hasCancel = isRenderable(cancelText)
    const bottomInset = safeAreaInsetBottom ? Math.max(0, safeAreaInsets?.bottom ?? 0) : 0
    const maxHeight = Math.max(0, windowHeight - (safeAreaInsets?.top ?? 0))
    const { backgroundColor: cancelBackgroundColor, ...cancelContentStyle } =
      StyleSheet.flatten(semantic?.cancel) ?? {}

    const renderContent = (value: ReactNode, textStyle: StyleProp<TextStyle>) =>
      isTextContent(value) ? <Text style={textStyle}>{value}</Text> : value

    const renderAction = (action: ActionSheetAction, index: number) => {
      const disabled = action.disabled === true || action.loading === true
      const actionColor = action.color ?? token.actionColor
      const nameStyle = [
        resolved.name,
        { color: disabled ? token.disabledColor : actionColor },
        semantic?.label,
      ]
      const subnameStyle = [
        resolved.subname,
        { color: disabled ? token.disabledColor : token.descriptionColor },
        semantic?.description,
      ]

      return (
        <Pressable
          key={index}
          accessibilityRole="button"
          accessibilityState={{ busy: action.loading === true, disabled }}
          disabled={disabled}
          pressStyle="background"
          pressedBackgroundColor={token.actionPressedBackgroundColor}
          onPress={() => {
            try {
              action.callback?.(action)
            } finally {
              try {
                onSelect?.(action, index)
              } finally {
                try {
                  onAction?.(action)
                } finally {
                  if (closeOnAction) requestClose('action')
                }
              }
            }
          }}
          style={[
            resolved.action,
            semantic?.item,
            index > 0 && { borderTopColor: token.dividerColor, borderTopWidth: 1 },
            disabled && { opacity: 0.45 },
          ]}
          testID={`action-sheet-action-${index}`}
        >
          <View style={resolved.actionContent}>
            <View style={{ alignItems: 'center', flexDirection: 'row', maxWidth: '100%' }}>
              {action.loading ? (
                <Loading
                  color={token.loadingColor}
                  size={token.actionFontSize}
                  style={{ marginRight: token.descriptionMarginTop }}
                />
              ) : null}
              {renderContent(action.name, nameStyle)}
            </View>
            {isRenderable(action.subname) ? renderContent(action.subname, subnameStyle) : null}
          </View>
        </Pressable>
      )
    }

    return (
      <PopupContent
        visible={visible}
        position="bottom"
        overlay={overlay}
        closeOnPressOverlay={closeOnPressOverlay}
        safeAreaInsetBottom={false}
        onPressOverlay={onPressOverlay}
        onRequestClose={() => requestClose('overlay')}
        destroyOnClosed
        duration={token.animationDuration}
        zIndex={zIndex}
        style={style}
        styles={{
          root: semantic?.root,
          mask: semantic?.mask,
          wrapper: semantic?.wrapper,
          container: [resolved.popupPanel, { maxHeight }],
        }}
        onOpened={onOpened}
        onClosed={onClosed}
      >
        <View
          ref={ref}
          {...viewProps}
          accessibilityViewIsModal
          style={[resolved.root, { maxHeight }, semantic?.container]}
        >
          <View testID="action-sheet-actions" style={[resolved.actions, semantic?.body]}>
            {hasTitle ? (
              <View
                accessibilityRole="header"
                style={[resolved.header, semantic?.header]}
                testID="action-sheet-title"
              >
                {renderContent(title, [resolved.title, semantic?.title])}
              </View>
            ) : null}
            <ScrollView style={resolved.list} bounces={false} testID="action-sheet-list">
              {actions.map(renderAction)}
            </ScrollView>
          </View>
          {hasCancel ? (
            <>
              <View style={[resolved.cancelGap]} testID="action-sheet-cancel-gap" />
              <View
                style={[resolved.cancelPanel, semantic?.footer]}
                testID="action-sheet-cancel-panel"
              >
                <Pressable
                  accessibilityRole="button"
                  pressStyle="background"
                  pressedBackgroundColor={token.cancelPressedBackgroundColor}
                  onPress={() => {
                    try {
                      onCancelAction?.()
                    } finally {
                      requestClose('cancel')
                    }
                  }}
                  style={[resolved.cancelPressable, { backgroundColor: cancelBackgroundColor }]}
                  testID="action-sheet-cancel-button"
                >
                  <>
                    <View
                      style={[resolved.cancel, cancelContentStyle]}
                      testID="action-sheet-cancel-content"
                    >
                      {renderContent(cancelText, [resolved.cancelLabel, semantic?.cancelLabel])}
                    </View>
                    <View
                      style={{
                        height: bottomInset,
                      }}
                      testID="action-sheet-safe-area"
                    />
                  </>
                </Pressable>
              </View>
            </>
          ) : null}
          {!hasCancel ? (
            <View
              style={{ backgroundColor: token.backgroundColor, height: bottomInset }}
              testID="action-sheet-safe-area"
            />
          ) : null}
        </View>
      </PopupContent>
    )
  },
)

ActionSheetContent.displayName = 'ActionSheet.Content'

export const ActionSheet = forwardRef<View, ActionSheetProps>(function ActionSheet(props, ref) {
  return (
    <Portal hostName="root">
      <ActionSheetContent {...props} ref={ref} />
    </Portal>
  )
})

ActionSheet.displayName = 'ActionSheet'
