import { Grid } from '..'
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
      flexGrow: 0,
      flexShrink: 0,
    })
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
        <Grid.Item testID="pressed" text="按下" onPress={() => {}} testOnly_pressed />
      </Grid>,
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
