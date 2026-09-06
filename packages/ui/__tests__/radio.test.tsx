import { Radio, RadioGroup, ThemeProvider } from '../src'
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
      <ThemeProvider>
        <Radio testID="uncontrolled" onChange={uncontrolledChange}>
          默认未选中
        </Radio>
        <Radio testID="controlled" checked={false} onChange={controlledChange}>
          受控
        </Radio>
      </ThemeProvider>,
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
      <ThemeProvider>
        <Radio testID="square" shape="square" checkedColor="#ff0000" styles={styles}>
          方形
        </Radio>
        <Radio testID="dot" shape="dot" checked>
          点状
        </Radio>
        <Radio testID="disabled" disabled onChange={onChange}>
          禁用
        </Radio>
      </ThemeProvider>,
    )

    expect(styleOf('square')).toMatchObject({ marginTop: 2 })
    expect(screen.getByTestId('dot').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByTestId('disabled').props.accessibilityState?.disabled).toBe(true)
    await press(screen.getByTestId('disabled'))
    expect(onChange).not.toHaveBeenCalled()
    expect(styles).toHaveBeenCalled()
  })

  it('supports themed indicator tokens', async () => {
    const { toJSON } = await render(
      <ThemeProvider theme={{ components: { Radio: { indicatorSize: 30, borderWidth: 2 } } }}>
        <Radio testID="themed" checked>
          主题
        </Radio>
      </ThemeProvider>,
    )

    const indicator = findIndicator(toJSON())
    expect(indicator).toBeDefined()
  })

  it('provides single selection for child Radio elements', async () => {
    const onChange = jest.fn()
    await render(
      <ThemeProvider>
        <Radio.Group testID="group" defaultValue="first" onChange={onChange}>
          <Radio testID="first" value="first">
            第一项
          </Radio>
          <Radio testID="second" value="second">
            第二项
          </Radio>
        </Radio.Group>
      </ThemeProvider>,
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
      <ThemeProvider>
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
      </ThemeProvider>,
    )

    expect(styleOf('options')).toMatchObject({ flexDirection: 'row', gap: 16 })
    expect(screen.getByText('选项一')).toBeTruthy()
    expect(screen.getByText('选项二')).toBeTruthy()
    await press(screen.getByText('选项一'))
    expect(onChange).toHaveBeenCalledWith(1)

    expect(screen.getByTestId('group-child').props.accessibilityState?.disabled).toBe(true)
  })

  it('supports Ant Design-style button radios and Radio.Button', async () => {
    const onChange = jest.fn()
    await render(
      <ThemeProvider>
        <Radio.Group
          testID="button-group"
          defaultValue="first"
          optionType="button"
          buttonStyle="solid"
          size="small"
          onChange={onChange}
        >
          <Radio testID="first" value="first">
            第一项
          </Radio>
          <Radio testID="second" value="second">
            第二项
          </Radio>
        </Radio.Group>
        <Radio.Group testID="button-component-group" defaultValue="button">
          <Radio.Button testID="button-component" value="button">
            Button
          </Radio.Button>
        </Radio.Group>
        <Radio.Group
          testID="button-options"
          defaultValue="option"
          options={[{ value: 'option', label: '配置按钮' }]}
          optionType="button"
        />
        <Radio.Group testID="block-group" block optionType="button">
          <Radio value="block-first" testID="block-first">
            块级第一项
          </Radio>
          <Radio value="block-second" testID="block-second">
            块级第二项
          </Radio>
        </Radio.Group>
      </ThemeProvider>,
    )

    expect(styleOf('button-group')).toMatchObject({
      gap: 0,
      flexDirection: 'row',
      flexWrap: 'nowrap',
    })
    expect(styleOf('first')).toMatchObject({ minHeight: 24, borderWidth: 1 })
    expect(styleOf('first')).toMatchObject({ borderTopEndRadius: 0, borderBottomEndRadius: 0 })
    expect(styleOf('second')).toMatchObject({
      borderTopStartRadius: 0,
      borderBottomStartRadius: 0,
      marginStart: -1,
    })
    expect(StyleSheet.flatten(screen.getByText('第一项').props.style)).toMatchObject({
      color: '#fff',
    })
    expect(screen.getByTestId('first').props.accessibilityState?.selected).toBe(true)

    await press(screen.getByTestId('second'))
    expect(onChange).toHaveBeenCalledWith('second')
    expect(screen.getByTestId('second').props.accessibilityState?.selected).toBe(true)
    expect(styleOf('second')).toMatchObject({ zIndex: 1 })
    expect(styleOf('second').borderStartWidth).not.toBe(0)

    expect(styleOf('block-group')).toMatchObject({ alignSelf: 'stretch' })
    expect(styleOf('block-first')).toMatchObject({ flex: 1, minWidth: 0 })
    expect(styleOf('block-second')).toMatchObject({ flex: 1, minWidth: 0 })

    expect(styleOf('button-component-group')).toMatchObject({ gap: 0, flexDirection: 'row' })
    expect(styleOf('button-component')).toMatchObject({ borderWidth: 1 })
    expect(styleOf('button-component').borderRadius).toBeGreaterThan(0)
    expect(screen.getByText('配置按钮')).toBeTruthy()
  })

  it('warns and prefers children when options and children are both provided', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    await render(
      <ThemeProvider>
        <Radio.Group options={[{ value: 'option', label: '配置项' }]}>
          <Radio value="child">子项</Radio>
        </Radio.Group>
      </ThemeProvider>,
    )

    expect(error).toHaveBeenCalledWith('Radio.Group accepts either options or children, not both.')
    expect(screen.getByText('子项')).toBeTruthy()
    expect(screen.queryByText('配置项')).toBeNull()
    error.mockRestore()
  })

  it('warns when a child Radio has no value', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    await render(
      <ThemeProvider>
        <Radio.Group>
          <Radio testID="missing-value">缺少值</Radio>
        </Radio.Group>
      </ThemeProvider>,
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
