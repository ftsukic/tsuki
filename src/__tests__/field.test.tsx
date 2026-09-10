import { ConfigProvider, Field, getDesignToken } from '..'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { createRef } from 'react'
import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { TextInputInstance } from '../text-input'

interface JsonNode {
  children?: JsonNode[] | null
  props: Record<string, unknown>
  type: string
}

function findFirstRow(value: unknown): JsonNode | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findFirstRow(item)
      if (match) return match
    }
    return null
  }

  if (!value || typeof value !== 'object' || !('props' in value)) return null

  const node = value as JsonNode
  const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}
  if (style.flexDirection === 'row') return node

  return findFirstRow(node.children)
}

describe('Field', () => {
  it('creates a default Input and forwards input props', async () => {
    const onChangeText = jest.fn()

    await render(
      <Field
        label="手机号"
        placeholder="请输入手机号"
        testID="field-input"
        value="138"
        onChangeText={onChangeText}
      />,
    )

    const input = screen.getByTestId('field-input')
    expect(input.props.placeholder).toBe('请输入手机号')
    expect(input.props.value).toBe('138')

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, '139')
    expect(onChangeText).toHaveBeenLastCalledWith('139')
  })

  it('uses Cell geometry for the field row and keeps the input in the value column', async () => {
    const view = await render(<Field label="姓名" placeholder="请输入姓名" />)

    const row = findFirstRow(view.toJSON())
    expect(row).not.toBeNull()
    expect(StyleSheet.flatten(row?.props.style as StyleProp<ViewStyle>)).toMatchObject({
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 10,
    })
    expect(screen.getByPlaceholderText('请输入姓名')).toBeTruthy()
  })

  it('forwards disabled and clearable behavior to the default Input', async () => {
    const onClear = jest.fn()

    await render(
      <>
        <Field label="禁用" disabled testID="disabled-field" />
        <Field
          label="手机号"
          clearable
          clearTrigger="always"
          defaultValue="138"
          onClear={onClear}
          testID="clearable-field"
        />
      </>,
    )

    expect(screen.getByTestId('disabled-field').props.editable).toBe(false)
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.press(screen.getByLabelText('清除输入'))

    expect(onClear).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByTestId('clearable-field').props.value).toBe(''))
  })

  it('forwards multiline layout props to the default Input', async () => {
    await render(<Field label="备注" multiline rows={3} testID="textarea-field" />)

    const input = screen.getByTestId('textarea-field')
    expect(input.props.multiline).toBe(true)
    expect(input.props.numberOfLines).toBe(3)
  })

  it('uses custom children instead of rendering a default Input', async () => {
    await render(
      <Field label="城市" placeholder="默认输入">
        <View testID="custom-control" />
      </Field>,
    )

    expect(screen.getByTestId('custom-control')).toBeTruthy()
    expect(screen.queryByPlaceholderText('默认输入')).toBeNull()
  })

  it('derives error status from errorMessage and keeps the label color neutral', async () => {
    await render(<Field label="手机号" errorMessage="请输入手机号" />)

    const theme = getDesignToken()
    expect(StyleSheet.flatten(screen.getByText('手机号').props.style)).toEqual(
      expect.objectContaining({ color: theme.colorText }),
    )
    expect(StyleSheet.flatten(screen.getByText('请输入手机号').props.style)).toEqual(
      expect.objectContaining({ color: theme.colorError }),
    )
  })

  it('supports label width, alignment, colon and required marker', async () => {
    await render(<Field label="备注" required colon labelWidth={96} labelAlign="right" />)

    expect(screen.getByText('备注:')).toBeTruthy()
    expect(screen.getByText('*')).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByText('备注:').props.style)).toEqual(
      expect.objectContaining({ flex: 1, textAlign: 'right' }),
    )
  })

  it('applies Field token overrides to feedback styles', async () => {
    await render(
      <ConfigProvider
        theme={{
          components: {
            Field: { errorColor: '#123456', height: 56 },
          },
        }}
      >
        <Field label="邮箱" errorMessage="邮箱格式错误" />
      </ConfigProvider>,
    )

    expect(StyleSheet.flatten(screen.getByText('邮箱格式错误').props.style)).toEqual(
      expect.objectContaining({ color: '#123456' }),
    )
    expect(StyleSheet.flatten(screen.getByText('邮箱').props.style)).not.toEqual(
      expect.objectContaining({ color: '#123456' }),
    )
  })

  it('exposes the default Input TextInput instance through ref', async () => {
    const ref = createRef<TextInputInstance>()

    await render(<Field ref={ref} label="用户名" testID="ref-field" />)

    expect(ref.current).toBeTruthy()
    expect(ref.current?.focus).toEqual(expect.any(Function))
    expect(ref.current?.blur).toEqual(expect.any(Function))
    expect(() => ref.current?.focus()).not.toThrow()
    expect(() => ref.current?.blur()).not.toThrow()
  })
})
