import { Col, Row } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'

function getStyle(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

describe('Layout Row and Col', () => {
  it('uses the 24-column defaults and maps alignment props', async () => {
    await render(
      <Row testID="row" justify="space-between" align="center">
        <Col testID="col" />
      </Row>,
    )

    expect(getStyle('row')).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    })
    expect(getStyle('col')).toMatchObject({
      flexBasis: '100%',
      flexGrow: 0,
      flexShrink: 0,
      marginLeft: '0%',
    })
  })

  it.each([
    [6, '25%'],
    [8, `${(8 / 24) * 100}%`],
    [12, '50%'],
    [24, '100%'],
  ])('maps span %s to %s', async (span, flexBasis) => {
    await render(
      <Row>
        <Col testID="col" span={span} />
      </Row>,
    )

    expect(getStyle('col').flexBasis).toBe(flexBasis)
  })

  it('maps offset to a percentage and normalizes invalid values', async () => {
    await render(
      <Row>
        <Col testID="offset" span={8} offset={6} />
      </Row>,
    )

    expect(getStyle('offset').marginLeft).toBe('25%')

    await render(
      <Row>
        <Col testID="normalized" span={30} offset={-2} />
      </Row>,
    )

    expect(getStyle('normalized')).toMatchObject({
      flexBasis: '100%',
      marginLeft: '0%',
    })

    await render(
      <Row>
        <Col testID="fallback" span={Number.NaN} offset={Number.POSITIVE_INFINITY} />
      </Row>,
    )

    expect(getStyle('fallback')).toMatchObject({
      flexBasis: '100%',
      marginLeft: '0%',
    })
  })

  it('groups direct columns into logical rows for horizontal and vertical gutter', async () => {
    await render(
      <Row gutter={[16, 8]}>
        <Col testID="first" span={16} />
        <Col testID="second" span={16} />
        <Col testID="third" span={12} />
        <Col testID="fourth" span={12} />
      </Row>,
    )

    expect(getStyle('first')).toMatchObject({
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 8,
    })
    expect(getStyle('second')).toMatchObject({ paddingLeft: 0, paddingRight: 0, paddingBottom: 8 })
    expect(getStyle('third')).toMatchObject({ paddingLeft: 0, paddingRight: 8, paddingBottom: 0 })
    expect(getStyle('fourth')).toMatchObject({ paddingLeft: 8, paddingRight: 0, paddingBottom: 0 })
  })

  it('keeps adjacent columns separated without adding outer horizontal gutter', async () => {
    await render(
      <Row gutter={16}>
        <Col testID="first" span={8} />
        <Col testID="second" span={8} />
        <Col testID="third" span={8} />
      </Row>,
    )

    expect(getStyle('first')).toMatchObject({ paddingLeft: 0, paddingRight: 8 })
    expect(getStyle('second')).toMatchObject({ paddingLeft: 8, paddingRight: 8 })
    expect(getStyle('third')).toMatchObject({ paddingLeft: 8, paddingRight: 0 })
  })

  it('counts offset and span together when deciding a logical row', async () => {
    await render(
      <Row gutter={[16, 8]}>
        <Col testID="first" span={8} offset={4} />
        <Col testID="second" span={12} />
        <Col testID="third" span={16} />
      </Row>,
    )

    expect(getStyle('first').paddingBottom).toBe(8)
    expect(getStyle('second').paddingBottom).toBe(8)
    expect(getStyle('third').paddingBottom).toBe(0)
  })

  it('does not form vertical logical rows when wrapping is disabled', async () => {
    await render(
      <Row testID="row" gutter={[16, 8]} wrap={false}>
        <Col testID="first" span={16} />
        <Col testID="second" span={16} />
      </Row>,
    )

    expect(getStyle('row').flexWrap).toBe('nowrap')
    expect(getStyle('first').paddingBottom).toBe(0)
    expect(getStyle('second').paddingBottom).toBe(0)
  })

  it('ignores non-Col children while preserving their own props', async () => {
    await render(
      <Row gutter={16}>
        <Col testID="first" span={12} />
        <View testID="non-col" />
        <Col testID="second" span={12} />
      </Row>,
    )

    expect(getStyle('first').paddingRight).toBe(8)
    expect(getStyle('second').paddingLeft).toBe(8)
    expect(screen.getByTestId('non-col').props.style).toBeUndefined()
  })

  it('allows user styles to override the defaults', async () => {
    await render(
      <Row testID="row" style={{ flexWrap: 'nowrap' }}>
        <Col testID="col" span={8} style={{ flexBasis: '40%', paddingLeft: 20 }} />
      </Row>,
    )

    expect(getStyle('row').flexWrap).toBe('nowrap')
    expect(getStyle('col')).toMatchObject({ flexBasis: '40%', paddingLeft: 20 })
  })
})
