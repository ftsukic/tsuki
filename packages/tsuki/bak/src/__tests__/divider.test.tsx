import { Divider, getDesignToken } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'

function dividerStyle(view: { toJSON: () => unknown }) {
  const tree = view.toJSON() as { props: { style: StyleProp<ViewStyle> } }
  return StyleSheet.flatten(tree.props.style) ?? {}
}

describe('Divider', () => {
  it('uses the theme hairline defaults and exposes a horizontal separator', async () => {
    const view = await render(<Divider testID="divider" />)
    const style = dividerStyle(view)
    const token = getDesignToken()

    expect(style).toMatchObject({
      alignSelf: 'stretch',
      backgroundColor: token.colorBorder,
      height: token.lineWidthHairline,
      marginHorizontal: 0,
    })
    expect(screen.getByTestId('divider').props.role).toBe('separator')
    expect(StyleSheet.flatten(screen.getByTestId('divider').props.style)).toMatchObject({
      pointerEvents: 'none',
    })
  })

  it('preserves explicit role and accessibilityRole overrides', async () => {
    await render(
      <>
        <Divider testID="decorative" accessible={false} role="none" />
        <Divider testID="legacy-role" accessibilityRole="none" />
      </>,
    )

    expect(screen.getByTestId('decorative').props).toMatchObject({
      accessible: false,
      role: 'none',
    })
    expect(screen.getByTestId('legacy-role').props.accessibilityRole).toBe('none')
    expect(screen.getByTestId('legacy-role').props.role).toBeUndefined()
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
