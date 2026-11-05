import { ConfigProvider, Grid } from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'
import { getDesignToken } from '../theme'

const press = (instance: Parameters<typeof fireEvent.press>[0]) => fireEvent.press(instance)

describe('Grid', () => {
  it('uses the column count directly for item width', async () => {
    await render(
      <Grid columnNum={5}>
        <Grid.Item testID="item" text="成员" />
      </Grid>,
    )

    const wrapperStyle = StyleSheet.flatten(screen.getByTestId('item').parent!.props.style)

    expect(wrapperStyle).toMatchObject({
      flexBasis: '20%',
      width: '20%',
      minWidth: 0,
      flexGrow: 0,
      flexShrink: 0,
    })
  })

  it('keeps internal layout wrappers out of accessibility element semantics', async () => {
    await render(
      <Grid testID="grid">
        <Grid.Item testID="item" text="成员" onPress={() => {}} />
      </Grid>,
    )

    const item = screen.getByTestId('item')
    const columnWrapper = item.parent!
    const layoutWrapper = columnWrapper.parent!

    expect(columnWrapper.props.accessible).toBe(false)
    expect(layoutWrapper.props.accessible).toBe(false)
    expect(item.props.accessibilityRole).toBe('button')
  })

  it('keeps gutter spacing private to the item wrapper', async () => {
    await render(
      <Grid testID="grid" gutter={12}>
        <Grid.Item testID="item" text="成员" />
      </Grid>,
    )

    const wrapperStyle = StyleSheet.flatten(screen.getByTestId('item').parent!.props.style)
    const gridStyle = StyleSheet.flatten(screen.getByTestId('grid').props.style)

    expect(wrapperStyle).toMatchObject({
      flexBasis: '25%',
      paddingHorizontal: 6,
      paddingVertical: 6,
    })
    expect(gridStyle).toBeUndefined()
  })

  it('supports square, border and center item semantics', async () => {
    await render(
      <Grid square border center>
        <Grid.Item testID="centered" text="居中" />
      </Grid>,
    )

    const itemStyle = StyleSheet.flatten(screen.getByTestId('centered').props.style)

    expect(itemStyle).toMatchObject({
      alignItems: 'center',
      aspectRatio: 1,
      borderWidth: 1,
      justifyContent: 'center',
    })
  })

  it('disables the item border and center alignment when requested', async () => {
    await render(
      <Grid border={false} center={false}>
        <Grid.Item testID="plain" text="左对齐" />
      </Grid>,
    )

    const itemStyle = StyleSheet.flatten(screen.getByTestId('plain').props.style)

    expect(itemStyle).toMatchObject({
      alignItems: 'flex-start',
      borderWidth: 0,
      justifyContent: 'flex-start',
    })
  })

  it('supports Interaction press behavior on Grid.Item', async () => {
    const onPress = jest.fn()
    await render(
      <Grid>
        <Grid.Item testID="interactive" text="可点击" onPress={onPress} />
        <Grid.Item testID="disabled" text="不可点击" disabled onPress={onPress} />
      </Grid>,
    )

    await press(screen.getByTestId('interactive'))
    await press(screen.getByTestId('disabled'))

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('interactive').props.accessibilityRole).toBe('button')
    expect(screen.getByTestId('disabled').props.accessibilityState?.disabled).toBe(true)
  })

  it('uses the shared pressed background for pressed items', async () => {
    await render(
      <Grid>
        <Grid.Item testID="normal" text="正常" onPress={() => {}} />
        <Grid.Item testID="pressed" text="按下" onPress={() => {}} testOnly_pressed />
      </Grid>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('normal').props.style).backgroundColor).toBe(
      getDesignToken().colorBgContainer,
    )
    const style = StyleSheet.flatten(screen.getByTestId('pressed').props.style)
    expect(style.backgroundColor).toBe(getDesignToken().pressedBackgroundColor)
  })

  it('keeps arbitrary children as item content without layout coupling', async () => {
    await render(
      <Grid columnNum={2}>
        <View testID="custom-content" />
      </Grid>,
    )

    expect(screen.getByTestId('custom-content')).toBeTruthy()
  })
})

describe('Grid styles', () => {
  it('uses theme typography and centers multiline labels', async () => {
    const theme = { seed: { fontSize: 18, lineWidth: 2 } }
    const token = getDesignToken(theme)
    await render(
      <ConfigProvider theme={theme}>
        <Grid>
          <Grid.Item testID="item" text={'第一行\n第二行'} />
        </Grid>
      </ConfigProvider>,
    )
    expect(StyleSheet.flatten(screen.getByText('第一行\n第二行').props.style)).toMatchObject({
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      textAlign: 'center',
    })
    expect(StyleSheet.flatten(screen.getByTestId('item').props.style).borderWidth).toBe(2)
  })

  it('uses natural text alignment when center is disabled', async () => {
    await render(
      <Grid center={false}>
        <Grid.Item text={'第一行\n第二行'} />
      </Grid>,
    )
    expect(StyleSheet.flatten(screen.getByText('第一行\n第二行').props.style).textAlign).toBe(
      'auto',
    )
  })

  it('draws shared borders once, including an incomplete final row', async () => {
    await render(
      <Grid columnNum={2}>
        {[0, 1, 2].map((index) => (
          <Grid.Item key={index} testID={`item-${index}`} text={index} />
        ))}
      </Grid>,
    )
    const styles = [0, 1, 2].map((index) =>
      StyleSheet.flatten(screen.getByTestId(`item-${index}`).props.style),
    )
    expect(styles[0]).toMatchObject({ borderWidth: 1, borderTopWidth: 1, borderStartWidth: 1 })
    expect(styles[1]).toMatchObject({ borderWidth: 1, borderTopWidth: 1, borderStartWidth: 0 })
    expect(styles[2]).toMatchObject({ borderWidth: 1, borderTopWidth: 0, borderStartWidth: 1 })
  })

  it('preserves explicit border width overrides without gutters', async () => {
    await render(
      <Grid columnNum={1}>
        <Grid.Item text="一" />
        <Grid.Item testID="custom" text="二" style={{ borderWidth: 3 }} />
      </Grid>,
    )
    const style = StyleSheet.flatten(screen.getByTestId('custom').props.style)
    expect(style.borderWidth).toBe(3)
    expect(style.borderTopWidth).toBeUndefined()
    expect(style.borderStartWidth).toBeUndefined()
  })

  it('keeps complete borders with gutters and allows item style overrides', async () => {
    await render(
      <Grid columnNum={1} gutter={12}>
        <Grid.Item testID="first" text="一" />
        <Grid.Item testID="second" text="二" style={{ borderWidth: 3 }} />
      </Grid>,
    )
    const first = StyleSheet.flatten(screen.getByTestId('first').props.style)
    const second = StyleSheet.flatten(screen.getByTestId('second').props.style)
    expect(first.borderWidth).toBe(1)
    expect(first.borderTopWidth).toBeUndefined()
    expect(first.borderStartWidth).toBeUndefined()
    expect(second.borderWidth).toBe(3)
    expect(second.borderTopWidth).toBeUndefined()
  })
})
