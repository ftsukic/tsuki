import { Surface, getDesignToken } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'

describe('Surface', () => {
  it('provides the default background, radius and clipped overflow', async () => {
    await render(
      <Surface testID="surface" inset>
        <Text>内容</Text>
      </Surface>,
    )

    const style = StyleSheet.flatten(screen.getByTestId('surface').props.style)
    const token = getDesignToken()

    expect(style).toMatchObject({
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      marginHorizontal: token.padding,
      overflow: 'hidden',
    })
    expect(screen.getByText('内容')).toBeTruthy()
  })

  it('supports custom background, radius and overflow styles', async () => {
    await render(
      <Surface
        testID="custom"
        background="#123456"
        radius={20}
        overflow="visible"
        style={{ padding: 12 }}
      />,
    )

    expect(StyleSheet.flatten(screen.getByTestId('custom').props.style)).toMatchObject({
      backgroundColor: '#123456',
      borderRadius: 20,
      overflow: 'visible',
      padding: 12,
    })
  })
})
