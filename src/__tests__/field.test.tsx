import {
  Checkbox,
  ConfigProvider,
  Field,
  FieldCheckbox,
  FieldInput,
  FieldPicker,
  FieldRadio,
  getDesignToken,
  getFieldToken,
  InteractionPressable,
  Provider,
  Radio,
} from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { createRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { PickerValue } from '../picker'
import type { TextInputInstance } from '../text-input'

interface JsonNode {
  children?: JsonNode[] | null
  props: Record<string, unknown>
  type: string
}

function findNodes(value: unknown, predicate: (node: JsonNode) => boolean): JsonNode[] {
  if (Array.isArray(value)) return value.flatMap((item) => findNodes(item, predicate))
  if (!value || typeof value !== 'object' || !('props' in value)) return []
  const node = value as JsonNode
  return (predicate(node) ? [node] : []).concat(findNodes(node.children, predicate))
}

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

describe('Field', () => {
  it('renders a Cell-based custom control and shares the value contract', async () => {
    const onChange = jest.fn()

    await render(
      <Field<string>
        label="城市"
        value="上海"
        onChange={onChange}
        description="请选择常用城市"
        errorMessage="城市不能为空"
        status="error"
      >
        {({ value, onChange: handleChange }) => (
          <InteractionPressable testID="custom-control" onPress={() => handleChange('北京')}>
            <View testID={`value-${value}`} />
          </InteractionPressable>
        )}
      </Field>,
    )

    expect(screen.getByTestId('value-上海')).toBeTruthy()
    expect(screen.getByText('请选择常用城市')).toBeTruthy()
    expect(screen.getByText('城市不能为空')).toBeTruthy()
    expect(findNodes(screen.toJSON(), (node) => node.type === 'TextInput')).toHaveLength(0)

    await press(screen.getByTestId('custom-control'))
    expect(onChange).toHaveBeenCalledWith('北京')
  })

  it('supports uncontrolled values and exposes disabled/readOnly context', async () => {
    const onChange = jest.fn()

    await render(
      <>
        <Field<string> defaultValue="初始值" onChange={onChange}>
          {({ value, onChange: handleChange }) => (
            <InteractionPressable testID="uncontrolled" onPress={() => handleChange('新值')}>
              <View testID={`uncontrolled-value-${value}`} />
            </InteractionPressable>
          )}
        </Field>
        <Field<boolean> value readOnly disabled status="warning">
          {({ disabled, readOnly, status }) => (
            <View testID={`context-${disabled}-${readOnly}-${status}`} />
          )}
        </Field>
      </>,
    )

    expect(screen.getByTestId('uncontrolled-value-初始值')).toBeTruthy()
    await press(screen.getByTestId('uncontrolled'))
    expect(onChange).toHaveBeenCalledWith('新值')
    expect(await screen.findByTestId('uncontrolled-value-新值')).toBeTruthy()
    expect(screen.getByTestId('context-true-true-warning')).toBeTruthy()
  })

  it('applies Field layout and semantic styles without changing Cell', async () => {
    const theme = getDesignToken()
    const fieldToken = getFieldToken(theme)

    await render(
      <Field<string>
        label="手机号"
        labelWidth={180}
        labelAlign="right"
        errorMessage="请输入手机号"
        styles={{ error: { fontStyle: 'italic' } }}
      >
        <View testID="layout-control" />
      </Field>,
    )

    expect(
      StyleSheet.flatten(screen.getByText('手机号').parent?.parent?.props.style),
    ).toMatchObject({
      width: 180,
      flexShrink: 0,
    })
    expect(StyleSheet.flatten(screen.getByText('请输入手机号').props.style)).toMatchObject({
      color: theme.colorError,
      fontStyle: 'italic',
    })
    expect(fieldToken.defaultLabelWidth).toBeCloseTo(theme.fontSize * 6.2)
  })
})

describe('FieldInput', () => {
  it('maps flat Input props and the Field value contract', async () => {
    const onChange = jest.fn()

    await render(
      <FieldInput
        label="手机号"
        value="138"
        onChange={onChange}
        placeholder="请输入手机号"
        testID="field-input"
        valueAlign="left"
      />,
    )

    const input = screen.getByTestId('field-input')
    expect(input.props.placeholder).toBe('请输入手机号')
    expect(input.props.value).toBe('138')
    expect(input.props.textAlign).toBe('left')

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, '139')
    expect(onChange).toHaveBeenLastCalledWith('139')
  })

  it('supports uncontrolled values and keeps the embedded Input surface flat', async () => {
    const view = await render(
      <FieldInput
        label="备注"
        defaultValue="初始"
        onChange={() => undefined}
        multiline
        vertical
        testID="textarea-input"
      />,
    )

    expect(screen.getByTestId('textarea-input').props.value).toBe('初始')
    const embeddedShells = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return (
        style?.backgroundColor === 'transparent' &&
        style?.borderRadius === 0 &&
        style?.borderWidth === 0
      )
    })
    expect(embeddedShells.length).toBeGreaterThan(0)
  })

  it('gives Field disabled/readOnly precedence over Input state props', async () => {
    await render(
      <>
        <FieldInput label="禁用" disabled testID="disabled-input" editable />
        <FieldInput label="只读" readOnly testID="read-only-input" editable />
      </>,
    )

    expect(screen.getByTestId('disabled-input').props.editable).toBe(false)
    expect(screen.getByTestId('read-only-input').props.editable).toBe(false)
  })

  it('preserves the Input ref on the adapter', async () => {
    const ref = createRef<TextInputInstance>()
    await render(<FieldInput ref={ref} label="姓名" testID="ref-input" />)

    expect(ref.current).toBeTruthy()
    expect(ref.current?.focus).toEqual(expect.any(Function))
    expect(ref.current?.blur).toEqual(expect.any(Function))
  })
})

