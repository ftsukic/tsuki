import * as packageExports from '..'
import {
  Checkbox,
  ConfigProvider,
  FieldCheckbox,
  FieldDatePicker,
  FieldInput,
  FieldPicker,
  FieldRadio,
  FieldSwitch,
  getDesignToken,
  getFieldToken,
  Provider,
  Radio,
} from '..'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { createRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import { getInputToken } from '../input/token'
import { getTextareaMetrics } from '../input/style'
import type { StyleProp, ViewStyle } from 'react-native'
import type { PickerValue } from '../picker'
import type { DatePickerValue } from '../date-picker'
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

  it('keeps the embedded Input flat while Cell owns the field spacing', async () => {
    const view = await render(<FieldInput label="手机号" testID="bordered-field-input" />)
    const cellRows = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return style?.paddingHorizontal === 16 && style?.paddingVertical === 10
    })
    expect(cellRows).toHaveLength(1)

    const input = screen.getByTestId('bordered-field-input')
    expect(StyleSheet.flatten(input.props.style)).toMatchObject({
      paddingHorizontal: 0,
      paddingVertical: 0,
    })

    const embeddedShells = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return (
        style?.flexDirection === 'row' &&
        style?.paddingHorizontal === 0 &&
        style?.borderWidth === 0 &&
        style?.borderRadius === 0 &&
        style?.backgroundColor === 'transparent'
      )
    })
    expect(embeddedShells).toHaveLength(1)
  })

  it('supports uncontrolled multiline values with Cell spacing outside the embedded Input', async () => {
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
    const textareaMetrics = getTextareaMetrics(getInputToken(getDesignToken()), 'normal')
    const inputStyle = StyleSheet.flatten(screen.getByTestId('textarea-input').props.style)
    expect(inputStyle).toMatchObject({
      paddingHorizontal: 0,
      paddingTop: textareaMetrics.paddingVertical,
      paddingBottom: textareaMetrics.paddingVertical,
      minHeight: textareaMetrics.lineHeight * 2 + textareaMetrics.paddingVertical * 2,
    })
    const embeddedShells = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return (
        style?.flexDirection === 'row' &&
        style?.paddingHorizontal === textareaMetrics.paddingHorizontal &&
        style?.borderWidth === 0 &&
        style?.borderRadius === 0 &&
        style?.backgroundColor === 'transparent'
      )
    })
    expect(embeddedShells).toHaveLength(1)
  })

  it('allows an explicit embedded Input border without restoring its padding', async () => {
    const token = getInputToken(getDesignToken())
    const view = await render(
      <FieldInput label="手机号" bordered testID="explicit-bordered-field-input" />,
    )
    const shells = findNodes(view.toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
      return style?.borderWidth === token.borderWidth && style?.borderRadius === token.borderRadius
    })

    expect(shells).toHaveLength(1)
    expect(
      StyleSheet.flatten(screen.getByTestId('explicit-bordered-field-input').props.style),
    ).toMatchObject({
      paddingHorizontal: 0,
      paddingVertical: 0,
    })
  })

  it('uses textarea metrics for autoSize inside FieldInput', async () => {
    await render(
      <FieldInput
        label="备注"
        vertical
        multiline
        autoSize={{ minRows: 1, maxRows: 5 }}
        defaultValue="初始"
        testID="embedded-auto-size"
      />,
    )
    const input = screen.getByTestId('embedded-auto-size')
    const measurementInput = screen.getByTestId('embedded-auto-size__measure', {
      includeHiddenElements: true,
    })

    expect(StyleSheet.flatten(input.props.style)).toMatchObject({
      minHeight: 36,
      height: 36,
      maxHeight: 116,
    })

    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent(measurementInput, 'contentSizeChange', {
      nativeEvent: { contentSize: { width: 200, height: 200 } },
    })
    await waitFor(() => expect(StyleSheet.flatten(input.props.style).height).toBe(116))
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
    expect(StyleSheet.flatten(labelAreas[0].props.style as StyleProp<ViewStyle>)).toMatchObject({
      width: 180,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 'auto',
    })
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

  it('passes buttonVariant from FieldRadio to its Radio.Group', async () => {
    await render(
      <FieldRadio
        label="样式"
        variant="button"
        buttonVariant="outline"
        options={[{ value: 'outline', label: 'Outline' }]}
      />,
    )

    expect(StyleSheet.flatten(screen.getByText('Outline').parent?.props.style)).toMatchObject({
      backgroundColor: 'transparent',
      borderWidth: 1,
    })
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

  it('passes buttonVariant from FieldCheckbox to its Checkbox.Group', async () => {
    await render(
      <FieldCheckbox
        label="样式"
        variant="button"
        buttonVariant="text"
        options={[{ value: 'text', label: 'Text' }]}
      />,
    )

    expect(StyleSheet.flatten(screen.getByText('Text').parent?.props.style)).toMatchObject({
      backgroundColor: 'transparent',
      borderWidth: 0,
    })
  })
})

describe('FieldSwitch', () => {
  it('composes Cell with Switch and supports uncontrolled values', async () => {
    const onChange = jest.fn()

    await render(
      <FieldSwitch label="通知" defaultValue={false} onChange={onChange} testID="field-switch" />,
    )

    const fieldSwitch = screen.getByTestId('field-switch')
    expect(fieldSwitch.props.accessibilityState.checked).toBe(false)

    await press(fieldSwitch)

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('field-switch').props.accessibilityState.checked).toBe(true)
  })

  it('preserves custom active and inactive value types', async () => {
    const onChange = jest.fn()

    await render(
      <FieldSwitch
        label="连接"
        defaultValue="off"
        activeValue="on"
        inactiveValue="off"
        onChange={onChange}
        testID="custom-field-switch"
      />,
    )

    await press(screen.getByTestId('custom-field-switch'))

    expect(onChange).toHaveBeenCalledWith('on')
  })

  it('blocks readOnly interaction without applying disabled semantics', async () => {
    const onChange = jest.fn()

    await render(
      <FieldSwitch
        label="只读"
        defaultValue={false}
        readOnly
        onChange={onChange}
        testID="read-only-field-switch"
      />,
    )

    const fieldSwitch = screen.getByTestId('read-only-field-switch')
    await press(fieldSwitch)

    expect(onChange).not.toHaveBeenCalled()
    expect(fieldSwitch.props.accessibilityState.disabled).toBe(false)
  })

  it('passes disabled to Cell and Switch', async () => {
    const onChange = jest.fn()

    await render(
      <FieldSwitch
        label="禁用"
        defaultValue={false}
        disabled
        onChange={onChange}
        testID="disabled-field-switch"
      />,
    )

    const fieldSwitch = screen.getByTestId('disabled-field-switch')
    await press(fieldSwitch)

    expect(fieldSwitch.props.accessibilityState.disabled).toBe(true)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('passes beforeChange to Switch', async () => {
    const onChange = jest.fn()

    await render(
      <FieldSwitch
        label="确认"
        defaultValue={false}
        beforeChange={() => false}
        onChange={onChange}
        testID="before-change-field-switch"
      />,
    )

    await press(screen.getByTestId('before-change-field-switch'))

    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('FieldPicker', () => {
  const options = [
    { text: '上海', value: 'shanghai' },
    { text: '北京', value: 'beijing' },
  ] as const

  it('keeps draft changes local and commits only after Picker confirmation', async () => {
    const onChange = jest.fn()
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((value, _config, callback) => {
        callback?.(true)
        return value as never
      })

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
    timing.mockRestore()
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

describe('FieldDatePicker', () => {
  const value: DatePickerValue = ['2026', '09', '13']
  const bounds = {
    maxDate: new Date(2026, 11, 31, 23, 59, 59),
    minDate: new Date(2026, 0, 1),
  }

  it('keeps date draft changes local until confirmation', async () => {
    const onChange = jest.fn()
    const timing = jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation((nextValue, _config, callback) => {
        callback?.(true)
        return nextValue as never
      })

    function Harness() {
      const [currentValue, setCurrentValue] = useState<DatePickerValue>(value)
      return (
        <Provider theme={{ token: { motion: false } }}>
          <FieldDatePicker
            label="日期"
            value={currentValue}
            onChange={(nextValue) => {
              onChange(nextValue)
              setCurrentValue(nextValue)
            }}
            {...bounds}
          />
        </Provider>
      )
    }

    await render(<Harness />)
    expect(screen.getByText('2026-09-13')).toBeTruthy()

    await press(screen.getByText('2026-09-13'))
    expect(screen.getByTestId('picker-toolbar')).toBeTruthy()
    await press(screen.getByTestId('picker-item-2-1'))
    expect(screen.getByTestId('picker-item-2-1').props.accessibilityState.selected).toBe(true)
    expect(screen.getAllByText('2026-09-13').length).toBeGreaterThan(0)
    expect(onChange).not.toHaveBeenCalled()

    await press(screen.getByTestId('picker-cancel'))
    expect(screen.queryByTestId('picker-toolbar')).toBeNull()
    expect(screen.getByText('2026-09-13')).toBeTruthy()

    await press(screen.getByText('2026-09-13'))
    await press(screen.getByTestId('picker-item-2-1'))
    await press(screen.getByTestId('picker-confirm'))

    expect(await screen.findByText('2026-09-02')).toBeTruthy()
    expect(onChange).toHaveBeenCalledWith(['2026', '09', '02'])
    timing.mockRestore()
  })

  it('supports placeholder, formatValue, and date picker props', async () => {
    await render(
      <Provider theme={{ token: { motion: false } }}>
        <FieldDatePicker label="日期" placeholder="请选择日期" {...bounds} />
        <FieldDatePicker
          label="格式化日期"
          defaultValue={['2026', '09']}
          formatValue={(_options, values) => values.join('/')}
          columnsType={['year', 'month']}
          {...bounds}
        />
      </Provider>,
    )

    expect(screen.getByText('请选择日期')).toBeTruthy()
    expect(screen.getByText('2026/09')).toBeTruthy()
  })
})

describe('Field exports', () => {
  it('exports concrete adapters without exporting the runtime Field component', () => {
    expect(packageExports).not.toHaveProperty('Field')
    expect(FieldInput).toBeDefined()
    expect(FieldRadio).toBeDefined()
    expect(FieldCheckbox).toBeDefined()
    expect(FieldSwitch).toBeDefined()
    expect(FieldPicker).toBeDefined()
    expect(FieldDatePicker).toBeDefined()
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
