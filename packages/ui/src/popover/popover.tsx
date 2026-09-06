/* eslint-disable @typescript-eslint/no-explicit-any */
import { useToken } from '../theme'
import type { PopoverItemProps, PopoverProps, PopoverTextProps } from './interface'
import { Children, cloneElement, isValidElement, memo, useCallback, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import NativePopover, { PopoverPlacement } from 'react-native-popover-view'

export function PopoverItem<T>({
  value,
  children,
  disabled = false,
  dark = false,
  divider = false,
  style,
  onSelect,
  theme,
}: PopoverItemProps<T> & { children?: React.ReactNode }) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Popover, ...theme }
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={disabled}
      onPress={() => onSelect?.(value)}
      style={[
        {
          marginHorizontal: token.itemPaddingHorizontal,
          paddingVertical: token.itemPaddingVertical,
          borderBottomWidth: divider ? themeToken.lineWidth : 0,
          borderBottomColor: dark ? token.darkDividerColor : token.dividerColor,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: dark ? token.darkTextColor : token.textColor,
          fontSize: token.textFontSize,
          opacity: disabled ? token.disabledOpacity : 1,
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
}

export function PopoverText({
  text,
  dark = false,
  divider = false,
  disabled = false,
  style,
  theme,
  ...props
}: PopoverTextProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Popover, ...theme }
  return (
    <Text
      {...props}
      style={[
        {
          marginHorizontal: token.itemPaddingHorizontal,
          paddingVertical: token.itemPaddingVertical,
          color: dark ? token.darkTextColor : token.textColor,
          fontSize: token.textFontSize,
          opacity: disabled ? token.disabledOpacity : 1,
          borderBottomWidth: divider ? themeToken.lineWidth : 0,
          borderBottomColor: dark ? token.darkDividerColor : token.dividerColor,
        },
        style,
      ]}
    >
      {text}
    </Text>
  )
}

function PopoverComponent<T>({
  children,
  theme,
  content,
  dark = false,
  showBackground = true,
  direction = 'vertical',
  shadow = false,
  arrow = true,
  triggerStyle,
  popoverStyle,
  backgroundStyle,
  placement = PopoverPlacement.AUTO,
  onSelect,
  disabled,
  renderContentComponent,
  renderTrigger,
  onRequestClose,
  duration,
}: PopoverProps<T>) {
  const { components } = useToken()
  const token = { ...components.Popover, ...theme }
  const [visible, setVisible] = useState(false)
  const close = useCallback(() => {
    setVisible(false)
    onRequestClose?.()
  }, [onRequestClose])
  const open = useCallback(() => {
    if (!disabled) setVisible(true)
  }, [disabled])
  const onSelectValue = useCallback(
    (value: T, index?: number) => {
      onSelect?.(value, index)
      close()
    },
    [close, onSelect],
  )
  const items = Children.map(content, (child, index) =>
    isValidElement(child)
      ? cloneElement(child as React.ReactElement<PopoverItemProps<T>>, {
          onSelect: (value: T) => onSelectValue(value, index),
          dark,
        })
      : child,
  )
  const renderedContent = renderContentComponent ? (
    renderContentComponent(items, close)
  ) : direction === 'horizontal' ? (
    <View style={{ flexDirection: 'row' }}>{items}</View>
  ) : (
    <ScrollView>{items}</ScrollView>
  )
  const nativePopoverStyle = [
    { backgroundColor: dark ? token.darkBackgroundColor : token.backgroundColor },
    popoverStyle,
    shadow
      ? {
          elevation: token.elevation,
          shadowColor: token.shadowColor,
          shadowOpacity: token.shadowOpacity,
          shadowRadius: token.shadowRadius,
        }
      : null,
  ]

  return (
    <NativePopover
      animationConfig={duration == null ? undefined : { duration }}
      arrowSize={arrow ? undefined : { height: 0, width: 0 }}
      backgroundStyle={
        (showBackground ? backgroundStyle : { backgroundColor: 'transparent' }) as any
      }
      from={(sourceRef) =>
        renderTrigger ? (
          renderTrigger(sourceRef as React.Ref<View>, open)
        ) : (
          <TouchableOpacity
            ref={sourceRef as React.Ref<View>}
            disabled={disabled}
            onPress={open}
            onLongPress={open}
            style={triggerStyle}
          >
            {children}
          </TouchableOpacity>
        )
      }
      isVisible={visible}
      onRequestClose={close}
      placement={placement}
      popoverStyle={nativePopoverStyle as any}
    >
      {renderedContent}
    </NativePopover>
  )
}

export const Popover = memo(PopoverComponent) as typeof PopoverComponent
