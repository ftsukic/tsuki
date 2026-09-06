import { Icon } from '../icon'
import { useToken } from '../theme'
import type { PopupHeaderProps } from './interface'
import { createPopupStyles } from './style'
import { Pressable, Text, View } from 'react-native'

export function PopupHeader({
  children,
  title,
  showClose = true,
  onClose,
  style,
  theme,
}: PopupHeaderProps) {
  const { components } = useToken()
  const token = { ...components.Popup, ...theme }
  const styles = createPopupStyles(token)
  const titleContent = title ?? children

  return (
    <View style={[styles.header, style]}>
      {typeof titleContent === 'string' || typeof titleContent === 'number' ? (
        <Text numberOfLines={1} style={styles.headerTitle}>
          {titleContent}
        </Text>
      ) : (
        titleContent
      )}
      {showClose ? (
        <Pressable onPress={onClose} hitSlop={token.closeHitSlop} accessibilityRole="button">
          <Icon
            name="CloseOutlined"
            size={token.closeSize}
            color={token.closeColor}
            style={styles.close}
          />
        </Pressable>
      ) : null}
    </View>
  )
}
