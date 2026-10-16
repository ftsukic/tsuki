import { FixtureKeyboardToolbarContext } from '../keyboard-toolbar-context'
import { forwardRef, useImperativeHandle, useContext, useRef, useState } from 'react'
import { ScrollView, TextInput, View } from 'react-native'
import { Button, Dialog, Input, Popup, Text } from '../../..'

interface ImeFormRef {
  setValue: (value: string) => void
}

const LocalImeForm = forwardRef<ImeFormRef>(function LocalImeForm(_props, ref) {
  const [nativeValue, setNativeValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  useImperativeHandle(
    ref,
    () => ({
      setValue(value) {
        setNativeValue(value)
        setInputValue(value)
      },
    }),
    [],
  )
  return (
    <View style={{ gap: 12 }}>
      <Text>编辑状态位于当前表单内，连续输入 zhongguo 并选“中国”。</Text>
      <Text>原生 TextInput（受控）</Text>
      <TextInput
        multiline
        value={nativeValue}
        onChangeText={setNativeValue}
        placeholder="原生输入框"
        style={{ minHeight: 80, borderWidth: 1, borderColor: '#999', padding: 12 }}
      />
      <Text>Tsuki Input（受控）</Text>
      <Input
        multiline
        rows={3}
        bordered
        value={inputValue}
        onChangeText={setInputValue}
        placeholder="Tsuki 输入框"
      />
      <Text>原生事件值：{nativeValue}</Text>
      <Text>Input 事件值：{inputValue}</Text>
    </View>
  )
})

/**
 * @title 中文组合输入对照
 * @description 对比原生与 Tsuki、状态在页面父级或表单内部、受控模式和键盘避让。切换条件会重建输入框。
 */
export default function InputImeExample() {
  const toolbarHeight = useContext(FixtureKeyboardToolbarContext)
  const formRef = useRef<ImeFormRef>(null)
  const [localState, setLocalState] = useState(false)
  const [host, setHost] = useState<'page' | 'dialog' | 'popup'>('page')
  const [controlled, setControlled] = useState(false)
  const [avoiding, setAvoiding] = useState(true)
  const [show, setShow] = useState(false)
  const [nativeValue, setNativeValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const form = localState ? (
    <LocalImeForm key={`${host}:${avoiding}`} ref={formRef} />
  ) : (
    <View key={`${host}:${controlled}:${avoiding}`} style={{ gap: 12 }}>
      <Text>输入 zhongguo 后选“中国”，检查拼音是否连续、候选是否保留。</Text>
      <Text>原生 TextInput</Text>
      <TextInput
        multiline
        value={controlled ? nativeValue : undefined}
        defaultValue={controlled ? undefined : ''}
        onChangeText={setNativeValue}
        placeholder="原生输入框"
        style={{ minHeight: 80, borderWidth: 1, borderColor: '#999', padding: 12 }}
      />
      <Text>Tsuki Input</Text>
      <Input
        multiline
        rows={3}
        bordered
        value={controlled ? inputValue : undefined}
        defaultValue={controlled ? undefined : ''}
        onChangeText={setInputValue}
        placeholder="Tsuki 输入框"
      />
      <Text>原生事件值：{nativeValue}</Text>
      <Text>Input 事件值：{inputValue}</Text>
    </View>
  )
  return (
    <View style={{ gap: 12 }}>
      <Button onPress={() => setLocalState(!localState)}>
        状态位置：{localState ? '表单内部（受控）' : '页面父级（对照）'}
      </Button>
      {localState ? (
        <>
          <Button onPress={() => formRef.current?.setValue('外部赋值')}>外部赋值</Button>
          <Button onPress={() => formRef.current?.setValue('')}>外部重置</Button>
        </>
      ) : null}
      <Button disabled={localState} onPress={() => setControlled(!controlled)}>
        当前：{controlled ? '受控' : '非受控'}
      </Button>
      <Button onPress={() => setAvoiding(!avoiding)}>避让：{avoiding ? '开启' : '关闭'}</Button>
      {(['page', 'dialog', 'popup'] as const).map((next) => (
        <Button
          key={next}
          onPress={() => {
            setHost(next)
            setNativeValue('')
            setInputValue('')
            setShow(next !== 'page')
          }}
        >
          {next}
        </Button>
      ))}
      {host === 'page' ? form : null}
      <Dialog
        show={host === 'dialog' && show}
        title="中文输入对照"
        styles={{ wrapper: { paddingBottom: toolbarHeight * 2 } }}
        keyboardAvoiding={avoiding}
        onShowChange={setShow}
      >
        {form}
      </Dialog>
      <Popup
        visible={host === 'popup' && show}
        keyboardAvoiding={avoiding}
        position="bottom"
        destroyOnClosed
        styles={{ wrapper: { paddingBottom: toolbarHeight }, container: { padding: 20, gap: 12 } }}
      >
        <ScrollView style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled">
          {form}
        </ScrollView>
        <Button onPress={() => setShow(false)}>关闭</Button>
      </Popup>
    </View>
  )
}
