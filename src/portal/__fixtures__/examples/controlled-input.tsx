import { FixtureKeyboardToolbarContext } from '../../../input/__fixtures__/keyboard-toolbar-context'
import { useContext, useState } from 'react'
import { Keyboard, View } from 'react-native'
import { Button, Dialog, Input, Popup, Text } from '../../..'

/**
 * @title 父级受控输入
 * @description 在页面父级管理 value，验证 Teleport Portal 中的中文组合输入、赋值、清空和关闭。
 */
export default function PortalControlledInputExample() {
  const toolbarHeight = useContext(FixtureKeyboardToolbarContext)
  const [target, setTarget] = useState<'dialog' | 'popup' | null>(null)
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState('')
  const input = (
    <Input
      testID="portal-parent-input"
      multiline
      rows={4}
      bordered
      autoFocus
      value={value}
      onChangeText={setValue}
      placeholder="连续输入 zhongguo 后选择中国"
    />
  )
  const actions = (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setValue('外部赋值')}>父级赋值</Button>
      <Button onPress={() => setValue('')}>父级清空</Button>
      <Button onPress={Keyboard.dismiss}>收起键盘</Button>
    </View>
  )
  return (
    <View style={{ gap: 12 }}>
      <Text>弹层使用 react-native-teleport，value 由页面父级管理。</Text>
      <Text>value 由页面父级持有，弹层内不另建编辑 state。</Text>
      <Button onPress={() => setTarget('dialog')}>打开受控 Dialog</Button>
      <Button onPress={() => setTarget('popup')}>打开受控 Popup</Button>
      <Text>父级值：{value || '（空）'}</Text>
      <Text>当前弹层：{target || '（关闭）'}</Text>
      <Text>已提交：{submitted || '（空）'}</Text>
      <Dialog
        styles={{ wrapper: { paddingBottom: toolbarHeight * 2 } }}
        show={target === 'dialog'}
        title="Teleport 父级受控输入"
        keyboardAvoiding
        onShowChange={(show) => {
          if (!show) setTarget(null)
        }}
        onConfirm={() => setSubmitted(value)}
      >
        {input}
        {actions}
      </Dialog>
      <Popup
        visible={target === 'popup'}
        position="bottom"
        keyboardAvoiding
        destroyOnClosed
        closeOnPressOverlay
        onRequestClose={() => setTarget(null)}
        styles={{ wrapper: { paddingBottom: toolbarHeight }, container: { padding: 20, gap: 12 } }}
      >
        <Text>Teleport 父级受控输入</Text>
        <View style={{ gap: 12 }}>
          {input}
          {actions}
        </View>
        <Button
          onPress={() => {
            setSubmitted(value)
            setTarget(null)
          }}
        >
          提交并关闭
        </Button>
      </Popup>
    </View>
  )
}
