import { useRef, useState } from 'react'
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
} from 'react-native'
import { Stack } from 'expo-router/stack'
import { GestureTrigger, GestureViewer } from 'react-native-gesture-image-viewer'
import { Text } from '@ftsukic/tsuki'
import { useAppTheme } from '@/theme'
import { NETWORK_PHOTOS } from '../../../src/image-preview/__fixtures__/examples/network-photo-data'

const VIEWER_ID = 'gesture-image-viewer'
type NetworkPhoto = (typeof NETWORK_PHOTOS)[number]

const getPhotoDimensions = (photo: NetworkPhoto) => ({
  width: photo.width,
  height: photo.height,
})

const getPhotoKey = (photo: NetworkPhoto) => photo.id

const renderPhoto = (photo: NetworkPhoto) => (
  <View pointerEvents="none" style={styles.viewerImage}>
    <Image source={photo.source} resizeMode="contain" style={styles.fill} />
  </View>
)

export default function GestureImageViewerScreen() {
  const theme = useAppTheme()
  const [visible, setVisible] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)
  const dismissRef = useRef<(() => void) | null>(null)

  return (
    <>
      <Stack.Screen options={{ title: 'Gesture Image Viewer' }} />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        style={{ backgroundColor: theme.colors.surface.page }}
        data={NETWORK_PHOTOS}
        numColumns={3}
        columnWrapperStyle={styles.row}
        initialNumToRender={12}
        windowSize={5}
        keyExtractor={getPhotoKey}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Gesture Image Viewer 对照</Text>
            <Text>
              使用原库默认缩放、平移惯性和下拉关闭参数。双击或双指放大后拖动图片，观察边界、邻图切换、回弹和跟手关闭；关闭后检查是否回到当前缩略图。
            </Text>
          </View>
        }
        renderItem={({ item: photo, index }) => {
          const aspectRatio = photo.width / photo.height
          return (
            <View style={[styles.cell, { aspectRatio }]}>
              <GestureTrigger
                id={VIEWER_ID}
                index={index}
                onPress={() => {
                  setInitialIndex(index)
                  setVisible(true)
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`打开第 ${index + 1} 张图片预览`}
                  style={styles.fill}
                >
                  <Image source={photo.thumbnail} resizeMode="cover" style={styles.fill} />
                </Pressable>
              </GestureTrigger>
            </View>
          )
        }}
      />
      <Modal
        transparent
        animationType="none"
        visible={visible}
        onRequestClose={() => dismissRef.current?.()}
      >
        <GestureViewer
          id={VIEWER_ID}
          data={NETWORK_PHOTOS}
          initialIndex={initialIndex}
          renderItem={renderPhoto}
          getItemDimensions={getPhotoDimensions}
          getItemKey={getPhotoKey}
          pageSpacing={16}
          onDismiss={() => {
            dismissRef.current = null
            setVisible(false)
          }}
          renderContainer={(children, helpers) => {
            dismissRef.current = helpers.dismiss
            return (
              <View style={styles.modalContainer}>
                {children}
                <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="关闭图片预览"
                    onPress={helpers.dismiss}
                    style={styles.closeButton}
                  >
                    <NativeText style={styles.closeLabel}>×</NativeText>
                  </Pressable>
                </View>
              </View>
            )
          }}
        />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 8 },
  header: { gap: 8, paddingBottom: 4 },
  title: { fontSize: 20, fontWeight: '600' },
  row: { gap: 3 },
  cell: { flex: 1, overflow: 'hidden', borderRadius: 6 },
  fill: { width: '100%', height: '100%' },
  viewerImage: { width: '100%', height: '100%' },
  modalContainer: { flex: 1 },
  closeButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(24, 24, 27, 0.72)',
  },
  closeLabel: { color: '#fff', fontSize: 32, lineHeight: 36 },
})
