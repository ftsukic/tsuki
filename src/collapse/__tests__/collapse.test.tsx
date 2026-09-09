import { Collapse, CollapseItem, ConfigProvider } from '../..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

describe('Collapse', () => {
  it('supports defaultValue and multiple expanded items', async () => {
    await render(
      <Collapse defaultValue={['first']}>
        <CollapseItem name="first" testID="first" title="第一项" />
        <CollapseItem name="second" testID="second" title="第二项" />
      </Collapse>,
    )

    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(false)

    await press(screen.getByTestId('second'))
    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(true)

    await press(screen.getByTestId('first'))
    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(false)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(true)
  })

  it('supports controlled values without changing until the parent rerenders', async () => {
    const onChange = jest.fn()
    const view = await render(
      <Collapse value="first" onChange={onChange}>
        <CollapseItem name="first" testID="first" title="第一项" />
        <CollapseItem name="second" testID="second" title="第二项" />
      </Collapse>,
    )

    await press(screen.getByTestId('second'))
    expect(onChange).toHaveBeenCalledWith(['first', 'second'])
    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(false)

    await view.rerender(
      <Collapse value={['first', 'second']} onChange={onChange}>
        <CollapseItem name="first" testID="first" title="第一项" />
        <CollapseItem name="second" testID="second" title="第二项" />
      </Collapse>,
    )
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(true)
  })

  it('replaces and closes the active item in accordion mode', async () => {
    const onChange = jest.fn()
    await render(
      <Collapse accordion defaultValue="first" onChange={onChange}>
        <CollapseItem name="first" testID="first" title="第一项" />
        <CollapseItem name="second" testID="second" title="第二项" />
      </Collapse>,
    )

    await press(screen.getByTestId('second'))
    expect(onChange).toHaveBeenCalledWith('second')
    expect(screen.getByTestId('first').props.accessibilityState?.expanded).toBe(false)
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(true)

    await press(screen.getByTestId('second'))
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(screen.getByTestId('second').props.accessibilityState?.expanded).toBe(false)
  })

  it('does not toggle disabled items', async () => {
    const onChange = jest.fn()
    await render(
      <Collapse onChange={onChange}>
        <CollapseItem disabled name="disabled" testID="disabled" title="禁用项" />
      </Collapse>,
    )

    expect(screen.getByTestId('disabled').props.accessibilityState?.disabled).toBe(true)
    await press(screen.getByTestId('disabled'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('disabled').props.accessibilityState?.expanded).toBe(false)
  })

  it('supports numeric names and themed outer borders', async () => {
    const view = await render(
      <ConfigProvider theme={{ components: { Collapse: { headerHeight: 52 } } }}>
        <Collapse border testID="collapse" defaultValue={1}>
          <CollapseItem name={1} testID="numeric" title="数字项" />
        </Collapse>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('numeric').props.accessibilityState?.expanded).toBe(true)
    expect(StyleSheet.flatten(screen.getByTestId('collapse').props.style)).toMatchObject({
      borderTopWidth: expect.any(Number),
      borderBottomWidth: expect.any(Number),
    })
    expect(screen.getByTestId('collapse')).toBeTruthy()
    void view
  })
})
