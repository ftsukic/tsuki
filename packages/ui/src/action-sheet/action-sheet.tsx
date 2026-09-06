import { Button } from '../button'
import { Divider } from '../divider'
import { attachPropertiesToComponent } from '../helpers'
import { Popup, PopupHeader } from '../popup'
import { mountPortal, unmountPortal } from '../portal'
import { useToken } from '../theme'
import type { ActionSheetProps } from './interface'
import isNil from 'lodash/isNil'
import { Fragment, isValidElement, memo, useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function ActionSheetView({
  theme,
  actions,
  title,
  cancelText,
  cancelTextStyle,
  description,
  descriptionStyle,
  round = true,
  onCancel,
  onSelect,
  ...props
}: ActionSheetProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.ActionSheet, ...theme }
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const descriptionNode = !isNil(description) ? (
    isValidElement(description) ? (
      description
    ) : (
      <>
        <Text
          numberOfLines={1}
          style={[
            {
              textAlign: 'center',
              color: token.descriptionColor,
              fontSize: token.descriptionFontSize,
              lineHeight: token.descriptionLineHeight,
              paddingVertical: token.descriptionPaddingVertical,
            },
            descriptionStyle,
          ]}
        >
          {description}
        </Text>
        <Divider />
      </>
    )
  ) : null
  return (
    <Popup {...props} position="bottom" round={round} safeAreaInsetBottom>
      <View style={{ maxHeight: height - insets.top - insets.bottom }}>
        {title ? <PopupHeader title={title} showClose={false} /> : null}
        {descriptionNode}
        <ScrollView bounces={false}>
          {actions.map((item, index) => (
            <Fragment key={`${item.name}_${index}`}>
              <Button
                accessibilityLabel={item.name}
                text={item.name}
                disabled={item.disabled}
                loading={item.loading}
                type="text"
                textColor={
                  item.color ??
                  (item.disabled || item.loading
                    ? token.actionDisabledTextColor
                    : token.actionTextColor)
                }
                size="large"
                square
                theme={{ activeOpacity: token.pressedOpacity }}
                padding={{
                  horizontal: token.actionPaddingHorizontal,
                  vertical: token.actionPaddingVertical,
                }}
                style={({ pressed }) => ({
                  minHeight: token.actionMinHeight,
                  backgroundColor: pressed
                    ? token.actionPressedBackgroundColor
                    : token.actionBackgroundColor,
                })}
                textStyle={[{ fontSize: token.actionFontSize }, item.textStyle]}
                onPress={() => {
                  if (!item.disabled && !item.loading) {
                    item.callback?.()
                    onSelect?.(item, index)
                  }
                }}
              />
              {index < actions.length - 1 ? (
                <View
                  style={{
                    height: themeToken.lineWidth,
                    backgroundColor: token.actionDividerColor,
                  }}
                />
              ) : null}
            </Fragment>
          ))}
        </ScrollView>
        {cancelText ? (
          <>
            <View
              style={{ height: token.cancelGapHeight, backgroundColor: token.cancelGapColor }}
            />
            <Button
              accessibilityLabel={cancelText}
              text={cancelText}
              type="text"
              size="large"
              textColor={token.cancelTextColor}
              square
              theme={{ activeOpacity: token.pressedOpacity }}
              padding={{
                horizontal: token.cancelPaddingHorizontal,
                vertical: token.cancelPaddingVertical,
              }}
              style={({ pressed }) => ({
                minHeight: token.cancelMinHeight,
                backgroundColor: pressed
                  ? token.cancelPressedBackgroundColor
                  : token.cancelBackgroundColor,
              })}
              textStyle={[{ fontSize: token.cancelFontSize }, cancelTextStyle]}
              onPress={onCancel}
            />
          </>
        ) : null}
      </View>
    </Popup>
  )
}

export interface ActionSheetResult {
  action: 'select' | 'cancel' | 'overlay'
  index?: number
}

export type ActionSheetShowOptions = Omit<
  ActionSheetProps,
  'visible' | 'onSelect' | 'onCancel' | 'onPressOverlay' | 'onClosed'
>

interface ActionSheetMethodProps {
  options: ActionSheetShowOptions
  onResult: (result: ActionSheetResult) => void
  onClosed: () => void
  onReady: (close: (() => void) | null) => void
}

function ActionSheetMethod({ options, onResult, onClosed, onReady }: ActionSheetMethodProps) {
  const [visible, setVisible] = useState(false)
  const finished = useRef(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const finish = useCallback(
    (result: ActionSheetResult) => {
      if (finished.current) return
      finished.current = true
      onResult(result)
      setVisible(false)
    },
    [onResult],
  )

  useEffect(() => {
    onReady(() => finish({ action: 'cancel' }))
    return () => onReady(null)
  }, [finish, onReady])

  return (
    <ActionSheetView
      {...options}
      visible={visible}
      onSelect={(_, index) => finish({ action: 'select', index })}
      onCancel={() => finish({ action: 'cancel' })}
      onPressOverlay={() => finish({ action: 'overlay' })}
      onRequestClose={() => {
        if (options.onRequestClose?.()) return true
        finish({ action: 'overlay' })
        return true
      }}
      onClosed={onClosed}
    />
  )
}

let currentKey: number | null = null
let currentClose: (() => void) | null = null

function hideActionSheet() {
  if (currentKey !== null) {
    if (currentClose) currentClose()
    else {
      unmountPortal(currentKey)
      currentKey = null
    }
  }
}

function destroyActionSheet() {
  if (currentKey !== null) unmountPortal(currentKey)
  currentKey = null
  currentClose = null
}

function showActionSheet(options: ActionSheetShowOptions) {
  destroyActionSheet()
  return new Promise<ActionSheetResult>((resolve) => {
    let key: number | null = null
    currentKey = mountPortal(
      <ActionSheetMethod
        options={options}
        onResult={resolve}
        onReady={(close) => {
          if (key !== null && currentKey === key) currentClose = close
        }}
        onClosed={() => {
          if (key !== null) {
            unmountPortal(key)
            if (currentKey === key) {
              currentKey = null
              currentClose = null
            }
          }
        }}
      />,
    )
    key = currentKey
  })
}

export const ActionSheet = attachPropertiesToComponent(memo(ActionSheetView), {
  show: showActionSheet,
  hide: hideActionSheet,
})

export default ActionSheet
