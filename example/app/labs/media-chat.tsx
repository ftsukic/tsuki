import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Image, AppState, Pressable, StyleSheet, Text, View } from 'react-native'
import { useIsFocused } from 'expo-router'
import { Stack } from 'expo-router/stack'
import Video, { ViewType } from 'react-native-video'
import type { VideoRef } from 'react-native-video'
import FastImage from 'react-native-fast-image'
import { ImagePreview, useToken } from '@ftsukic/tsuki'
import type {
  ImagePreviewImage,
  ImagePreviewMediaRenderProps,
  ImagePreviewProps,
  ImagePreviewSourceProps,
} from '@ftsukic/tsuki'
import ChatMessages from '../../../src/image-preview/__fixtures__/examples/chat-messages'
import PreviewToolbar from '../../../src/image-preview/__fixtures__/examples/preview-toolbar'
import { fastImageAdapter } from '../../components/fast-image-adapter'

const VIDEO = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro bundles native assets through static require.
  source: require('../../assets/videos/chat-demo.mp4'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro bundles native assets through static require.
  poster: require('../../assets/videos/chat-demo-poster.png'),
}
const MEDIA = Array.from({ length: 75 }, (_, index) => ({
  messageIndex: index * 4,
  item: {
    id: `chat-video-${index}`,
    type: 'video',
    source: VIDEO.source,
    thumbnail: VIDEO.poster,
    width: 640,
    height: 360,
  } satisfies ImagePreviewImage,
}))

function VideoFrame({
  item,
  playing,
  onLoad,
  onError,
  playerRef,
  onProgress,
  onDuration,
  onFailure,
  onEnd,
}: ImagePreviewMediaRenderProps & {
  playerRef: RefObject<VideoRef | null>
  onProgress: (seconds: number) => void
  onDuration: (seconds: number) => void
  onFailure: (message: string) => void
  onEnd: () => void
}) {
  const [ready, setReady] = useState(false)
  const source =
    typeof item.source === 'number'
      ? { uri: Image.resolveAssetSource(item.source).uri }
      : Array.isArray(item.source)
        ? item.source[0]
        : item.source
  return (
    <View style={StyleSheet.absoluteFill}>
      <Video
        ref={playerRef}
        source={source}
        style={[StyleSheet.absoluteFill, { opacity: ready ? 1 : 0 }]}
        resizeMode="contain"
        controls={false}
        viewType={ViewType.TEXTURE}
        paused={!playing}
        playInBackground={false}
        playWhenInactive={false}
        onLoadStart={() => setReady(false)}
        onReadyForDisplay={() => setReady(true)}
        onLoad={({ duration }) => {
          onDuration(duration)
          onLoad()
        }}
        onProgress={({ currentTime }) => onProgress(currentTime)}
        onEnd={onEnd}
        onError={({ error }) => {
          setReady(false)
          onFailure(error.errorString || error.localizedDescription || '视频加载失败')
          onError()
        }}
      />
    </View>
  )
}

