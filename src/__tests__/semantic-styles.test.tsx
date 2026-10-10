import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import {
  Button,
  ConfigProvider,
  FieldInput,
  Input,
  Notify,
  PickerToolbar,
  Tag,
  PortalHost,
} from '..'

const flatten = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style)

describe('semantic style contracts', () => {
  it('merges content text styles with defaults and keeps root style precedence', async () => {
    await render(
      <ConfigProvider>
        <Button
          testID="button"
          style={{ borderRadius: 17 }}
          styles={{ root: { borderRadius: 9 }, content: { letterSpacing: 2 } }}
        >
          按钮
        </Button>
        <Tag testID="tag" styles={{ content: { letterSpacing: 3 } }}>
          标签
        </Tag>
      </ConfigProvider>,
    )
    expect(flatten('button').borderRadius).toBe(17)
    const buttonText = StyleSheet.flatten(screen.getByText('按钮').props.style)
    const tagText = StyleSheet.flatten(screen.getByText('标签').props.style)
    expect(buttonText).toMatchObject({ letterSpacing: 2, fontSize: expect.any(Number) })
    expect(tagText).toMatchObject({ letterSpacing: 3, fontSize: expect.any(Number) })
  })

  it('applies the input root to its shell while keeping native text styling separate', async () => {
    await render(
      <Input
        testID="input"
        style={{ borderRadius: 17 }}
        styles={{ root: { borderRadius: 9 }, input: { letterSpacing: 4 } }}
      />,
    )
    const nativeInput = screen.getByTestId('input')
    expect(StyleSheet.flatten(nativeInput.props.style).letterSpacing).toBe(4)
    expect(StyleSheet.flatten(nativeInput.props.style).borderRadius).not.toBe(17)
    // The shell is separate from the native TextInput and owns the visual border.
    let shell = nativeInput.parent
    while (shell && StyleSheet.flatten(shell.props.style)?.borderRadius !== 17) shell = shell.parent
    expect(shell).toBeTruthy()
  })

  it('lets a composed input override Field layout styling without losing label styles', async () => {
    await render(
      <FieldInput
        title="姓名"
        testID="field-input"
        value="Tsuki"
        styles={{ label: { letterSpacing: 2 }, content: { borderRadius: 9 } }}
        inputProps={{ style: { borderRadius: 17 }, styles: { input: { letterSpacing: 4 } } }}
      />,
    )
    expect(StyleSheet.flatten(screen.getByText('姓名').props.style).letterSpacing).toBe(2)
    const input = screen.getByTestId('field-input')
    expect(StyleSheet.flatten(input.props.style).letterSpacing).toBe(4)
    let shell = input.parent
    while (shell && StyleSheet.flatten(shell.props.style)?.borderRadius !== 17) shell = shell.parent
    expect(shell).toBeTruthy()
  })

  it('styles toolbar text and buttons through one semantic object', async () => {
    await render(
      <PickerToolbar
        title="选择项目"
        styles={{
          root: { borderRadius: 7 },
          title: { letterSpacing: 2 },
          item: { minWidth: 91 },
          itemContent: { fontWeight: '700' },
        }}
      />,
    )
    expect(flatten('picker-toolbar').borderRadius).toBe(7)
    expect(flatten('picker-cancel').minWidth).toBe(91)
    expect(StyleSheet.flatten(screen.getByText('选择项目').props.style).letterSpacing).toBe(2)
    expect(StyleSheet.flatten(screen.getByText('确定').props.style).fontWeight).toBe('700')
  })

  it('keeps notification content styling separate from its root', async () => {
    await render(
      <ConfigProvider theme={{ seed: { motion: false } }}>
        <PortalHost>
          <Notify
            visible
            message="通知"
            styles={{
              root: { opacity: 0.9 },
              container: { borderRadius: 11 },
              content: { letterSpacing: 2 },
            }}
          />
        </PortalHost>
      </ConfigProvider>,
    )
    const content = screen.getByText('通知')
    expect(StyleSheet.flatten(content.props.style).letterSpacing).toBe(2)
    let container = content.parent
    while (container && StyleSheet.flatten(container.props.style)?.borderRadius !== 11)
      container = container.parent
    expect(container).toBeTruthy()
    let root = container?.parent
    while (root && StyleSheet.flatten(root.props.style)?.opacity !== 0.9) root = root.parent
    expect(root).toBeTruthy()
  })
})
