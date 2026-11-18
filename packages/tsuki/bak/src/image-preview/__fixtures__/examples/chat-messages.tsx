import { FlashList } from '@shopify/flash-list'
import type { FlashListProps } from '@shopify/flash-list'
import {
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
  type RefObject,
} from 'react'
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ImagePreview, Popup } from '../../..'
import type {
  ImagePreviewLongPressParams,
  ImagePreviewImageAdapter,
  ImagePreviewImage,
  ImagePreviewProps,
} from '../../..'
import { NETWORK_PHOTOS } from './network-photo-data'
import PreviewToolbar from './preview-toolbar'

const MESSAGES = (() => {
  let photoIndex = 0
  return Array.from({ length: 300 }, (_, messageIndex) => {
    const photoCount = messageIndex % 4 === 0 ? 2 : messageIndex % 3 === 0 ? 0 : 1
    return {
      id: `message-${messageIndex}`,
      mine: messageIndex % 2 === 1,
      text:
        photoCount === 0
          ? '这张我已经收到了，晚点整理到相册里。'
          : messageIndex % 5 === 0
            ? '周末拍的照片，天气特别好。'
            : '点图左右切换；也可以双击或双指缩放。',
      photos: Array.from({ length: photoCount }, () => {
        const index = photoIndex++
        return { key: NETWORK_PHOTOS[index].id, messageIndex, photoIndex: index }
      }),
    }
  })
})()

const CHAT_VIEWABILITY = { itemVisiblePercentThreshold: 1, minimumViewTime: 0 }
const PHOTO_RECORDS = MESSAGES.flatMap((message) => message.photos)
const ITEMS = PHOTO_RECORDS.map(({ photoIndex }) => ({
  ...NETWORK_PHOTOS[photoIndex],
  id: `chat-${NETWORK_PHOTOS[photoIndex].id}`,
}))
const CONTACTS = ['文件传输助手', '聊天记录', '最近联系人', '项目群', '收藏助手']
const MENU_ROWS = [
  [
    ['↗', '转发给朋友', '#09be4f'],
    ['☆', '收藏', '#f2b64b'],
    ['⌕', '搜一搜', '#ff5964'],
    ['▦', '用其他应用打开', '#21a4e8'],
    ['◉', '用小程序打开', '#625be7'],
  ],
  [
    ['⇩', '保存图片', '#1888ff'],
    ['✎', '编辑', '#222222'],
    ['□', '浮窗', '#222222'],
    ['⌖', '定位到聊天位置', '#222222'],
    ['▤', '此聊天中的图片视频', '#222222'],
    ['文', '翻译', '#222222'],
  ],
] as const

function ChatThumbnail({
  source,
  imageAdapter,
}: {
  source: { uri: string }
  imageAdapter?: ImagePreviewImageAdapter
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  return (
    <>
      {imageAdapter ? (
        <View key={`${source.uri}-${attempt}`} style={styles.photo}>
          {imageAdapter.render({
            source,
            style: styles.photo,
            onLoadStart: () => setStatus('loading'),
            onLoad: () => setStatus('loaded'),
            onError: () => setStatus('error'),
          })}
        </View>
      ) : (
        <Image
          key={`${source.uri}-${attempt}`}
          source={source}
          resizeMode="contain"
          style={styles.photo}
          onLoadStart={() => setStatus('loading')}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' ? (
        <View pointerEvents="none" style={styles.thumbnailStatus}>
          <Text style={styles.thumbnailStatusText}>加载中</Text>
        </View>
      ) : status === 'error' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="重试加载缩略图"
          style={styles.thumbnailStatus}
          onPress={(event) => {
            event.stopPropagation()
            setStatus('loading')
            setAttempt((current) => current + 1)
          }}
        >
          <Text style={styles.thumbnailStatusText}>加载失败{`\n`}点击重试</Text>
        </Pressable>
      ) : null}
    </>
  )
}

