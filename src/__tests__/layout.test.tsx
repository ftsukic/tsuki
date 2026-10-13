import { Col, Row } from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
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

  it('uses grid rows initially and native rowGap for vertical gutter', async () => {
    await render(
      <Row testID="row" gutter={[16, 8]}>
        <Col testID="first" span={16} />
        <Col testID="second" span={16} />
        <Col testID="third" span={12} />
        <Col testID="fourth" span={12} />
      </Row>,
    )

    expect(getStyle('row').rowGap).toBe(8)
    expect(getStyle('first')).toMatchObject({
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
    })
    expect(getStyle('second')).toMatchObject({ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 })
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

  it('counts offset and span together for initial horizontal spacing', async () => {
    await render(
      <Row gutter={[16, 8]}>
        <Col testID="first" span={8} offset={4} />
        <Col testID="second" span={12} />
        <Col testID="third" span={16} />
      </Row>,
    )

    expect(getStyle('first').paddingRight).toBe(8)
    expect(getStyle('second').paddingLeft).toBe(8)
    expect(getStyle('third')).toMatchObject({ paddingLeft: 0, paddingRight: 0 })
  })

  it('does not form vertical logical rows when wrapping is disabled', async () => {
    await render(
      <Row testID="row" gutter={[16, 8]} wrap={false}>
        <Col testID="first" span={16} />
        <Col testID="second" span={16} />
      </Row>,
    )

    expect(getStyle('row').flexWrap).toBe('nowrap')
    expect(getStyle('row').rowGap).toBe(0)
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
    expect(getStyle('row').rowGap).toBe(0)
    expect(getStyle('col')).toMatchObject({ flexBasis: '40%', paddingLeft: 20 })
  })
})

describe('Layout semantic content and native rows', () => {
  function layout(testID: string, x: number, y: number, width: number, height = 40) {
    return fireEvent(screen.getByTestId(testID), 'layout', {
      nativeEvent: { layout: { x, y, width, height } },
    })
  }

  it('keeps root styles and resolves content styles with the original props', async () => {
    const resolver = jest.fn(({ props }) => ({
      content: { backgroundColor: 'blue', padding: props.span },
    }))
    await render(
      <Col testID="col" span={12} style={{ backgroundColor: 'red', height: 80 }} styles={resolver}>
        <View testID="child" />
      </Col>,
    )
    expect(getStyle('col')).toMatchObject({ backgroundColor: 'red', height: 80 })
    expect(StyleSheet.flatten(screen.getByTestId('child').parent?.props.style)).toMatchObject({
      backgroundColor: 'blue',
      padding: 12,
    })
    expect(resolver).toHaveBeenCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ span: 12 }), state: {} }),
    )
  })

  it('uses native rows when flexBasis overrides the grid and preserves onLayout', async () => {
    const onLayout = jest.fn()
    await render(
      <Row testID="row" gutter={[16, 8]}>
        <Col testID="first" span={12} style={{ flexBasis: '60%' }} onLayout={onLayout} />
        <Col testID="second" span={12} style={{ flexBasis: '60%' }} />
      </Row>,
    )
    await layout('first', 0, 0, 180)
    await layout('second', 0, 48, 180)
    expect(getStyle('row').rowGap).toBe(8)
    expect(getStyle('first').paddingRight).toBe(0)
    expect(getStyle('second').paddingLeft).toBe(0)
    expect(onLayout).toHaveBeenCalledTimes(1)
    // Resize back into one actual line.
    await layout('first', 0, 0, 150)
    await layout('second', 150, 0, 150)
    expect(getStyle('first').paddingRight).toBe(8)
    expect(getStyle('second').paddingLeft).toBe(8)
  })

  it('keeps different-height centered columns in the same native row', async () => {
    await render(
      <Row gutter={16} align="center">
        <Col testID="first" span={12} />
        <Col testID="second" span={12} />
      </Row>,
    )
    await layout('first', 0, 24, 150, 40)
    await layout('second', 150, 0, 150, 88)
    expect(getStyle('first').paddingRight).toBe(8)
    expect(getStyle('second').paddingLeft).toBe(8)
  })

  it('corrects spacing when a non-Col child causes native wrapping', async () => {
    await render(
      <Row gutter={16}>
        <Col testID="first" span={12} />
        <View style={{ width: 20 }} />
        <Col testID="second" span={12} />
      </Row>,
    )
    await layout('first', 0, 0, 150)
    await layout('second', 0, 56, 150)
    expect(getStyle('first').paddingRight).toBe(0)
    expect(getStyle('second').paddingLeft).toBe(0)
  })

  it('uses the effective wrap style for vertical gutter', async () => {
    await render(
      <Row testID="row" gutter={[16, 8]} style={{ flexWrap: 'nowrap' }}>
        <Col span={16} />
        <Col span={16} />
      </Row>,
    )
    expect(getStyle('row').rowGap).toBe(0)
  })

  it('isolates nested rows and descendants from outer spacing', async () => {
    await render(
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Row>
            <>
              <Col testID="inner" />
            </>
          </Row>
          <Col testID="standalone" />
        </Col>
        <Col span={12} />
      </Row>,
    )
    expect(getStyle('inner')).toMatchObject({ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 })
    expect(getStyle('standalone')).toMatchObject({
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 0,
    })
  })
})
