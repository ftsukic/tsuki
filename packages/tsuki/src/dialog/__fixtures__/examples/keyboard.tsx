import { FixtureKeyboardToolbarContext } from '../../../input/__fixtures__/keyboard-toolbar-context'
import { useContext, useRef, useState } from 'react'
import { View } from 'react-native'
import { Button, Dialog, Input, Text } from '../../..'

function DialogInputForm({
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
      showWordLimit
      maxLength={60}
      value={value}
      onChangeText={(next) => {
        setValue(next)
        onChange(next)
      }}
      placeholder="请输入申请说明"
    />
  )
}

/**
 * @title 输入框与键盘避让
 * @description Dialog 开启 keyboardAvoiding 后仅按键盘实际遮挡量上移，正文可滚动，确认按钮保留可见；受控编辑状态位于弹层内部。
 */
export default function DialogKeyboardExample() {
  const toolbarHeight = useContext(FixtureKeyboardToolbarContext)
  const [show, setShow] = useState(false)
  const draft = useRef('我是冯阳勇')
  const [submitted, setSubmitted] = useState('')
  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setShow(true)}>申请加好友</Button>
      <Text>已提交：{submitted || '暂无'}</Text>
      <Dialog
        show={show}
        title="申请加好友"
        theme="round-button"
        keyboardAvoiding
        styles={{ wrapper: { paddingBottom: toolbarHeight * 2 } }}
        showCancelButton
        onShowChange={setShow}
        onConfirm={() => setSubmitted(draft.current)}
      >
        <DialogInputForm
          initialValue={draft.current}
          onChange={(value) => {
            draft.current = value
          }}
        />
      </Dialog>
    </View>
  )
}