/** @title 聊天网络图片 @description 300 条虚拟化消息、300 张不同的网络图片；缩略图与预览图分开加载，长按打开自定义半屏 Popup。 */
export default function ImagePreviewChatMessages({
  imageAdapter,
  renderMessageAttachment,
  mediaItems,
  renderMedia,
  renderToolbar,
  previewEnabled = true,
  onPreviewClosed,
}: {
  imageAdapter?: ImagePreviewImageAdapter
  renderMessageAttachment?: (
    messageIndex: number,
    context: { openPreview: (id: string) => void; clipRef: RefObject<View | null> },
  ) => ReactNode
  mediaItems?: readonly { messageIndex: number; item: ImagePreviewImage }[]
  renderMedia?: ImagePreviewProps['renderMedia']
  renderToolbar?: ImagePreviewProps['renderToolbar']
  previewEnabled?: boolean
  onPreviewClosed?: () => void
} = {}) {
  const gallery = useMemo(
    () =>
      mediaItems
        ? MESSAGES.flatMap((message, index) => [
            ...message.photos.map((photo) => ITEMS[photo.photoIndex]),
            ...mediaItems
              .filter((entry) => entry.messageIndex === index)
              .map((entry) => entry.item),
          ])
        : ITEMS,
    [mediaItems],
  )
  const clipRef = useRef<View>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!previewEnabled) setVisible(false)
  }, [previewEnabled])
  const [activeId, setActiveId] = useState(ITEMS[0].id)
  const [menuImage, setMenuImage] = useState<ImagePreviewLongPressParams | null>(null)
  const [menuVisible, setMenuVisible] = useState(false)
  const [viewableIds, setViewableIds] = useState<Set<string>>(() => new Set())
  const onViewableItemsChanged = useRef<
    NonNullable<FlashListProps<(typeof MESSAGES)[number]>['onViewableItemsChanged']>
  >(({ viewableItems }) => {
    const next = new Set(viewableItems.map(({ item }) => item.id))
    setViewableIds((current) =>
      current.size === next.size && [...next].every((id) => current.has(id)) ? current : next,
    )
  }).current

  const openPreview = useCallback((id: string) => {
    setActiveId(id)
    setVisible(true)
  }, [])

  const openMenu = useCallback((image: ImagePreviewLongPressParams) => {
    setMenuImage(image)
    setMenuVisible(true)
  }, [])

  const handleMenuAction = (action: string) => {
    if (menuImage) {
      Alert.alert(action, `将图片 ${menuImage.id} 交给聊天业务处理。`)
    }
    setMenuVisible(false)
  }

  const renderMessage = useCallback(
    ({ item: message }: { item: (typeof MESSAGES)[number] }) => (
      <View style={[styles.message, message.mine ? styles.mine : styles.theirs]}>
        <Text style={styles.messageText}>{message.text}</Text>
        {message.photos.length > 0 ? (
          <View style={styles.photos}>
            {message.photos.map((photo) => {
              const networkPhoto = NETWORK_PHOTOS[photo.photoIndex]
              const aspectRatio = networkPhoto.width / networkPhoto.height
              const size =
                aspectRatio >= 1
                  ? { width: 104, height: 104 / aspectRatio }
                  : { width: 104 * aspectRatio, height: 104 }
              return (
                <ImagePreview.Source
                  key={photo.key}
                  imageId={`chat-${networkPhoto.id}`}
                  clipRef={clipRef}
                  disabled={!viewableIds.has(message.id)}
                  style={[styles.thumbnail, size]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`打开第 ${photo.messageIndex + 1} 条消息中的图片`}
                    style={styles.photo}
                    onPress={() => openPreview(`chat-${networkPhoto.id}`)}
                  >
                    <ChatThumbnail
                      key={networkPhoto.id}
                      source={networkPhoto.thumbnail}
                      imageAdapter={imageAdapter}
                    />
                  </Pressable>
                </ImagePreview.Source>
              )
            })}
          </View>
        ) : null}
        {renderMessageAttachment?.(Number(message.id.slice('message-'.length)), {
          openPreview,
          clipRef,
        })}
      </View>
    ),
    [openPreview, viewableIds, imageAdapter, renderMessageAttachment],
  )

  const menu = (
    <Popup
      visible={menuVisible}
      position="bottom"
      round
      overlay
      closeOnPressOverlay
      safeAreaInsetBottom
      zIndex={12000}
      styles={{ container: styles.menuPanel }}
      onRequestClose={() => setMenuVisible(false)}
      onClosed={() => setMenuImage(null)}
    >
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>转发给</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.contacts}>
            {CONTACTS.map((contact, index) => (
              <Pressable
                key={contact}
                accessibilityRole="button"
                onPress={() => handleMenuAction(`转发给${contact}`)}
                style={styles.contact}
              >
                <View style={[styles.contactAvatar, { backgroundColor: CONTACT_COLORS[index] }]}>
                  <Text style={styles.contactInitial}>{contact.slice(0, 1)}</Text>
                </View>
                <Text numberOfLines={2} style={styles.contactName}>
                  {contact}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <View style={styles.menuDivider} />
        <View style={styles.actionRows}>
          {MENU_ROWS.map((row, rowIndex) => (
            <ScrollView
              key={rowIndex}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actionRow}
            >
              {row.map(([icon, label, color]) => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  onPress={() => handleMenuAction(label)}
                  style={styles.menuAction}
                >
                  <View style={styles.actionIcon}>
                    <Text style={[styles.actionGlyph, { color }]}>{icon}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.menuActionText}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ))}
        </View>
        <Text style={styles.menuDescription}>
          {menuImage ? `图片 ${menuImage.id} · ${menuImage.index + 1}/${gallery.length}` : ''}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMenuVisible(false)}
          style={styles.cancel}
        >
          <Text style={styles.cancelText}>取消</Text>
        </Pressable>
      </View>
    </Popup>
  )

  return (
    <View style={styles.example}>
      <Text style={styles.hint}>
        共 {MESSAGES.length} 条虚拟化消息、{PHOTO_RECORDS.length}{' '}
        张不同的网络图片，包含横图、竖图、方图与长图。缩略图最长边 320px，预览最长边
        1600px。预览中按住 500ms 立即打开菜单；图片来自 picsum.photos。
      </Text>
      <View ref={clipRef} collapsable={false} style={styles.chat}>
        <FlashList
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          data={MESSAGES}
          keyExtractor={(message) => message.id}
          renderItem={renderMessage}
          drawDistance={900}
          extraData={viewableIds}
          viewabilityConfig={CHAT_VIEWABILITY}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {visible ? `当前预览：${activeId}` : '保存、转发等操作由聊天业务实现'}
        </Text>
      </View>
      <ImagePreview
        visible={visible}
        items={gallery}
        imageAdapter={imageAdapter}
        renderMedia={renderMedia}
        activeId={activeId}
        closeable
        interactionDisabled={menuImage !== null}
        renderToolbar={(params) =>
          renderToolbar ? (
            renderToolbar(params)
          ) : (
            <PreviewToolbar {...params} onMore={() => openMenu(params)} />
          )
        }
        renderOverlay={() => menu}
        onChange={({ id }) => setActiveId(id)}
        onLongPress={openMenu}
        onRequestClose={() => setVisible(false)}
        onClosed={() => {
          setMenuVisible(false)
          setMenuImage(null)
          onPreviewClosed?.()
        }}
      />
    </View>
  )
}

