import { attachPropertiesToComponent } from '../helpers'
import { Popup } from '../popup'
import { mountPortal, unmountPortal } from '../portal'
import { useToken } from '../theme'
import type { NotifyMethods, NotifyProps } from './interface'
import isNil from 'lodash/isNil'
import { forwardRef, isValidElement, memo, useEffect, useImperativeHandle, useState } from 'react'
import { Text, TouchableWithoutFeedback, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const NotifyView = forwardRef<NotifyMethods, NotifyProps>(
  (
    {
      children,
      theme,
      style,
      textStyle,
      type = 'primary',
      message,
      color,
      backgroundColor,
      visible: visibleProp = true,
      duration = 0,
      onClosed,
      ...props
    },
    ref,
  ) => {
    const { components } = useToken()
    const token = { ...components.Notify, ...theme }
    const insets = useSafeAreaInsets()
    const [visible, setVisible] = useState(visibleProp)
    const [text, setText] = useState(message)
    useEffect(() => setVisible(visibleProp), [visibleProp])
    useEffect(() => {
      if (!duration) return
      const timer = setTimeout(() => setVisible(false), duration)
      return () => clearTimeout(timer)
    }, [duration])
    useImperativeHandle(ref, () => ({ close: () => setVisible(false), setMessage: setText }), [])
    const background = token[`${type}BackgroundColor` as 'primaryBackgroundColor']
    const content = !isNil(text) ? (
      isValidElement(text) ? (
        text
      ) : (
        <Text
          numberOfLines={1}
          style={[
            {
              color: color ?? token.textColor,
              fontSize: token.fontSize,
              lineHeight: token.lineHeight,
            },
            textStyle,
          ]}
        >
          {text}
        </Text>
      )
    ) : (
      children
    )
    return (
      <Popup visible={visible} overlay={false} position="top" onClosed={onClosed}>
        <TouchableWithoutFeedback {...props}>
          <View
            style={[
              {
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: token.paddingHorizontal,
                paddingTop: Math.max(insets.top, token.paddingVertical),
                paddingBottom: token.paddingVertical,
                backgroundColor: backgroundColor ?? background,
              },
              style,
            ]}
          >
            {content}
          </View>
        </TouchableWithoutFeedback>
      </Popup>
    )
  },
)

NotifyView.displayName = 'Notify'

let notifyKey: number | null = null
let notifyClose: (() => void) | null = null
function showNotify(options: NotifyProps | string): NotifyMethods {
  if (notifyKey !== null) unmountPortal(notifyKey)
  notifyKey = null
  notifyClose = null
  const normalized = typeof options === 'string' ? { message: options } : options
  const ref = { current: null as NotifyMethods | null }
  const close = () => ref.current?.close()
  notifyClose = close
  let key: number | null = null
  notifyKey = mountPortal(
    <NotifyView
      ref={ref}
      {...normalized}
      onClosed={() => {
        normalized.onClosed?.()
        if (notifyKey === key && key !== null) {
          unmountPortal(key)
          notifyKey = null
          notifyClose = null
        }
      }}
    />,
  )
  key = notifyKey
  return {
    close,
    setMessage: (message) => ref.current?.setMessage(message),
  }
}

export const Notify = attachPropertiesToComponent(memo(NotifyView), {
  show: showNotify,
  hide: () => {
    if (notifyKey !== null) {
      if (notifyClose) notifyClose()
      else {
        unmountPortal(notifyKey)
        notifyKey = null
      }
    }
  },
})
export default Notify
