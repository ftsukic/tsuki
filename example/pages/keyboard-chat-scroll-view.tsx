import { useCallback, useRef, useState } from 'react'
import { Input, type InputInstance } from '@ftsukic/tsuki'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  KeyboardChatScrollView,
  KeyboardController,
  KeyboardGestureArea,
  KeyboardStickyView,
  useKeyboardHandler,
  useReanimatedKeyboardAnimation,
  type KeyboardChatScrollViewRef,
} from 'react-native-keyboard-controller'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type KeyboardLiftBehavior = 'always' | 'never' | 'persistent' | 'whenAtEnd'
type PanelType = 'emoji' | 'attachment'
type HandoffState =
  'keyboard' | 'keyboardToPanel' | 'panel' | 'panelToKeyboard' | 'panelToClosed' | 'closed'

type Message = {
  id: string
  text: string
  mine?: boolean
}

const INPUT_NATIVE_ID = 'keyboard-chat-scroll-view-input'
const EMOJI_PANEL_CONTENT_HEIGHT = 288
const EMOJI_OPTIONS = ['😀', '😂', '😍', '🥳', '😎', '🤔', '😭', '👍', '👏', '🎉', '❤️', '🚀']

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'KeyboardChatScrollView 测试页已准备好。' },
  { id: '2', text: '先滚动到中间，再点击输入框观察消息是否按预期抬升。' },
  { id: '3', mine: true, text: '也可以切换下面的 lift behavior，对比不同策略。' },
  { id: '4', text: 'interactive dismissal 需要在消息区域向下拖动来收起键盘。' },
  { id: '5', text: '这条消息故意写得长一些，用来验证多行内容和滚动范围。' },
  { id: '6', mine: true, text: '输入一条新消息，然后继续测试。' },
  { id: '7', text: '键盘打开时，底部 composer 会通过 KeyboardStickyView 跟随键盘。' },
  { id: '8', text: 'KeyboardChatScrollView 负责消息内容的键盘 inset 和位置调整。' },
  { id: '9', mine: true, text: 'whenAtEnd 只在列表接近底部时抬升内容。' },
  { id: '10', text: '继续向上滚动可以模拟查看历史消息的状态。' },
  { id: '11', text: '测试完成后可点击右上角回到底部，快速恢复到发送状态。' },
]

const LIFT_BEHAVIORS: Array<{ label: string; value: KeyboardLiftBehavior }> = [
  { label: 'always', value: 'always' },
  { label: 'whenAtEnd', value: 'whenAtEnd' },
  { label: 'persistent', value: 'persistent' },
  { label: 'never', value: 'never' },
]

