import { Col, Row } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'

describe('Layout Row and Col', () => {
  it('creates a wrapping row and passes row alignment props', async () => {
    await render(
      <Row testID="row" gap={16} justify="space-between" align="center">
        <Col testID="col" span={8} />
      </Row>,
    )

    const rowStyle = StyleSheet.flatten(screen.getByTestId('row').props.style)

    expect(rowStyle).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: -8,
      marginVertical: -8,
    })
  })

  it('applies 24-column span, offset and both-axis gap to columns', async () => {
    await render(
      <Row gap={12}>
        <Col testID="col" span={6} offset={2}>
          <View />
        </Col>
      </Row>,
    )

    const colStyle = StyleSheet.flatten(screen.getByTestId('col').props.style)

    expect(colStyle).toMatchObject({
      flexBasis: '25%',
      flexGrow: 0,
      flexShrink: 0,
      marginLeft: `${(2 / 24) * 100}%`,
      paddingHorizontal: 6,
      paddingVertical: 6,
    })
  })
})
