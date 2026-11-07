import { FlatList, Image, Platform, StyleSheet, View } from 'react-native'
import { Stack } from 'expo-router/stack'
import { Galeria } from '@nandorojo/galeria'
import { Text } from '@ftsukic/tsuki'
import { useAppTheme } from '@/theme'
import { NETWORK_PHOTOS } from '../../../src/image-preview/__fixtures__/examples/network-photo-data'

const GALLERY_URLS = NETWORK_PHOTOS.map((photo) => photo.source.uri)

export default function GaleriaPreviewScreen() {
  const theme = useAppTheme()

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return (
      <View style={[styles.webNotice, { backgroundColor: theme.colors.surface.page }]}>
        <Stack.Screen options={{ title: 'Galeria 原生图片预览' }} />
        <Text>此实验仅用于 iOS / Android 原生预览体验。</Text>
      </View>
    )
  }

  return (
    <Galeria urls={GALLERY_URLS}>
      <Stack.Screen options={{ title: 'Galeria 原生图片预览' }} />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        style={{ backgroundColor: theme.colors.surface.page }}
        data={NETWORK_PHOTOS}
        numColumns={3}
        columnWrapperStyle={styles.row}
        initialNumToRender={12}
        windowSize={5}
        keyExtractor={(photo) => photo.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Galeria 原生图片预览</Text>
            <Text>
              点击缩略图打开预览。双击放大/缩小；双指缩放时观察焦点；放大后拖到边界观察回弹和相邻图片露出；左右切换；下拉观察图片缩小与背景渐隐，松手看关闭或恢复。
            </Text>
            <Text>
              组件默认效果：Galeria
              原生预览、共享转场与手势。业务侧行为：本页只提供三列缩略图、清晰原图 URL
              和图片比例，没有自定义手势或动画。
            </Text>
          </View>
        }
        renderItem={({ item: photo, index }) => {
          const aspectRatio = photo.width / photo.height
          return (
            <View style={[styles.cell, { aspectRatio }]}>
              <Galeria.Image index={index} style={styles.fill}>
                <Image
                  source={photo.thumbnail}
                  resizeMode="cover"
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`打开第 ${index + 1} 张图片预览`}
                  style={styles.fill}
                />
              </Galeria.Image>
            </View>
          )
        }}
      />
    </Galeria>
  )
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 8 },
  header: { gap: 8, paddingBottom: 4 },
  title: { fontSize: 20, fontWeight: '600' },
  row: { gap: 3 },
  cell: { flex: 1, overflow: 'hidden', borderRadius: 6 },
  fill: { width: '100%', height: '100%' },
  webNotice: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
})
