import { Divider, getDesignToken } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'

function dividerStyle(view: { toJSON: () => unknown }) {
  const tree = view.toJSON() as { props: { style: StyleProp<ViewStyle> } }
  return StyleSheet.flatten(tree.props.style) ?? {}
}

describe('Divider', () => {
  it('uses the theme hairline defaults and does not intercept pointer events', async () => {
    const view = await render(<Divider testID="divider" />)
    const style = dividerStyle(view)
    const token = getDesignToken()

    expect(style).toMatchObject({
      backgroundColor: token.colorBorder,
      height: token.lineWidthHairline,
      marginHorizontal: 0,
    })
    expect(StyleSheet.flatten(screen.getByTestId('divider').props.style)).toMatchObject({
      pointerEvents: 'none',
    })
  })

  it('supports color, thickness, inset, and style overrides', async () => {
    const view = await render(
      <Divider
        color="#1677ff"
        inset={16}
        style={{ marginHorizontal: 8, opacity: 0.5 }}
        thickness={2}
      />,
    )
    const style = dividerStyle(view)

    expect(style).toMatchObject({
      backgroundColor: '#1677ff',
      height: 2,
      marginHorizontal: 8,
      opacity: 0.5,
    })
  })
})
