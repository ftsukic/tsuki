import * as packageExports from '..'
import {
  Checkbox,
  ConfigProvider,
  FieldCheckbox,
  FieldInput,
  FieldPicker,
  FieldRadio,
  getDesignToken,
  getFieldToken,
  Provider,
  Radio,
} from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { createRef, useState } from 'react'
import { StyleSheet } from 'react-native'
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

describe('FieldInput', () => {
  it('centers the Cell row by default', async () => {
    const view = await render(<FieldInput label="用户名" defaultValue="张三" />)
    const cellRows = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return (
        style?.flexDirection === 'row' &&
        style?.paddingHorizontal === 16 &&
        style?.paddingVertical === 10 &&
        style?.minHeight === 44
      )
    })

    expect(cellRows).toHaveLength(1)
    expect(StyleSheet.flatten(cellRows[0].props.style as StyleProp<ViewStyle>)).toMatchObject({
      alignItems: 'center',
    })
  })

  it('composes Cell and Input while keeping the value contract', async () => {
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
    expect(screen.getByText('手机号')).toBeTruthy()

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(input, '139')
    expect(onChange).toHaveBeenLastCalledWith('139')
  })

  it('supports uncontrolled multiline values and keeps the embedded Input flat', async () => {
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
    expect(screen.getByTestId('textarea-input').props.textAlign).toBe('left')
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

  it('applies label width and alignment through Cell styles', async () => {
    const theme = getDesignToken()
    const fieldToken = getFieldToken(theme)

    const view = await render(<FieldInput label="手机号" labelWidth={180} labelAlign="right" />)

    const labelAreas = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return style?.width === 180 && style?.flexShrink === 0
    })
    expect(labelAreas.length).toBeGreaterThan(0)
    expect(StyleSheet.flatten(screen.getByText('手机号').props.style)).toMatchObject({
      textAlign: 'right',
    })
    expect(fieldToken.defaultLabelWidth).toBeCloseTo(theme.fontSize * 6.2)
  })

  it('gives FieldInput disabled/readOnly state precedence and preserves the ref', async () => {
    const ref = createRef<TextInputInstance>()

    await render(
      <>
        <FieldInput label="禁用" disabled testID="disabled-input" editable />
        <FieldInput label="只读" readOnly testID="read-only-input" editable />
        <FieldInput ref={ref} label="姓名" testID="ref-input" />
      </>,
    )

    expect(screen.getByTestId('disabled-input').props.editable).toBe(false)
    expect(screen.getByTestId('read-only-input').props.editable).toBe(false)
    expect(ref.current).toBeTruthy()
    expect(ref.current?.focus).toEqual(expect.any(Function))
    expect(ref.current?.blur).toEqual(expect.any(Function))
  })
})

