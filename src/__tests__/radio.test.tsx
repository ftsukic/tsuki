import { Radio, RadioGroup, ConfigProvider } from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'

const styleOf = (id: string) => StyleSheet.flatten(screen.getByTestId(id).props.style)

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

function findIndicator(node: JsonNode | null): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  const style = StyleSheet.flatten(node.props.style)
  if (style?.borderWidth === 2 && style?.width === 30) return node

  for (const child of node.children) {
    const indicator = findIndicator(child)
    if (indicator) return indicator
  }

  return undefined
}

describe('Radio', () => {
  it('supports standalone controlled and uncontrolled selection', async () => {
    const controlledChange = jest.fn()
    const uncontrolledChange = jest.fn()
    await render(
      <ConfigProvider>
        <Radio testID="uncontrolled" onChange={uncontrolledChange}>
          默认未选中
        </Radio>
        <Radio testID="controlled" checked={false} onChange={controlledChange}>
          受控
        </Radio>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('uncontrolled').props.accessibilityRole).toBe('radio')
    expect(screen.getByTestId('uncontrolled').props.accessibilityState?.selected).toBe(false)
    await press(screen.getByTestId('uncontrolled'))
    expect(screen.getByTestId('uncontrolled').props.accessibilityState?.selected).toBe(true)
    expect(uncontrolledChange).toHaveBeenCalledWith(true)

    await press(screen.getByTestId('controlled'))
    expect(controlledChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('controlled').props.accessibilityState?.selected).toBe(false)
  })

  it('supports shape, disabled state and semantic styles', async () => {
    const styles = jest.fn(({ state }) => ({
      root: { marginTop: state.checked ? 4 : 2 },
      indicator: { borderWidth: state.disabled ? 3 : 1 },
    }))
    const onChange = jest.fn()
    await render(
      <ConfigProvider>
        <Radio testID="square" shape="square" checkedColor="#ff0000" styles={styles}>
          方形
        </Radio>
        <Radio testID="disabled" disabled onChange={onChange}>
          禁用
        </Radio>
      </ConfigProvider>,
    )

    expect(styleOf('square')).toMatchObject({ marginTop: 2 })
    expect(screen.getByTestId('disabled').props.accessibilityState?.disabled).toBe(true)
    await press(screen.getByTestId('disabled'))
    expect(onChange).not.toHaveBeenCalled()
    expect(styles).toHaveBeenCalled()
  })

  it('supports themed indicator tokens', async () => {
    const { toJSON } = await render(
      <ConfigProvider theme={{ components: { Radio: { indicatorSize: 30, borderWidth: 2 } } }}>
        <Radio testID="themed" checked>
          主题
        </Radio>
      </ConfigProvider>,
    )

    const indicator = findIndicator(toJSON())
    expect(indicator).toBeDefined()
  })

  it('provides single selection for child Radio elements', async () => {
    const onChange = jest.fn()
    await render(
      <ConfigProvider>
        <Radio.Group testID="group" defaultValue="first" onChange={onChange}>
          <Radio testID="first" value="first">
            第一项
          </Radio>
          <Radio testID="second" value="second">
            第二项
          </Radio>
        </Radio.Group>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('group').props.accessibilityRole).toBe('radiogroup')
    expect(screen.getByTestId('first').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.selected).toBe(false)

    await press(screen.getByTestId('second'))
    expect(screen.getByTestId('first').props.accessibilityState?.selected).toBe(false)
    expect(screen.getByTestId('second').props.accessibilityState?.selected).toBe(true)
    expect(onChange).toHaveBeenCalledWith('second')

    await press(screen.getByTestId('second'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('supports options, direction, gap and group disabled state', async () => {
    const onChange = jest.fn()
    await render(
      <ConfigProvider>
        <RadioGroup
          testID="options"
          options={[
            { value: 1, label: '选项一' },
            { value: 2, label: '选项二', disabled: true },
          ]}
          direction="horizontal"
          gap={16}
          onChange={onChange}
        />
        <Radio.Group testID="disabled-group" disabled>
          <Radio testID="group-child" value="disabled" disabled={false}>
            组禁用
          </Radio>
        </Radio.Group>
      </ConfigProvider>,
    )

    expect(styleOf('options')).toMatchObject({ flexDirection: 'row', gap: 16 })
    expect(screen.getByText('选项一')).toBeTruthy()
    expect(screen.getByText('选项二')).toBeTruthy()
    await press(screen.getByText('选项一'))
    expect(onChange).toHaveBeenCalledWith(1)

    expect(screen.getByTestId('group-child').props.accessibilityState?.disabled).toBe(true)
  })

  it('warns and prefers children when options and children are both provided', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    await render(
      <ConfigProvider>
        <Radio.Group options={[{ value: 'option', label: '配置项' }]}>
          <Radio value="child">子项</Radio>
        </Radio.Group>
      </ConfigProvider>,
    )

    expect(error).toHaveBeenCalledWith('Radio.Group accepts either options or children, not both.')
    expect(screen.getByText('子项')).toBeTruthy()
    expect(screen.queryByText('配置项')).toBeNull()
    error.mockRestore()
  })

  it('warns when a child Radio has no value', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    await render(
      <ConfigProvider>
        <Radio.Group>
          <Radio testID="missing-value">缺少值</Radio>
        </Radio.Group>
      </ConfigProvider>,
    )

    expect(error).toHaveBeenCalledWith('Radio inside Radio.Group must provide a value.')
    await press(screen.getByTestId('missing-value'))
    expect(screen.getByTestId('missing-value').props.accessibilityState?.selected).toBe(false)
    error.mockRestore()
  })

  it('exports Radio.Group and RadioGroup', () => {
    expect(Radio.Group).toBe(RadioGroup)
  })
})