const CONTACT_COLORS = ['#547aa5', '#bb7d62', '#759b78', '#8875ac', '#c39550']

const styles = StyleSheet.create({
  example: { gap: 12, flex: 1, minHeight: 560 },
  hint: { color: '#666666', fontSize: 13, lineHeight: 19 },
  chat: {
    flex: 1,
    maxHeight: 520,
    backgroundColor: '#ededed',
    borderRadius: 16,
    overflow: 'hidden',
  },
  messages: { padding: 16, gap: 16 },
  message: { maxWidth: '84%', padding: 10, borderRadius: 12, gap: 8 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#ffffff' },
  mine: { alignSelf: 'flex-end', backgroundColor: '#95ec69' },
  messageText: { color: '#222222', fontSize: 14, lineHeight: 20 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  thumbnail: { borderRadius: 6, overflow: 'hidden', backgroundColor: '#d8d8d8' },
  photo: { width: '100%', height: '100%' },
  thumbnailStatus: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e2e2',
  },
  thumbnailStatusText: { color: '#777777', fontSize: 10, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: '#777777', fontSize: 12 },
  menuPanel: { height: '58%', backgroundColor: '#f5f5f5' },
  menuContent: { flex: 1, paddingTop: 22 },
  menuTitle: { color: '#222222', fontSize: 17, fontWeight: '600', paddingHorizontal: 20 },
  contacts: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, paddingVertical: 18 },
  contact: { width: 70, alignItems: 'center', gap: 7 },
  contactAvatar: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: { color: '#ffffff', fontSize: 23, fontWeight: '600' },
  contactName: { color: '#666666', fontSize: 11, lineHeight: 15, textAlign: 'center' },
  menuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#dddddd', marginTop: 2 },
  actionRows: { paddingTop: 14, gap: 12 },
  actionRow: { gap: 7, paddingHorizontal: 12 },
  menuAction: { width: 72, alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGlyph: { fontSize: 25, fontWeight: '500' },
  menuActionText: { color: '#666666', fontSize: 11, lineHeight: 15, textAlign: 'center' },
  menuDescription: {
    color: '#888888',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 'auto',
    paddingVertical: 8,
  },
  cancel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dddddd',
    paddingVertical: 17,
    alignItems: 'center',
  },
  cancelText: { color: '#5375a5', fontSize: 17 },
})
