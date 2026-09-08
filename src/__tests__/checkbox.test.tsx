import { Checkbox, CheckboxGroup, ConfigProvider, getDesignToken } from '..'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { getCheckboxStyles } from '../checkbox/style'
import { getCheckboxToken } from '../checkbox/token'

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style)

describe('Checkbox', () => {
  it('toggles uncontrolled and controlled values', async () => {
    const controlledChange = jest.fn()
    const uncontrolledChange = jest.fn()

    await render(
      <ConfigProvider>
        <Checkbox testID="uncontrolled" onChange={uncontrolledChange}>
          Uncontrolled
        </Checkbox>
        <Checkbox testID="default-checked" defaultChecked>
          Default checked
        </Checkbox>
        <Checkbox testID="controlled" checked={false} onChange={controlledChange}>
          Controlled
        </Checkbox>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('uncontrolled').props.accessibilityState?.checked).toBe(false)
    expect(screen.getByTestId('default-checked').props.accessibilityState?.checked).toBe(true)
    await press(screen.getByText('Uncontrolled'))
    expect(screen.getByTestId('uncontrolled').props.accessibilityState?.checked).toBe(true)
    expect(uncontrolledChange).toHaveBeenCalledWith(true)

    await press(screen.getByText('Controlled'))
    expect(controlledChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('controlled').props.accessibilityState?.checked).toBe(false)
  })

  it('blocks disabled toggles and keeps the checked mark for disabled values', async () => {
    const onChange = jest.fn()
    const { toJSON } = await render(
      <ConfigProvider>
        <Checkbox testID="disabled-unchecked" disabled onChange={onChange}>
          Disabled unchecked
        </Checkbox>
        <Checkbox testID="disabled-checked" disabled checked>
          Disabled checked
        </Checkbox>
      </ConfigProvider>,
    )

    await press(screen.getByText('Disabled unchecked'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('disabled-checked').props.accessibilityState?.checked).toBe(true)
    expect(toJSON()).toBeTruthy()
  })

  it('uses the checkbox component tokens for checked and disabled styles', () => {
    const aliasToken = getDesignToken()
    const token = getCheckboxToken(aliasToken)
    const checked = getCheckboxStyles(
      token,
      { shape: 'square' },
      {
        checked: true,
        disabled: false,
        pressed: false,
      },
    )
    const disabledChecked = getCheckboxStyles(
      token,
      { shape: 'square' },
      {
        checked: true,
        disabled: true,
        pressed: false,
      },
    )

    expect(checked.indicator).toMatchObject({
      backgroundColor: token.checkedBackground,
      borderColor: token.checkedBackground,
      borderRadius: token.borderRadius,
    })
    expect(checked.checkColor).toBe(token.checkedIconColor)
    expect(disabledChecked.indicator).toMatchObject({
      backgroundColor: token.disabledBackground,
      borderColor: token.disabledColor,
    })
    expect(disabledChecked.checkColor).toBe(token.disabledColor)
  })

  it('renders the button variant without a checkbox indicator', async () => {
    await render(
      <ConfigProvider>
        <Checkbox testID="button-unchecked" variant="button">
          Unchecked button
        </Checkbox>
        <Checkbox testID="button-checked" variant="button" checked>
          Checked button
        </Checkbox>
        <Checkbox testID="button-disabled" variant="button" disabled checked>
          Disabled button
        </Checkbox>
      </ConfigProvider>,
    )

    expect(styleOf('button-unchecked')).toMatchObject({
      backgroundColor: getCheckboxToken(getDesignToken()).buttonBackground,
      borderWidth: 1,
    })
    expect(styleOf('button-checked')).toMatchObject({
      backgroundColor: getCheckboxToken(getDesignToken()).checkedBackground,
    })
    expect(styleOf('button-disabled')).toMatchObject({
      backgroundColor: getCheckboxToken(getDesignToken()).buttonDisabledBackground,
      borderColor: getCheckboxToken(getDesignToken()).disabledColor,
    })
    expect(screen.getByTestId('button-checked').children).toHaveLength(1)
    expect(screen.getByText('Checked button')).toBeTruthy()
  })

  it('toggles a button variant across the full content-sized pressable', async () => {
    const onChange = jest.fn()
    await render(
      <ConfigProvider>
        <Checkbox testID="button-toggle" variant="button" onChange={onChange}>
          Apple
        </Checkbox>
      </ConfigProvider>,
    )

    const checkbox = screen.getByTestId('button-toggle')
    const initialStyle = styleOf('button-toggle')
    expect(initialStyle.width).toBeUndefined()
    expect(initialStyle.flex).toBeUndefined()

    await press(checkbox)
    expect(checkbox.props.accessibilityState?.checked).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith(true)

    await press(checkbox)
    expect(checkbox.props.accessibilityState?.checked).toBe(false)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })
})

describe('CheckboxGroup', () => {
  it('supports multiple selection and reports the next value', async () => {
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <CheckboxGroup testID="group" defaultValue={['a']} onChange={onChange}>
          <Checkbox testID="first" name="a">
            A
          </Checkbox>
          <Checkbox testID="second" name="b">
            B
          </Checkbox>
        </CheckboxGroup>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('first').props.accessibilityState?.checked).toBe(true)
    expect(screen.getByTestId('second').props.accessibilityState?.checked).toBe(false)
    await press(screen.getByText('B'))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    expect(screen.getByTestId('second').props.accessibilityState?.checked).toBe(true)

    await press(screen.getByText('A'))
    expect(onChange).toHaveBeenLastCalledWith(['b'])
  })

  it('lets child disabled state block only that child and group disabled override children', async () => {
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <CheckboxGroup testID="enabled-group" onChange={onChange}>
          <Checkbox testID="child-disabled" name="disabled" disabled>
            Disabled child
          </Checkbox>
          <Checkbox testID="child-enabled" name="enabled">
            Enabled child
          </Checkbox>
        </CheckboxGroup>
        <CheckboxGroup testID="disabled-group" disabled>
          <Checkbox testID="group-child" name="group" disabled={false}>
            Disabled group
          </Checkbox>
        </CheckboxGroup>
      </ConfigProvider>,
    )

    await press(screen.getByText('Disabled child'))
    expect(onChange).not.toHaveBeenCalled()
    await press(screen.getByText('Enabled child'))
    expect(onChange).toHaveBeenCalledWith(['enabled'])
    expect(screen.getByTestId('group-child').props.accessibilityState?.disabled).toBe(true)
  })

  it('supports horizontal direction and exposes the compound API', async () => {
    expect(Checkbox.Group).toBe(CheckboxGroup)
    await render(
      <ConfigProvider>
        <CheckboxGroup testID="horizontal" direction="horizontal" gap={16}>
          <Checkbox name="one">One</Checkbox>
          <Checkbox name="two">Two</Checkbox>
        </CheckboxGroup>
      </ConfigProvider>,
    )

    expect(styleOf('horizontal')).toMatchObject({ flexDirection: 'row', gap: 16 })
  })
})
