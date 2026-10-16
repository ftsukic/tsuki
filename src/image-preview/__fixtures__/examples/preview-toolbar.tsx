import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Icon } from '../../../icon'
import type { ImagePreviewToolbarParams } from '../../../image-preview/types'

/** @title 统一业务工具栏 @description 所有预览示例复用相同的按钮尺寸、间距与原图加载入口。 */
export default function PreviewToolbar({
  id,
  original,
  leftAction,
  onMore,
}: ImagePreviewToolbarParams & {
  leftAction?: { label: string; onPress: () => void }
  onMore?: () => void
}) {
  const originalAction =
    original.available && original.status !== 'loaded'
      ? {
          label:
            original.status === 'loading'
              ? '原图加载中…'
              : original.status === 'error'
                ? '重试原图'
                : '查看原图',
          onPress: original.load,
          disabled: original.status === 'loading',
        }
      : undefined
  const action: { label: string; onPress: () => void; disabled?: boolean } | undefined =
    leftAction ?? originalAction
  return (
    <View style={styles.row}>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          disabled={action.disabled}
          hitSlop={6}
          style={styles.original}
          onPress={action.onPress}
        >
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.actions}>
        {(
          [
            ['转发', 'ShareAltOutlined'],
            ['保存', 'DownloadOutlined'],
            ['图片列表', 'AppstoreFilled'],
            ['更多', 'EllipsisOutlined'],
          ] as const
        ).map(([label, icon]) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={6}
            style={styles.action}
            onPress={() => {
              if (label === '更多' && onMore) onMore()
              else Alert.alert(label, `业务接入示例：图片 ${id}。请在此接入${label}处理。`)
            }}
          >
            <Icon name={icon} color="#ffffff" size={18} />
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  spacer: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  action: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#383838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  original: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#383838',
    justifyContent: 'center',
  },
  label: { color: '#ffffff', fontSize: 12 },
})
