import { Flex } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'

function getStyle(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

describe('Flex', () => {
  it('maps direction, wrap, gap, alignment and justification', async () => {
    await render(
      <Flex testID="flex" direction="column" wrap gap={12} align="center" justify="space-between">
        <View />
      </Flex>,
    )

    expect(getStyle('flex')).toMatchObject({
      alignItems: 'center',
      flexDirection: 'column',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
    })
  })

  it('uses row and nowrap by default', async () => {
    await render(
      <Flex testID="flex">
        <View />
      </Flex>,
    )

    expect(getStyle('flex')).toMatchObject({ flexDirection: 'row', flexWrap: 'nowrap' })
  })

  it('passes ViewProps and lets style override defaults', async () => {
    await render(
      <Flex testID="flex" accessibilityLabel="布局" style={{ flexDirection: 'column' }}>
        <View />
      </Flex>,
    )

    expect(screen.getByTestId('flex').props.accessibilityLabel).toBe('布局')
    expect(getStyle('flex').flexDirection).toBe('column')
  })
})