describe('FieldRadio', () => {
  it('composes Radio.Group with direct children and preserves selection contract', async () => {
    const onChange = jest.fn()

    await render(
      <FieldRadio
        label="尺寸"
        defaultValue="small"
        onChange={onChange}
        testID="radio-group"
        direction="horizontal"
        gap={12}
      >
        <Radio testID="radio-small" value="small">
          小
        </Radio>
        <Radio testID="radio-large" value="large">
          大
        </Radio>
      </FieldRadio>,
    )

    expect(screen.getByTestId('radio-group').props.accessibilityRole).toBe('radiogroup')
    expect(StyleSheet.flatten(screen.getByTestId('radio-group').props.style)).toMatchObject({
      flexDirection: 'row',
      gap: 12,
    })
    expect(screen.getByTestId('radio-small').props.accessibilityState.selected).toBe(true)

    await press(screen.getByTestId('radio-large'))
    expect(onChange).toHaveBeenCalledWith('large')
    expect(screen.getByTestId('radio-large').props.accessibilityState.selected).toBe(true)
  })

  it('supports options and blocks readOnly changes without disabled visuals', async () => {
    const onChange = jest.fn()

    await render(
      <FieldRadio
        label="只读选项"
        value="first"
        readOnly
        onChange={onChange}
        options={[
          { value: 'first', label: '第一项' },
          { value: 'second', label: '第二项' },
        ]}
      />,
    )

    await press(screen.getByText('第二项'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('第一项').parent?.props.accessibilityState?.selected).toBe(true)
  })
})

describe('FieldCheckbox', () => {
  it('composes Checkbox.Group with readonly array values', async () => {
    const onChange = jest.fn()

    await render(
      <FieldCheckbox
        label="通知方式"
        defaultValue={['email']}
        onChange={onChange}
        testID="checkbox-group"
      >
        <Checkbox testID="email" name="email">
          邮件
        </Checkbox>
        <Checkbox testID="sms" name="sms">
          短信
        </Checkbox>
      </FieldCheckbox>,
    )

    expect(screen.getByTestId('email').props.accessibilityState.checked).toBe(true)
    await press(screen.getByTestId('sms'))
    expect(onChange).toHaveBeenCalledWith(['email', 'sms'])
    expect(screen.getByTestId('sms').props.accessibilityState.checked).toBe(true)
  })

  it('passes disabled to Checkbox.Group and keeps readOnly controls visually enabled', async () => {
    const onChange = jest.fn()

    await render(
      <FieldCheckbox
        label="只读"
        value={['email']}
        readOnly
        onChange={onChange}
        testID="read-only-checkbox-group"
      >
        <Checkbox testID="read-only-checkbox" name="email">
          邮件
        </Checkbox>
      </FieldCheckbox>,
    )

    await press(screen.getByTestId('read-only-checkbox'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('read-only-checkbox').props.accessibilityState.disabled).toBe(false)
  })
})

describe('FieldPicker', () => {
  const options = [
    { text: '上海', value: 'shanghai' },
    { text: '北京', value: 'beijing' },
  ] as const

  it('uses selected option text and commits only after Picker confirmation', async () => {
    const onChange = jest.fn()

    function Harness() {
      const [value, setValue] = useState<readonly PickerValue[]>(['shanghai'])
      return (
        <Provider theme={{ token: { motion: false } }}>
          <FieldPicker
            label="城市"
            value={value}
            onChange={(nextValue) => {
              onChange(nextValue)
              setValue(nextValue)
            }}
            columns={options}
            title="选择城市"
            testID="field-picker"
          />
        </Provider>
      )
    }

    await render(<Harness />)
    expect(screen.getByText('上海')).toBeTruthy()

    await press(screen.getAllByText('上海')[0])
    expect(screen.getByTestId('picker-toolbar')).toBeTruthy()
    await press(screen.getByTestId('picker-item-0-1'))
    expect(screen.getByText('北京')).toBeTruthy()
    expect(screen.getAllByText('上海').length).toBeGreaterThan(0)
    expect(onChange).not.toHaveBeenCalled()

    await press(screen.getByTestId('picker-cancel'))
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
    expect(screen.getByText('上海')).toBeTruthy()

    await press(screen.getAllByText('上海')[0])
    await press(screen.getByTestId('picker-item-0-1'))
    await press(screen.getByTestId('picker-confirm'))

    expect(await screen.findByText('北京')).toBeTruthy()
    expect(onChange).toHaveBeenCalledWith(['beijing'])
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
  })

  it('supports placeholder and formatValue while keeping Picker values readonly', async () => {
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <FieldPicker label="城市" columns={options} placeholder="请选择城市" />
        <FieldPicker
          label="格式化城市"
          columns={options}
          defaultValue={['shanghai']}
          formatValue={(selectedOptions, values) =>
            `${selectedOptions[0]?.text ?? '无'}:${String(values[0] ?? 'empty')}`
          }
        />
      </Provider>,
    )

    expect(screen.getByText('请选择城市')).toBeTruthy()
    expect(screen.getByText('上海:shanghai')).toBeTruthy()
  })
})

describe('Field exports', () => {
  it('exports the Field adapters from the package entry', () => {
    expect(Field).toBeDefined()
    expect(FieldInput).toBeDefined()
    expect(FieldRadio).toBeDefined()
    expect(FieldCheckbox).toBeDefined()
    expect(FieldPicker).toBeDefined()
    expect(ConfigProvider).toEqual(expect.any(Function))
  })
})