export default function MediaChatScreen() {
  const { token } = useToken()
  const focused = useIsFocused()
  const playerRef = useRef<VideoRef>(null)
  const [paused, setPaused] = useState<Record<string, boolean>>({})
  const [attempt, setAttempt] = useState(0)
  const [playback, setPlayback] = useState({ id: '', time: 0, duration: 6 })
  const [failure, setFailure] = useState<{ id: string; message: string } | null>(null)
  const [background, setBackground] = useState(AppState.currentState !== 'active')
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setBackground(state !== 'active'),
    )
    return () => subscription.remove()
  }, [])
  const media: NonNullable<ImagePreviewProps['renderMedia']> = useCallback(
    (props) =>
      props.active ? (
        <VideoFrame
          key={`${props.item.id}-${attempt}`}
          {...props}
          playerRef={playerRef}
          playing={props.playing && !background && !paused[props.item.id]}
          onProgress={(time) => setPlayback((current) => ({ ...current, id: props.item.id, time }))}
          onDuration={(duration) => {
            setFailure(null)
            setPlayback({ id: props.item.id, time: 0, duration })
          }}
          onFailure={(message) => setFailure({ id: props.item.id, message })}
          onEnd={() => setPaused((current) => ({ ...current, [props.item.id]: true }))}
        />
      ) : null,
    [attempt, background, paused],
  )
  const attachment = useCallback(
    (
      index: number,
      {
        openPreview,
        clipRef,
      }: {
        openPreview: (id: string) => void
        clipRef: NonNullable<ImagePreviewSourceProps['clipRef']>
      },
    ) => {
      const entry = MEDIA.find((entry) => entry.messageIndex === index)
      return entry ? (
        <ImagePreview.Source imageId={entry.item.id} clipRef={clipRef} style={styles.poster}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`播放第 ${index + 1} 条消息中的视频`}
            style={styles.posterContent}
            onPress={() => openPreview(entry.item.id)}
          >
            <FastImage
              source={VIDEO.poster}
              objectFit="cover"
              transition={false}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.play}>▶</Text>
            <Text style={styles.caption}>本地视频 · 6 秒 · 无声</Text>
          </Pressable>
        </ImagePreview.Source>
      ) : null
    },
    [],
  )
  return (
    <ImagePreview.Provider>
      <Stack.Screen options={{ title: '图片与视频混合聊天' }} />
      <View style={{ flex: 1, padding: 16, backgroundColor: token.colorBgLayout }}>
        <ChatMessages
          imageAdapter={fastImageAdapter}
          mediaItems={MEDIA}
          previewEnabled={focused}
          onPreviewClosed={() => {
            setPaused({})
            setFailure(null)
            setPlayback({ id: '', time: 0, duration: 6 })
          }}
          renderMedia={media}
          renderMessageAttachment={attachment}
          renderToolbar={(params) =>
            params.item.type === 'video' ? (
              <View style={styles.toolbar}>
                {failure?.id === params.id ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="重试视频"
                    onPress={() => {
                      setFailure(null)
                      setAttempt((value) => value + 1)
                    }}
                    style={styles.action}
                  >
                    <Text style={styles.label}>加载失败，重试</Text>
                  </Pressable>
                ) : (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        if (playback.id === params.id && playback.time >= playback.duration - 0.2)
                          playerRef.current?.seek(0)
                        setPaused((current) => ({ ...current, [params.id]: !current[params.id] }))
                      }}
                      style={styles.action}
                    >
                      <Text style={styles.label}>{paused[params.id] ? '播放' : '暂停'}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="视频后退两秒"
                      onPress={() => playerRef.current?.seek(Math.max(0, playback.time - 2))}
                      style={styles.action}
                    >
                      <Text style={styles.label}>−2 秒</Text>
                    </Pressable>
                    <Text style={styles.label}>
                      {Math.floor(playback.id === params.id ? playback.time : 0)} /{' '}
                      {Math.ceil(playback.duration)} 秒
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="视频前进两秒"
                      onPress={() =>
                        playerRef.current?.seek(Math.min(playback.duration, playback.time + 2))
                      }
                      style={styles.action}
                    >
                      <Text style={styles.label}>+2 秒</Text>
                    </Pressable>
                  </>
                )}
              </View>
            ) : (
              <PreviewToolbar {...params} />
            )
          }
        />
      </View>
    </ImagePreview.Provider>
  )
}

const styles = StyleSheet.create({
  poster: {
    width: 180,
    height: 102,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#333333',
  },
  posterContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  play: {
    color: '#ffffff',
    fontSize: 30,
    backgroundColor: '#00000066',
    borderRadius: 22,
    paddingHorizontal: 12,
  },
  caption: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    color: '#ffffff',
    backgroundColor: '#00000099',
    padding: 4,
    fontSize: 11,
  },
  toolbar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  action: { padding: 12, borderRadius: 10, backgroundColor: '#383838' },
  label: { color: '#ffffff', fontSize: 13 },
})
