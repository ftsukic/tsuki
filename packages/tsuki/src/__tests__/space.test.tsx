import { Space } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'

function getStyle(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

describe('Space', () => {
  it('maps horizontal and vertical directions to flex layout', async () => {
    await render(
      <Space testID="horizontal" gap={8} align="center">
        <View />
      </Space>,
    )
    expect(getStyle('horizontal')).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: 8,
    })

    await render(
      <Space testID="vertical" direction="vertical" wrap>
        <View />
      </Space>,
    )
    expect(getStyle('vertical')).toMatchObject({ flexDirection: 'column', flexWrap: 'wrap' })
  })

  it('keeps children intact and allows ViewProps/style overrides', async () => {
    await render(
      <Space testID="space" accessibilityLabel="间距" style={{ flexDirection: 'column' }}>
        <View testID="child" />
      </Space>,
    )

    expect(screen.getByTestId('space').props.accessibilityLabel).toBe('间距')
    expect(screen.getByTestId('child').parent).toBe(screen.getByTestId('space'))
    expect(getStyle('space').flexDirection).toBe('column')
  })
})