export default function KeyboardChatScrollViewPage({ onBack }: { onBack: () => void }) {
  const inputRef = useRef<InputInstance>(null)
  const scrollRef = useRef<KeyboardChatScrollViewRef>(null)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [keyboardLiftBehavior, setKeyboardLiftBehavior] =
    useState<KeyboardLiftBehavior>('whenAtEnd')
  const [isAtEnd, setIsAtEnd] = useState(true)
  const [panelVisible, setPanelVisible] = useState(false)
  const [panelType, setPanelType] = useState<PanelType>('emoji')
  const [frozenDebug, setFrozenDebug] = useState(false)
  const { bottom } = useSafeAreaInsets()
  const fallbackPanelHeight = EMOJI_PANEL_CONTENT_HEIGHT + bottom
  const frozen = useSharedValue(false)
  const handoff = useSharedValue<HandoffState>('closed')
  const panelVisibleHeight = useSharedValue(0)
  const panelContainerHeight = useSharedValue(fallbackPanelHeight)
  const panelTranslateY = useSharedValue(fallbackPanelHeight)
  const lastKeyboardHeight = useSharedValue(0)
  const { height: keyboardVisibleHeight } = useReanimatedKeyboardAnimation()

  const setFrozen = useCallback(
    (value: boolean) => {
      frozen.value = value
      setFrozenDebug(value)
    },
    [frozen],
  )

  useKeyboardHandler(
    {
      onStart: (event) => {
        'worklet'

        if (event.height > 0 && handoff.value === 'panelToKeyboard') {
          // Keep the panel in place until native keyboard opening has actually started.
          panelVisibleHeight.value = withTiming(0, { duration: 240 })
          panelTranslateY.value = withTiming(panelContainerHeight.value, { duration: 240 })
          runOnJS(setPanelVisible)(false)
        }
      },
      onEnd: (event) => {
        'worklet'

        if (event.height > 0) {
          lastKeyboardHeight.value = event.height
        }

        if (handoff.value === 'keyboardToPanel' && event.height === 0) {
          handoff.value = 'panel'
        } else if (handoff.value === 'panelToKeyboard' && event.height > 0) {
          frozen.value = false
          handoff.value = 'keyboard'
          runOnJS(setFrozenDebug)(false)
        }
      },
    },
    [setFrozenDebug],
  )

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    height: panelContainerHeight.value,
    transform: [{ translateY: panelTranslateY.value }],
  }))

  const composerPanelStyle = useAnimatedStyle(() => ({
    // KeyboardStickyView already owns keyboardVisibleHeight. Only compensate
    // for the part of the panel that is taller than the current keyboard.
    bottom: Math.max(panelVisibleHeight.value - keyboardVisibleHeight.value, 0),
  }))

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))
  }, [])

  const sendMessage = useCallback(() => {
    const text = draft.trim()
    if (!text) return

    setMessages((current) => [...current, { id: `${Date.now()}`, mine: true, text }])
    setDraft('')
    scrollToEnd()
  }, [draft, scrollToEnd])

  const closeEmojiPanel = useCallback(() => {
    setFrozen(true)
    handoff.value = 'panelToKeyboard'
    inputRef.current?.focus()
  }, [handoff, setFrozen])

  const dismissEmojiPanel = useCallback(() => {
    handoff.value = 'panelToClosed'
    panelVisibleHeight.value = withTiming(0, { duration: 240 }, (finished) => {
      'worklet'

      if (finished && handoff.value === 'panelToClosed') {
        panelTranslateY.value = panelContainerHeight.value
        handoff.value = 'closed'
        frozen.value = false
        runOnJS(setFrozenDebug)(false)
        runOnJS(setPanelVisible)(false)
      }
    })
    panelTranslateY.value = withTiming(panelContainerHeight.value, { duration: 240 })
    inputRef.current?.blur()
    void KeyboardController.dismiss()
  }, [frozen, handoff, panelContainerHeight, panelTranslateY, panelVisibleHeight])

  const toggleEmojiPanel = useCallback(() => {
    if (panelVisible) {
      closeEmojiPanel()
      return
    }

    const nextPanelHeight =
      lastKeyboardHeight.value || keyboardVisibleHeight.value || fallbackPanelHeight
    setFrozen(true)
    handoff.value = 'keyboardToPanel'
    panelContainerHeight.value = nextPanelHeight
    panelVisibleHeight.value = withTiming(nextPanelHeight, { duration: 240 })
    panelTranslateY.value = nextPanelHeight
    panelTranslateY.value = withTiming(0, { duration: 240 })
    setPanelType('emoji')
    setPanelVisible(true)
    inputRef.current?.blur()
    void KeyboardController.dismiss()
  }, [
    fallbackPanelHeight,
    handoff,
    keyboardVisibleHeight,
    lastKeyboardHeight,
    panelContainerHeight,
    panelTranslateY,
    panelVisible,
    panelVisibleHeight,
    closeEmojiPanel,
    setFrozen,
  ])

  return (
    <View style={styles.screen}>
      <View style={styles.pageHeader}>
        <View style={styles.pageTitleBlock}>
          <Text style={styles.pageTitle}>KeyboardChatScrollView</Text>
          <Text style={styles.pageDescription} selectable>
            聊天滚动与键盘交互专项测试
          </Text>
        </View>
        <Pressable
          accessibilityLabel="回到组件列表"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonLabel}>关闭</Text>
        </Pressable>
      </View>

      <View style={styles.controlPanel}>
        <View style={styles.controlHeader}>
          <View>
            <Text style={styles.controlTitle}>keyboardLiftBehavior</Text>
            <Text style={styles.controlHint} selectable>
              当前：{keyboardLiftBehavior} · end visible：{isAtEnd ? 'true' : 'false'} · panel：
              {panelVisible ? panelType : 'closed'} · frozen：{frozenDebug ? 'true' : 'false'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={scrollToEnd}
            style={({ pressed }) => [styles.latestButton, pressed && styles.pressed]}
          >
            <Text style={styles.latestButtonLabel}>回到底部</Text>
          </Pressable>
        </View>
        <View style={styles.behaviorRow}>
          {LIFT_BEHAVIORS.map((item) => {
            const selected = keyboardLiftBehavior === item.value
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item.value}
                onPress={() => setKeyboardLiftBehavior(item.value)}
                style={({ pressed }) => [
                  styles.behaviorButton,
                  selected && styles.behaviorButtonSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.behaviorLabel, selected && styles.behaviorLabelSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <KeyboardGestureArea
        interpolator="ios"
        style={styles.gestureArea}
        textInputNativeID={INPUT_NATIVE_ID}
      >
        <KeyboardChatScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messageContent}
          freeze={frozen}
          keyboardDismissMode="interactive"
          keyboardLiftBehavior={keyboardLiftBehavior}
          keyboardShouldPersistTaps="handled"
          onEndVisible={setIsAtEnd}
          style={styles.messageList}
          offset={bottom}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.messageRow, message.mine && styles.messageRowMine]}
            >
              <View style={[styles.messageBubble, message.mine && styles.messageBubbleMine]}>
                <Text style={[styles.messageText, message.mine && styles.messageTextMine]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </KeyboardChatScrollView>

        {panelVisible ? (
          <Pressable
            accessibilityLabel="关闭表情面板"
            accessibilityRole="button"
            onPress={dismissEmojiPanel}
            style={styles.panelBackdrop}
          />
        ) : null}

        <Animated.View style={[styles.composerLayer, composerPanelStyle]}>
          <KeyboardStickyView style={styles.composerShell}>
            <View style={styles.composer}>
              <View style={styles.inputContainer}>
                <Input
                  accessibilityLabel="聊天消息输入框"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  multiline
                  nativeID={INPUT_NATIVE_ID}
                  onChangeText={setDraft}
                  onSubmitEditing={sendMessage}
                  placeholder="输入消息，测试键盘抬升"
                  placeholderTextColor="#98a2b3"
                  ref={inputRef}
                  returnKeyType="send"
                  style={styles.input}
                  styles={{ shell: styles.inputShell, input: styles.inputText }}
                  value={draft}
                />
              </View>
              <Pressable
                accessibilityLabel={panelVisible ? '关闭表情面板' : '打开表情面板'}
                accessibilityRole="button"
                accessibilityState={{ expanded: panelVisible }}
                onPress={toggleEmojiPanel}
                style={({ pressed }) => [styles.emojiButton, pressed && styles.pressed]}
              >
                <Text style={styles.emojiButtonLabel}>{panelVisible ? '⌄' : '☺'}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="发送消息"
                accessibilityRole="button"
                accessibilityState={{ disabled: !draft.trim() }}
                disabled={!draft.trim()}
                onPress={sendMessage}
                style={({ pressed }) => [
                  styles.sendButton,
                  !draft.trim() && styles.sendButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.sendButtonLabel}>发送</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="收起键盘"
                accessibilityRole="button"
                onPress={() => void KeyboardController.dismiss()}
                style={({ pressed }) => [styles.dismissButton, pressed && styles.pressed]}
              >
                <Text style={styles.dismissButtonLabel}>收起</Text>
              </Pressable>
            </View>
          </KeyboardStickyView>
        </Animated.View>
      </KeyboardGestureArea>

      <Animated.View
        accessibilityElementsHidden={!panelVisible}
        accessibilityViewIsModal={panelVisible}
        importantForAccessibility={panelVisible ? 'yes' : 'no-hide-descendants'}
        pointerEvents={panelVisible ? 'auto' : 'none'}
        style={[styles.emojiPanel, panelAnimatedStyle]}
      >
        <View style={[styles.emojiPanelContent, { paddingBottom: bottom }]}>
          <View style={styles.emojiPanelHeader}>
            <View>
              <Text style={styles.emojiPanelTitle}>
                {panelType === 'emoji' ? 'Emoji 面板' : 'Attachment 面板'}
              </Text>
              <Text style={styles.emojiPanelHint} selectable>
                面板独立于 KeyboardStickyView，切换时保持消息列表位置。
              </Text>
            </View>
            <Pressable
              accessibilityLabel="收起表情面板"
              accessibilityRole="button"
              onPress={closeEmojiPanel}
              style={({ pressed }) => [styles.panelCloseButton, pressed && styles.pressed]}
            >
              <Text style={styles.panelCloseButtonLabel}>收起</Text>
            </Pressable>
          </View>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map((emoji) => (
              <Pressable
                accessibilityLabel={`插入${emoji}`}
                accessibilityRole="button"
                key={emoji}
                onPress={() => setDraft((current) => `${current}${emoji}`)}
                style={({ pressed }) => [styles.emojiOption, pressed && styles.pressed]}
              >
                <Text style={styles.emojiOptionLabel}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f5f7fa',
    flex: 1,
  },
  pageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pageTitleBlock: {
    flex: 1,
    gap: 2,
  },
  pageTitle: {
    color: '#101828',
    fontSize: 17,
    fontWeight: '700',
  },
  pageDescription: {
    color: '#667085',
    fontSize: 12,
  },
  closeButton: {
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  closeButtonLabel: {
    color: '#1677ff',
    fontSize: 13,
    fontWeight: '600',
  },
  controlPanel: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#eaecf0',
    borderBottomWidth: 1,
    borderTopColor: '#eaecf0',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  controlHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlTitle: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '600',
  },
  controlHint: {
    color: '#98a2b3',
    fontSize: 11,
    marginTop: 2,
  },
  latestButton: {
    borderColor: '#d0d5dd',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  latestButtonLabel: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '600',
  },
  behaviorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
  behaviorButton: {
    backgroundColor: '#f2f4f7',
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  behaviorButtonSelected: {
    backgroundColor: '#eaf2ff',
    borderColor: '#1677ff',
    borderWidth: 1,
  },
  behaviorLabel: {
    color: '#667085',
    fontSize: 12,
    textAlign: 'center',
  },
  behaviorLabelSelected: {
    color: '#1677ff',
    fontWeight: '600',
  },
  gestureArea: {
    flex: 1,
    minHeight: 0,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    gap: 10,
    padding: 16,
  },
  messageRow: {
    alignItems: 'flex-start',
  },
  messageRowMine: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#ffffff',
    borderColor: '#eaecf0',
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: '84%',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  messageBubbleMine: {
    backgroundColor: '#1677ff',
    borderColor: '#1677ff',
  },
  messageText: {
    color: '#344054',
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#ffffff',
  },
  composerShell: {
    backgroundColor: '#ffffff',
    borderTopColor: '#eaecf0',
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  composerLayer: {
    zIndex: 2,
  },
  emojiButton: {
    alignItems: 'center',
    borderColor: '#d0d5dd',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  emojiButtonLabel: {
    color: '#344054',
    fontSize: 20,
    lineHeight: 22,
  },
  composer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    width: '100%',
  },
  inputContainer: {
    flex: 1,
    minWidth: 0,
  },
  inputShell: {
    backgroundColor: '#f2f4f7',
    borderRadius: 18,
    paddingHorizontal: 0,
  },
  inputText: {
    color: '#101828',
    fontSize: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#1677ff',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 52,
  },
  sendButtonDisabled: {
    backgroundColor: '#d0d5dd',
  },
  sendButtonLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  dismissButton: {
    alignItems: 'center',
    borderColor: '#d0d5dd',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 52,
  },
  dismissButtonLabel: {
    color: '#667085',
    fontSize: 12,
  },
  emojiPanel: {
    backgroundColor: '#ffffff',
    borderTopColor: '#d0d5dd',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    zIndex: 3,
  },
  panelBackdrop: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  emojiPanelContent: {
    flex: 1,
  },
  emojiPanelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  emojiPanelTitle: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '700',
  },
  emojiPanelHint: {
    color: '#667085',
    fontSize: 11,
    marginTop: 3,
  },
  panelCloseButton: {
    alignItems: 'center',
    borderColor: '#d0d5dd',
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  panelCloseButtonLabel: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  emojiOption: {
    alignItems: 'center',
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  emojiOptionLabel: {
    fontSize: 25,
    lineHeight: 30,
  },
  pressed: {
    opacity: 0.7,
  },
})
