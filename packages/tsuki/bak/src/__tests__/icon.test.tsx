import { fireEvent, render, screen } from '@testing-library/react-native'
import { Icon } from '..'
import { PlatformColor } from 'react-native'
import type { IconDefinition } from '@ant-design/icons-svg/lib/types'

describe('Icon', () => {
  it('renders a named icon with the requested size', async () => {
    await render(<Icon testID="named-icon" name="CheckOutlined" size={20} color="#1989FA" />)

    const icon = screen.getByTestId('named-icon')
    expect(icon.props.width).toBe(20)
    expect(icon.props.height).toBe(20)
    expect(icon.parent?.props.pointerEvents).toBe('none')
  })

  it('keeps the existing press behavior and touch target sizing', async () => {
    const onPress = jest.fn()
    await render(
      <Icon
        testID="clickable-icon"
        name="CheckOutlined"
        size={20}
        onPress={onPress}
        touchableSize={56}
      />,
    )

    const button = screen.getByRole('button')
    expect(button.props.hitSlop).toEqual({ top: 18, right: 18, bottom: 18, left: 18 })
    expect(screen.getByTestId('clickable-icon').parent?.props.pointerEvents).toBe('none')

    fireEvent.press(button)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('preserves an explicit hitSlop', async () => {
    await render(<Icon name="CheckOutlined" size={20} onPress={jest.fn()} hitSlop={4} />)

    expect(screen.getByRole('button').props.hitSlop).toBe(4)
  })
})

describe('Icon color and accessibility', () => {
  it('places accessibility labels and actions on the clickable root', async () => {
    const onAccessibilityAction = jest.fn()
    await render(
      <Icon
        name="SettingOutlined"
        testID="accessible-icon"
        onPress={jest.fn()}
        accessibilityLabel="Open settings"
        accessibilityHint="Configure the app"
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={onAccessibilityAction}
      />,
    )

    const button = screen.getByRole('button', { name: 'Open settings' })
    expect(button.props.accessibilityHint).toBe('Configure the app')
    fireEvent(button, 'accessibilityAction', { nativeEvent: { actionName: 'activate' } })
    expect(onAccessibilityAction).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('accessible-icon').props.accessibilityLabel).toBeUndefined()
  })

  it('places display-only accessibility semantics on the root', async () => {
    await render(
      <Icon
        testID="display-icon"
        name="CheckOutlined"
        accessible
        accessibilityRole="image"
        accessibilityLabel="Done"
      />,
    )
    expect(screen.getByRole('image', { name: 'Done' })).toBeTruthy()
    expect(screen.getByTestId('display-icon').props.accessibilityRole).toBeUndefined()
  })

  it.each(['CheckOutlined', 'CheckCircleTwoTone'] as const)(
    'preserves native color objects for %s',
    async (name) => {
      const color = PlatformColor('labelColor')
      await render(<Icon testID="native-color" name={name} color={color} />)
      const icon = screen.getByTestId('native-color')
      expect(icon.queryAll((node) => node.type === 'RNSVGGroup')[0].props.fill).toEqual({
        type: 0,
        payload: color,
      })
      if (name === 'CheckCircleTwoTone') {
        expect(icon.queryAll((node) => node.type === 'RNSVGPath')[0].props.fill).toEqual({
          type: 0,
          payload: color,
        })
      }
    },
  )

  it('lets custom paths inherit parent fill and stroke', async () => {
    const definition: IconDefinition = {
      name: 'inherited-colors',
      theme: 'outlined',
      icon: {
        tag: 'svg',
        attrs: { viewBox: '0 0 24 24' },
        children: [
          {
            tag: 'g',
            attrs: { fill: 'none', stroke: 'red' },
            children: [{ tag: 'path', attrs: { d: 'M0 0L24 24' } }],
          },
        ],
      },
    }
    await render(<Icon testID="inherited-color" name={definition} color="blue" />)
    const icon = screen.getByTestId('inherited-color')
    const groups = icon.queryAll((node) => node.type === 'RNSVGGroup')
    expect(groups[0].props.propList).toContain('fill')
    expect(groups[1].props.fill).toBeNull()
    expect(groups[1].props.propList).toEqual(expect.arrayContaining(['fill', 'stroke']))
    const path = icon.queryAll((node) => node.type === 'RNSVGPath')[0]
    expect(path.props.propList ?? []).not.toContain('fill')
    expect(path.props.propList ?? []).not.toContain('stroke')
  })
})
