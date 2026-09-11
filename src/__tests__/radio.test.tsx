import { ConfigProvider, getDesignToken, Radio, RadioGroup } from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import type { JsonElement, JsonNode } from 'test-renderer'
import { getRadioStyles } from '../radio/style'
import { getRadioToken } from '../radio/token'

const styleOf = (id: string) => StyleSheet.flatten(screen.getByTestId(id).props.style)

function findNodes(
  node: JsonElement | null,
  predicate: (node: JsonElement) => boolean,
): JsonElement[] {
  if (node === null || typeof node === 'string') return []
  return (predicate(node) ? [node] : []).concat(
    node.children.flatMap((child) =>
      child === null || typeof child === 'string' ? [] : findNodes(child, predicate),
    ),
  )
}

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

function findIndicator(
  node: JsonNode | null,
  width = 30,
  borderWidth = 2,
): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  const style = StyleSheet.flatten(node.props.style)
  if (style?.borderWidth === borderWidth && style?.width === width) return node

  for (const child of node.children) {
    const indicator = findIndicator(child, width, borderWidth)
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

  it('renders button variants with content-sized roots and no indicator', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Radio testID="button" variant="button">
          Apple
        </Radio>
        <Radio testID="disabled-button" variant="button" disabled>
          Orange
        </Radio>
      </ConfigProvider>,
    )

    const buttonStyle = styleOf('button')
    expect(buttonStyle).toMatchObject({
      height: getRadioToken(getDesignToken()).buttonHeight,
      minHeight: getRadioToken(getDesignToken()).buttonHeight,
      paddingHorizontal: getRadioToken(getDesignToken()).buttonPaddingHorizontal,
    })
    expect(buttonStyle.width).toBeUndefined()
    expect(buttonStyle.flex).toBeUndefined()
    expect(screen.getByText('Apple')).toBeTruthy()
    expect(screen.getByTestId('disabled-button').props.accessibilityState?.disabled).toBe(true)
    expect(styleOf('disabled-button').opacity).toBe(getRadioToken(getDesignToken()).disabledOpacity)
    expect(
      findIndicator(toJSON(), getRadioToken(getDesignToken()).indicatorSize, 1),
    ).toBeUndefined()
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

  it('uses the Vant indicator semantics for round, square and dot shapes', () => {
    const aliasToken = getDesignToken()
    const token = getRadioToken(aliasToken)
    const checkedRound = getRadioStyles(
      token,
      { shape: 'round', checkedColor: '#ff0000' },
      { checked: true, disabled: false, pressed: false },
    )
    const checkedSquare = getRadioStyles(
      token,
      { shape: 'square', checkedColor: '#ff0000' },
      { checked: true, disabled: false, pressed: false },
    )
    const checkedDot = getRadioStyles(
      token,
      { shape: 'dot', checkedColor: '#ff0000' },
      { checked: true, disabled: false, pressed: false },
    )

    expect(checkedRound.indicator).toMatchObject({
      backgroundColor: '#ff0000',
      borderRadius: token.indicatorSize / 2,
    })
    expect(checkedSquare.indicator).toMatchObject({
      backgroundColor: '#ff0000',
      borderRadius: token.borderRadius,
    })
    expect(checkedRound.dot.width).toBe(0)
    expect(checkedSquare.dot.width).toBe(0)
    expect(checkedRound.checkColor).toBe('#ffffff')
    expect(checkedSquare.checkColor).toBe('#ffffff')
    expect(checkedDot.indicator).toMatchObject({
      backgroundColor: 'transparent',
      borderRadius: token.indicatorSize / 2,
      borderColor: '#ff0000',
    })
    expect(checkedDot.dot).toMatchObject({
      width: token.dotSize,
      height: token.dotSize,
      backgroundColor: '#ff0000',
      borderRadius: token.dotSize / 2,
    })

    expect(checkedDot.checkSize).toBe(token.indicatorSize * 0.6)
  })

  it('uses consistent disabled background and internal mark tokens for each shape', () => {
    const aliasToken = getDesignToken()
    const token = getRadioToken(aliasToken)
    const disabledUnchecked = getRadioStyles(
      token,
      { shape: 'round' },
      { checked: false, disabled: true, pressed: false },
    )
    const disabledRoundChecked = getRadioStyles(
      token,
      { shape: 'round' },
      { checked: true, disabled: true, pressed: false },
    )
    const disabledSquareChecked = getRadioStyles(
      token,
      { shape: 'square' },
      { checked: true, disabled: true, pressed: false },
    )
    const disabledDotChecked = getRadioStyles(
      token,
      { shape: 'dot' },
      { checked: true, disabled: true, pressed: false },
    )

    expect(token.disabledBorderColor).toBe(aliasToken.colorTextDisabled)
    expect(token.disabledBackgroundColor).toBe(aliasToken.colorBgContainerDisabled)
    expect(token.disabledCheckedBackgroundColor).toBe(aliasToken.controlItemBgActiveDisabled)
    expect(token.disabledMarkColor).toBe(aliasToken.colorTextDisabled)
    expect(token.disabledOpacity).toBe(0.4)

    expect(disabledUnchecked.root.opacity).toBe(1)
    expect(disabledUnchecked.indicator).toMatchObject({
      backgroundColor: token.disabledBackgroundColor,
      borderColor: token.disabledBorderColor,
    })
    expect(disabledRoundChecked.indicator).toMatchObject({
      backgroundColor: token.disabledBackgroundColor,
      borderColor: token.disabledBorderColor,
    })
    expect(disabledSquareChecked.indicator).toMatchObject({
      backgroundColor: token.disabledBackgroundColor,
      borderColor: token.disabledBorderColor,
    })
    expect(disabledRoundChecked.checkColor).toBe(token.disabledMarkColor)
    expect(disabledSquareChecked.checkColor).toBe(token.disabledMarkColor)
    expect(disabledDotChecked.root.opacity).toBe(1)
    expect(disabledDotChecked.indicator).toMatchObject({
      backgroundColor: token.disabledBackgroundColor,
      borderColor: token.disabledBorderColor,
    })
    expect(disabledDotChecked.dot.backgroundColor).toBe(token.disabledMarkColor)
    expect(disabledSquareChecked.checkColor).not.toBe(
      disabledSquareChecked.indicator.backgroundColor,
    )
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

  it('keeps button variants mutually exclusive in a Radio.Group', async () => {
    const onChange = jest.fn()
    await render(
      <ConfigProvider>
        <Radio.Group defaultValue="apple" onChange={onChange}>
          <Radio testID="button-apple" variant="button" value="apple">
            Apple
          </Radio>
          <Radio testID="button-orange" variant="button" value="orange">
            Orange
          </Radio>
        </Radio.Group>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('button-apple').props.accessibilityState?.selected).toBe(true)
    expect(screen.getByTestId('button-orange').props.accessibilityState?.selected).toBe(false)

    await press(screen.getByTestId('button-orange'))
    expect(screen.getByTestId('button-apple').props.accessibilityState?.selected).toBe(false)
    expect(screen.getByTestId('button-orange').props.accessibilityState?.selected).toBe(true)
    expect(onChange).toHaveBeenCalledWith('orange')
  })

  it('inherits the group variant for child Radio elements', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Radio.Group testID="button-group" variant="button" defaultValue="apple">
          <Radio testID="button-apple" value="apple">
            Apple
          </Radio>
          <Radio testID="button-orange" value="orange">
            Orange
          </Radio>
        </Radio.Group>
      </ConfigProvider>,
    )

    expect(styleOf('button-apple')).toMatchObject({
      height: getRadioToken(getDesignToken()).buttonHeight,
      paddingHorizontal: getRadioToken(getDesignToken()).buttonPaddingHorizontal,
    })
    expect(
      findIndicator(toJSON(), getRadioToken(getDesignToken()).indicatorSize, 1),
    ).toBeUndefined()
  })

  it('inherits the group variant for options and preserves explicit child variants', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Radio.Group
          testID="button-options"
          variant="button"
          options={[
            { value: 'apple', label: 'Apple' },
            { value: 'orange', label: 'Orange' },
          ]}
        />
        <Radio.Group testID="mixed-group" variant="button">
          <Radio testID="default-child" value="default" variant="default">
            Default
          </Radio>
          <Radio testID="button-child" value="button">
            Button
          </Radio>
        </Radio.Group>
      </ConfigProvider>,
    )

    expect(styleOf('button-options')).toMatchObject({ flexDirection: 'column' })
    expect(screen.getByText('Apple')).toBeTruthy()
    expect(screen.getByText('Orange')).toBeTruthy()
    expect(styleOf('default-child').flexDirection).toBe('row')
    expect(styleOf('button-child')).toMatchObject({
      height: getRadioToken(getDesignToken()).buttonHeight,
      paddingHorizontal: getRadioToken(getDesignToken()).buttonPaddingHorizontal,
    })
    expect(findIndicator(toJSON(), getRadioToken(getDesignToken()).indicatorSize, 1)).toBeDefined()
  })

  it('uses equal Grid columns and wraps button options without stretching the last row', async () => {
    const { toJSON } = await render(
      <ConfigProvider>
        <Radio.Group
          testID="equal-grid"
          variant="button"
          buttonLayout="equal"
          buttonColumns={5}
          direction="horizontal"
          gap={8}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <Radio key={index} testID={`grid-${index}`} value={index}>
              {index === 0 ? '一个很长的选项' : `选项 ${index}`}
            </Radio>
          ))}
        </Radio.Group>
      </ConfigProvider>,
    )

    const wrappedColumns = findNodes(toJSON(), (node) => {
      const style = StyleSheet.flatten(node.props.style)
      return style?.flexBasis === '20%'
    })

    expect(wrappedColumns).toHaveLength(8)
    expect(
      findNodes(toJSON(), (node) => {
        const style = StyleSheet.flatten(node.props.style)
        return style?.flexWrap === 'wrap'
      }),
    ).toHaveLength(1)
    expect(styleOf('grid-0')).toMatchObject({
      alignSelf: 'stretch',
      flexGrow: 0,
      flexShrink: 0,
      width: '100%',
    })
    expect(screen.getByText('一个很长的选项').props.numberOfLines).toBe(1)
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