describe('FieldRadio', () => {
  it('composes Cell with Radio.Group and preserves selection', async () => {
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

  it('uses equal-width button options by default and wraps them through Grid', async () => {
    const view = await render(
      <FieldRadio
        label="尺寸"
        variant="button"
        direction="horizontal"
        buttonColumns={5}
        testID="field-radio-grid"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <Radio key={index} testID={`field-radio-${index}`} value={index}>
            {index === 0 ? '一个很长的选项' : `选项 ${index}`}
          </Radio>
        ))}
      </FieldRadio>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('field-radio-0').props.style)).toMatchObject({
      alignSelf: 'stretch',
      flexGrow: 0,
      flexShrink: 0,
      width: '100%',
    })
    expect(screen.getByText('一个很长的选项').props.numberOfLines).toBe(1)
    expect(
      findNodes(view.toJSON(), (node) => {
        const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
        return style?.flexBasis === '20%'
      }),
    ).toHaveLength(8)
  })

  it('delegates value alignment to Cell without an extra control wrapper', async () => {
    await render(
      <>
        <FieldRadio
          label="横向"
          testID="horizontal-radio-group"
          direction="horizontal"
          options={[{ value: 'one', label: '一' }]}
        />
        <FieldRadio
          label="纵向"
          vertical
          testID="vertical-radio-group"
          direction="horizontal"
          options={[{ value: 'one', label: '一' }]}
        />
      </>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('horizontal-radio-group').parent?.props.style),
    ).toMatchObject({ justifyContent: 'flex-end' })
    expect(
      StyleSheet.flatten(screen.getByTestId('vertical-radio-group').parent?.props.style),
    ).toMatchObject({ justifyContent: 'flex-start' })
  })

  it('blocks readOnly changes without applying disabled visuals', async () => {
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
  it('composes Cell with Checkbox.Group and keeps an array value', async () => {
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

  it('passes options to Checkbox.Group and preserves option disabled state', async () => {
    const onChange = jest.fn()

    await render(
      <FieldCheckbox
        label="通知方式"
        defaultValue={['email']}
        onChange={onChange}
        options={[
          { value: 'email', label: '邮件' },
          { value: 'sms', label: '短信' },
          { value: 'locked', label: '锁定', disabled: true },
        ]}
      />,
    )

    expect(screen.getByText('邮件').parent?.props.accessibilityState?.checked).toBe(true)
    await press(screen.getByText('短信'))
    expect(onChange).toHaveBeenCalledWith(['email', 'sms'])
    await press(screen.getByText('锁定'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('delegates value alignment to Cell without an extra control wrapper', async () => {
    await render(
      <>
        <FieldCheckbox label="横向" testID="horizontal-checkbox-group" direction="horizontal">
          <Checkbox name="one">一</Checkbox>
        </FieldCheckbox>
        <FieldCheckbox
          label="纵向"
          vertical
          testID="vertical-checkbox-group"
          direction="horizontal"
        >
          <Checkbox name="one">一</Checkbox>
        </FieldCheckbox>
      </>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('horizontal-checkbox-group').parent?.props.style),
    ).toMatchObject({ justifyContent: 'flex-end' })
    expect(
      StyleSheet.flatten(screen.getByTestId('vertical-checkbox-group').parent?.props.style),
    ).toMatchObject({ justifyContent: 'flex-start' })
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

  it('uses equal-width button options and wraps them through the existing Grid', async () => {
    const view = await render(
      <FieldCheckbox
        label="通知方式"
        variant="button"
        direction="horizontal"
        buttonColumns={5}
        testID="field-checkbox-grid"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <Checkbox key={index} testID={`field-checkbox-${index}`} name={index}>
            {index === 0 ? '一个很长的选项' : `选项 ${index}`}
          </Checkbox>
        ))}
      </FieldCheckbox>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('field-checkbox-0').props.style)).toMatchObject({
      width: '100%',
      flexGrow: 0,
      flexShrink: 0,
    })
    expect(
      findNodes(view.toJSON(), (node) => {
        const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
        return style?.flexBasis === '20%'
      }),
    ).toHaveLength(8)
  })
})

describe('FieldPicker', () => {
  const options = [
    { text: '上海', value: 'shanghai' },
    { text: '北京', value: 'beijing' },
  ] as const

  it('keeps draft changes local and commits only after Picker confirmation', async () => {
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

  it('supports placeholder and formatValue while keeping Picker separate from Cell', async () => {
    const view = await render(
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
    expect(findNodes(view.toJSON(), (node) => node.type === 'Picker')).toHaveLength(0)
  })
})

describe('Field exports', () => {
  it('exports concrete adapters without exporting the runtime Field component', () => {
    expect(packageExports).not.toHaveProperty('Field')
    expect(FieldInput).toBeDefined()
    expect(FieldRadio).toBeDefined()
    expect(FieldCheckbox).toBeDefined()
    expect(FieldPicker).toBeDefined()
    expect(ConfigProvider).toEqual(expect.any(Function))
  })
})

describe('Field style helpers', () => {
  it('uses the shared Field token for adapter-only feedback styles', () => {
    const theme = getDesignToken()
    const token = getFieldToken(theme)

    expect(token.descriptionColor).toBe(theme.colorTextSecondary)
    expect(token.errorColor).toBe(theme.colorError)
    expect(token.warningColor).toBe(theme.colorWarning)
  })
})
