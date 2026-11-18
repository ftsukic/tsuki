import { createContext, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { ImagePreview } from '../../../image-preview'
import { createLocalPhotos } from './local-photo-data'
import PreviewToolbar from './preview-toolbar'

const ITEMS = createLocalPhotos('navigation-photo')
const NavigationContext = createContext<{
  activeId: string
  detailOpen: boolean
  open: (id: string) => void
  change: (id: string) => void
  returned: () => void
} | null>(null)

export function SharedNavigationProvider({
  children,
  onNavigate,
  onReturn,
}: PropsWithChildren<{ onNavigate: () => void; onReturn: () => void }>) {
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  const [detailOpen, setDetailOpen] = useState(false)
  const navigation = useMemo(
    () => ({
      activeId,
      detailOpen,
      open: (id: string) => {
        setActiveId(id)
        setDetailOpen(true)
        onNavigate()
      },
      change: setActiveId,
      returned: () => {
        setDetailOpen(false)
        onReturn()
      },
    }),
    [activeId, detailOpen, onNavigate, onReturn],
  )
  return <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>
}

function usePreviewNavigation() {
  const navigation = useContext(NavigationContext)
  if (!navigation) throw new Error('SharedNavigationProvider is required')
  return navigation
}

/** @title 跨页面来源定位 @description 保留 Feed 的透明详情路由使用同一受控预览器；关闭时定位当前图片来源。 */
export default function SharedNavigationFeed() {
  const navigation = usePreviewNavigation()
  const { width } = useWindowDimensions()
  return (
    <ScrollView
      style={styles.feed}
      scrollEnabled={!navigation.detailOpen}
      contentContainerStyle={styles.feedContent}
    >
      <Text style={styles.title}>Feed → 图片详情</Text>
      <Text>点击卡片进入详情页，左右切图、缩放和下拉返回。图片序列不依赖卡片挂载。</Text>
      <Text>来源卡片只提供过渡位置，预览使用独立图片节点，不迁移同一个原生视图。</Text>
      {ITEMS.map((item, index) => (
        <View key={item.id} style={styles.card}>
          <Text>{index === 0 ? '长图卡片' : '横图卡片'}</Text>
          <ImagePreview.Source
            imageId={item.id}
            style={{
              width: Math.min(width - 32, (320 * item.width) / item.height),
              height: Math.min(((width - 32) * item.height) / item.width, 320),
              backgroundColor: '#000000',
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`跨页面打开第 ${index + 1} 张图片`}
              style={styles.image}
              onPress={() => navigation.open(item.id)}
            >
              <Image source={item.source} resizeMode="contain" style={styles.image} />
            </Pressable>
          </ImagePreview.Source>
        </View>
      ))}
    </ScrollView>
  )
}

export function SharedNavigationDetail() {
  const navigation = usePreviewNavigation()
  const [visible, setVisible] = useState(true)
  return (
    <View style={styles.root}>
      <ImagePreview
        visible={visible}
        items={ITEMS}
        activeId={navigation.activeId}
        closeable
        renderToolbar={(params) => <PreviewToolbar {...params} />}
        onChange={({ id }) => navigation.change(id)}
        onRequestClose={() => setVisible(false)}
        onClosed={navigation.returned}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  feed: { flex: 1, backgroundColor: '#f5f5f5' },
  feedContent: { padding: 16, paddingTop: 64, gap: 20 },
  title: { fontSize: 24, fontWeight: '600' },
  card: { gap: 12 },
  image: { width: '100%', height: '100%' },
})
