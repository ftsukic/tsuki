import { Icon } from '../icon'
import { useToken } from '../theme'
import { generateSemanticColorSet } from '../theme/util/semanticColor'
import type { TagProps } from './interface'
import { memo, useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export function Tag({
  children,
  style,
  theme,
  innerStyle,
  closable = false,
  onClose,
  size = 'm',
  type = 'primary',
  visible = true,
  closeIcon,
  icon,
  color,
  textColor,
  hairline,
  ...props
}: TagProps) {
  const { components, token: themeToken } = useToken()
  const token = { ...components.Tag, ...theme }
  const mainColor = color ?? themeToken.colorInfo
  const sizes = {
    l: {
      height: token.lHeight,
      fontSize: token.lFontSize,
      padding: token.lPaddingHorizontal,
      close: token.lCloseIcon,
    },
    m: {
      height: token.mHeight,
      fontSize: token.mFontSize,
      padding: token.mPaddingHorizontal,
      close: token.mCloseIcon,
    },
    s: {
      height: token.sHeight,
      fontSize: token.sFontSize,
      padding: token.sPaddingHorizontal,
      close: token.sCloseIcon,
    },
  }
  const sizeStyle = sizes[size]
  const customColorSet = useMemo(() => {
    if (type === 'primary' || typeof color !== 'string') return undefined
    return generateSemanticColorSet(color)
  }, [color, type])
  const semanticMainColor = customColorSet?.color ?? mainColor
  const typeStyle = useMemo(() => {
    if (type === 'ghost')
      return {
        backgroundColor: 'transparent',
        borderColor: semanticMainColor,
        borderWidth: hairline ? StyleSheet.hairlineWidth : themeToken.lineWidth,
      }
    if (type === 'hazy') {
      return {
        backgroundColor: customColorSet?.backgroundColor ?? themeToken.colorInfoBg,
        borderColor: customColorSet?.borderColor ?? themeToken.colorInfoBorder,
        borderWidth: hairline ? StyleSheet.hairlineWidth : themeToken.lineWidth,
      }
    }
    return { backgroundColor: mainColor, borderColor: mainColor }
  }, [
    customColorSet,
    hairline,
    mainColor,
    semanticMainColor,
    themeToken.lineWidth,
    themeToken.colorInfoBg,
    themeToken.colorInfoBorder,
    type,
  ])
  if (!visible) return null
  return (
    <View {...props} style={[{ flexDirection: 'row', overflow: 'visible' }, style]}>
      <View
        style={[
          {
            height: sizeStyle.height,
            paddingHorizontal: sizeStyle.padding,
            borderRadius: token.borderRadius,
            flexDirection: 'row',
            alignItems: 'center',
          },
          typeStyle,
          innerStyle,
        ]}
      >
        {icon}
        <Text
          style={{
            fontSize: sizeStyle.fontSize,
            color:
              textColor ??
              (type === 'primary' ? themeToken.colorTextLightSolid : semanticMainColor),
          }}
        >
          {children}
        </Text>
        {closable ? (
          closeIcon ? (
            <TouchableOpacity onPress={onClose}>{closeIcon}</TouchableOpacity>
          ) : (
            <Icon
              name="CloseOutlined"
              onPress={onClose}
              size={sizeStyle.close}
              color={
                (textColor ??
                  (type === 'primary'
                    ? themeToken.colorTextLightSolid
                    : semanticMainColor)) as string
              }
            />
          )
        ) : null}
      </View>
    </View>
  )
}

export default memo(Tag)
