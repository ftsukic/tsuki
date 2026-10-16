import { FixtureKeyboardToolbarContext } from '../../../input/__fixtures__/keyboard-toolbar-context'
import { useContext, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Button, Input, Popup, Text } from '../../..'
import type { PopupPosition } from '../../..'

function PopupInputForm({
  initialValue,
  onChange,
}: {
  initialValue: string
  onChange: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <Input
      multiline
      rows={4}
      bordered
      value={value}
      onChangeText={(next) => {
        setValue(next)
        onChange(next)
      }}
      placeholder="请输入备注"
    />
  )
}

/**
 * @title 输入表单与键盘避让
 * @description 对比居中和底部 Popup，受控编辑状态放在弹层内部，正文滚动，提交按钮固定在正文外。
 */
export default function PopupKeyboardExample() {
  const toolbarHeight = useContext(FixtureKeyboardToolbarContext)
  const [position, setPosition] = useState<PopupPosition>('center')
  const [visible, setVisible] = useState(false)
  const draft = useRef('')
  const [submitted, setSubmitted] = useState('')
  return (
    <View style={{ gap: 12 }}>
      {(['center', 'bottom'] as const).map((next) => (
        <Button
          key={next}
          onPress={() => {
            setPosition(next)
            setVisible(true)
          }}
        >
          {next === 'center' ? '居中输入表单' : '底部输入表单'}
        </Button>
      ))}
      <Text>已提交：{submitted || '暂无'}</Text>
      <Popup
        visible={visible}
        position={position}
        keyboardAvoiding
        safeAreaInsetBottom
        round
        destroyOnClosed
        closeOnPressOverlay
        onRequestClose={() => setVisible(false)}
        styles={{
          wrapper: { paddingBottom: position === 'center' ? toolbarHeight * 2 : toolbarHeight },
          container: { width: position === 'center' ? '85%' : '100%', padding: 20, gap: 16 },
        }}
      >
        <Text>填写备注</Text>
        <ScrollView style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled">
          <PopupInputForm
            initialValue={draft.current}
            onChange={(value) => {
              draft.current = value
            }}
          />
        </ScrollView>
        <Button
          onPress={() => {
            setSubmitted(draft.current)
            setVisible(false)
          }}
        >
          提交
        </Button>
      </Popup>
    </View>
  )
}
