import { ConfigProvider, Field, getDesignToken, getFieldToken } from '..'
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

function findNodes(value: unknown, predicate: (node: JsonNode) => boolean): JsonNode[] {
  if (Array.isArray(value)) return value.flatMap((item) => findNodes(item, predicate))
  if (!value || typeof value !== 'object' || !('props' in value)) return []
  const node = value as JsonNode
  return (predicate(node) ? [node] : []).concat(findNodes(node.children, predicate))
}

describe('Field', () => {
  it('maps value and onChange to the default Input and keeps Input props explicit', async () => {
    const onChange = jest.fn()

    await render(
      <Field
        label="手机号"
        value="138"
        onChange={onChange}
        inputProps={{ placeholder: '请输入手机号', testID: 'field-input' }}
      />,
    )

    const input = screen.getByTestId('field-input')
    expect(input.props.placeholder).toBe('请输入手机号')
    expect(input.props.value).toBe('138')

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, '139')
    expect(onChange).toHaveBeenLastCalledWith('139')
  })

  it('supports uncontrolled defaultValue through the Field value contract', async () => {
    const onChange = jest.fn()

    await render(
      <Field
        label="昵称"
        defaultValue="初始值"
        onChange={onChange}
        inputProps={{ testID: 'uncontrolled-input' }}
      />,
    )

    const input = screen.getByTestId('uncontrolled-input')
    expect(input.props.value).toBe('初始值')
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, '新值')
    expect(onChange).toHaveBeenLastCalledWith('新值')
    await waitFor(() => expect(screen.getByTestId('uncontrolled-input').props.value).toBe('新值'))
  })

  it('uses Cell geometry and keeps the default Input in the value area', async () => {
    const view = await render(<Field label="姓名" inputProps={{ placeholder: '请输入姓名' }} />)

    const row = findFirstRow(view.toJSON())
    expect(row).not.toBeNull()
    expect(StyleSheet.flatten(row?.props.style as StyleProp<ViewStyle>)).toMatchObject({
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 10,
    })
    expect(screen.getByPlaceholderText('请输入姓名')).toBeTruthy()
  })

  it('removes the standalone Input surface inside Field', async () => {
    await render(<Field label="禁用" disabled inputProps={{ testID: 'embedded-input' }} />)

    let current = screen.getByTestId('embedded-input').parent
    let shellStyle: ViewStyle | undefined
    while (current) {
      const style = StyleSheet.flatten(current.props.style as StyleProp<ViewStyle>)
      if (
        style?.backgroundColor === 'transparent' &&
        style?.borderRadius === 0 &&
        style?.borderWidth === 0
      ) {
        shellStyle = style
        break
      }
      current = current.parent
    }

    expect(shellStyle).toEqual(
      expect.objectContaining({
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
      }),
    )
  })

  it('does not create a default Input when custom children are present', async () => {
    await render(
      <Field label="城市" value="上海">
        <View testID="custom-control" />
      </Field>,
    )

    expect(screen.getByTestId('custom-control')).toBeTruthy()
    expect(findNodes(screen.toJSON(), (node) => node.type === 'TextInput')).toHaveLength(0)
  })

  it('passes the Field control context to function children', async () => {
    await render(
      <Field<boolean>
        label="通知"
        value
        disabled
        readOnly
        status="warning"
        onChange={() => undefined}
      >
        {({ value, onChange, disabled, readOnly, status }) => (
          <View testID="context-control">
            <View testID={`value-${String(value)}`} />
            <View testID="has-on-change" onTouchEnd={() => onChange(false)} />
            <View testID={`disabled-${String(disabled)}`} />
            <View testID={`read-only-${String(readOnly)}`} />
            <View testID={`status-${status}`} />
          </View>
        )}
      </Field>,
    )

    expect(screen.getByTestId('value-true')).toBeTruthy()
    expect(screen.getByTestId('has-on-change')).toBeTruthy()
    expect(screen.getByTestId('disabled-true')).toBeTruthy()
    expect(screen.getByTestId('read-only-true')).toBeTruthy()
    expect(screen.getByTestId('status-warning')).toBeTruthy()
  })

  it('supports generic custom values without an Input renderer', async () => {
    const date = new Date('2026-01-01T00:00:00.000Z')

    await render(
      <Field<Date | null> label="生日" value={date}>
        {({ value }) => <View testID={value?.toISOString()} />}
      </Field>,
    )

    expect(screen.getByTestId(date.toISOString())).toBeTruthy()
  })

  it('maps vertical and valueAlign independently', async () => {
    const view = await render(
      <Field
        label="备注"
        vertical
        valueAlign="left"
        inputProps={{ multiline: true, testID: 'vertical-input' }}
      />,
    )

    const rows = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return style.flexDirection === 'row'
    })
    const main = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return style.flexDirection === 'column'
    })

    expect(rows.length).toBeGreaterThan(0)
    expect(main.length).toBeGreaterThan(0)
    expect(screen.getByTestId('vertical-input').props.textAlign).toBe('left')
  })

  it('keeps valueExtra outside the control and renders feedback for custom controls', async () => {
    await render(
      <Field
        label="验证码"
        value=""
        valueExtra={<View testID="value-extra" />}
        errorMessage="请输入验证码"
      >
        <View testID="custom-control" />
      </Field>,
    )

    expect(screen.getByTestId('value-extra')).toBeTruthy()
    expect(screen.getByText('请输入验证码')).toBeTruthy()
  })

  it('uses the Field token default label width and keeps labels neutral on errors', async () => {
    const theme = getDesignToken()
    const fieldToken = getFieldToken(theme)

    expect(fieldToken.defaultLabelWidth).toBeCloseTo(theme.fontSize * 6.2)

    await render(<Field label="手机号" errorMessage="请输入手机号" />)

    const label = screen.getByText('手机号')
    expect(StyleSheet.flatten(label.props.style)).toMatchObject({
      color: theme.colorText,
    })
    expect(StyleSheet.flatten(label.parent?.parent?.props.style)).toMatchObject({
      width: fieldToken.defaultLabelWidth,
      flexShrink: 0,
    })
    expect(StyleSheet.flatten(screen.getByText('请输入手机号').props.style)).toMatchObject({
      color: theme.colorError,
    })
  })

  it('maps Cell interactive props and preserves the default Input ref', async () => {
    const ref = createRef<TextInputInstance>()

    await render(
      <Field
        ref={ref}
        label="城市"
        value="上海"
        isLink
        onPress={() => undefined}
        inputProps={{ testID: 'ref-input' }}
      />,
    )

    expect(screen.getByTestId('ref-input').parent?.parent?.parent).toBeTruthy()
    expect(ref.current).toBeTruthy()
    expect(ref.current?.focus).toEqual(expect.any(Function))
    expect(ref.current?.blur).toEqual(expect.any(Function))
  })

  it('applies Field token overrides only to feedback', async () => {
    await render(
      <ConfigProvider
        theme={{
          components: {
            Field: { errorColor: '#123456' },
          },
        }}
      >
        <Field label="邮箱" errorMessage="邮箱格式错误" />
      </ConfigProvider>,
    )

    expect(StyleSheet.flatten(screen.getByText('邮箱格式错误').props.style)).toMatchObject({
      color: '#123456',
    })
    expect(StyleSheet.flatten(screen.getByText('邮箱').props.style)).not.toMatchObject({
      color: '#123456',
    })
  })
})
