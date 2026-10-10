import { Checkbox, CheckboxGroup, ConfigProvider, getDesignToken } from '..'
import type { CheckboxGroupRef, CheckboxGroupToggleAllOptions } from '..'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { createRef } from 'react'
import { StyleSheet, View } from 'react-native'
import type { JsonElement } from 'test-renderer'
import { getCheckboxStyles } from '../checkbox/style'
import { getCheckboxToken } from '../checkbox/token'

async function press(target: Parameters<typeof fireEvent.press>[0]) {
  fireEvent.press(target)
  await Promise.resolve()
}

const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style)

async function toggleAll(
  ref: { current: CheckboxGroupRef | null },
  options?: boolean | CheckboxGroupToggleAllOptions,
) {
  await act(async () => {
    ref.current?.toggleAll(options)
    await Promise.resolve()
  })
}

function findNodes(
  node: JsonElement | null,
  predicate: (node: JsonElement) => boolean,
): JsonElement[] {
  if (node === null || typeof node === 'string') return []
  return (predicate(node) ? [node] : []).concat(
    node.children.flatMap((child) =>
      child === null || typeof child === 'string' ? [] : findNodes(child, predicate),
    ),
  )
}

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

  it('renders indeterminate as a mixed checked indicator', async () => {
    const view = await render(
      <ConfigProvider>
        <Checkbox testID="indeterminate" indeterminate>
          Indeterminate
        </Checkbox>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('indeterminate').props.accessibilityState).toMatchObject({
      checked: 'mixed',
      disabled: false,
    })
    const token = getCheckboxToken(getDesignToken())
    expect(
      findNodes(view.toJSON(), (node) => {
        const style = StyleSheet.flatten(node.props.style)
        return (
          style?.backgroundColor === token.checkedBackground &&
          style?.borderColor === token.checkedBackground
        )
      }),
    ).toHaveLength(1)
    expect(
      findNodes(view.toJSON(), (node) => node.type === 'RNSVGPath').map((node) => node.props.d),
    ).toContain(
      'M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z',
    )
  })

  it('prioritizes the indeterminate icon while preserving checked', async () => {
    const view = await render(
      <ConfigProvider>
        <Checkbox testID="checked-indeterminate" checked indeterminate>
          Checked and indeterminate
        </Checkbox>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('checked-indeterminate').props.accessibilityState?.checked).toBe(
      'mixed',
    )
    const paths = findNodes(view.toJSON(), (node) => node.type === 'RNSVGPath').map(
      (node) => node.props.d,
    )
    expect(paths).toEqual([
      'M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z',
    ])
  })

  it('keeps checked boolean toggle semantics for a controlled indeterminate checkbox', async () => {
    const uncheckedChange = jest.fn()
    const checkedChange = jest.fn()
    await render(
      <ConfigProvider>
        <Checkbox checked={false} indeterminate onChange={uncheckedChange}>
          Indeterminate unchecked
        </Checkbox>
        <Checkbox checked indeterminate onChange={checkedChange}>
          Indeterminate checked
        </Checkbox>
      </ConfigProvider>,
    )

    await press(screen.getByText('Indeterminate unchecked'))
    await press(screen.getByText('Indeterminate checked'))

    expect(uncheckedChange).toHaveBeenCalledWith(true)
    expect(checkedChange).toHaveBeenCalledWith(false)
    expect(
      screen.getByText('Indeterminate unchecked').parent?.props.accessibilityState?.checked,
    ).toBe('mixed')
    expect(
      screen.getByText('Indeterminate checked').parent?.props.accessibilityState?.checked,
    ).toBe('mixed')
  })

  it('uses disabled mixed styling and blocks disabled indeterminate presses', async () => {
    const onChange = jest.fn()
    const view = await render(
      <ConfigProvider>
        <Checkbox testID="disabled-indeterminate" disabled indeterminate onChange={onChange}>
          Disabled indeterminate
        </Checkbox>
      </ConfigProvider>,
    )

    await press(screen.getByText('Disabled indeterminate'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('disabled-indeterminate').props.accessibilityState).toMatchObject({
      checked: 'mixed',
      disabled: true,
    })
    const token = getCheckboxToken(getDesignToken())
    expect(
      findNodes(view.toJSON(), (node) => {
        const style = StyleSheet.flatten(node.props.style)
        return (
          style?.backgroundColor === token.disabledBackground &&
          style?.borderColor === token.disabledColor
        )
      }),
    ).toHaveLength(1)
  })

  it('passes indeterminate to semantic style state', async () => {
    let receivedState:
      { checked: boolean; indeterminate: boolean; disabled: boolean; pressed: boolean } | undefined

    await render(
      <ConfigProvider>
        <Checkbox
          checked
          indeterminate
          styles={({ state }) => {
            receivedState = state
            return {}
          }}
        />
      </ConfigProvider>,
    )

    expect(receivedState).toEqual({
      checked: true,
      indeterminate: true,
      disabled: false,
      pressed: false,
    })
  })

  it('uses the checkbox component tokens for checked and disabled styles', () => {
    const aliasToken = getDesignToken()
    const token = getCheckboxToken(aliasToken)
    const checked = getCheckboxStyles(
      token,
      { shape: 'square' },
      {
        checked: true,
        indeterminate: false,
        disabled: false,
        pressed: false,
      },
    )
    const disabledChecked = getCheckboxStyles(
      token,
      { shape: 'square' },
      {
        checked: true,
        indeterminate: false,
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

  it('uses root column gap for default labels in either position', () => {
    const token = getCheckboxToken(getDesignToken())

    const rightStyles = getCheckboxStyles(
      token,
      { labelPosition: 'right' },
      { checked: false, indeterminate: false, disabled: false, pressed: false },
    )
    expect(rightStyles.root.columnGap).toBe(token.gap)
    expect(rightStyles.label.marginLeft).toBeUndefined()
    expect(rightStyles.label.marginRight).toBeUndefined()
    expect(
      getCheckboxStyles(
        token,
        { labelPosition: 'left' },
        { checked: false, indeterminate: false, disabled: false, pressed: false },
      ).root.columnGap,
    ).toBe(token.gap)
  })

  it('applies the label semantic style only to text labels', async () => {
    const token = getCheckboxToken(getDesignToken())

    await render(
      <ConfigProvider>
        <Checkbox testID="custom-label" styles={{ label: { color: 'red', marginLeft: 99 } }}>
          <View testID="custom-label-content" />
        </Checkbox>
      </ConfigProvider>,
    )

    expect(styleOf('custom-label').columnGap).toBe(token.gap)
    expect(screen.getByTestId('custom-label-content').props.style).toBeUndefined()
  })

  it.each([
    ['solid', getCheckboxToken(getDesignToken()).checkedIconColor],
    ['filled', getCheckboxToken(getDesignToken()).checkedBackground],
    ['outlined', getCheckboxToken(getDesignToken()).checkedBackground],
  ] as const)('uses the shared checked label style for %s buttons', (buttonVariant, color) => {
    const styles = getCheckboxStyles(
      getCheckboxToken(getDesignToken()),
      { buttonVariant, variant: 'button' },
      {
        checked: true,
        indeterminate: false,
        disabled: false,
        pressed: false,
      },
    )

    expect(styles.label.color).toBe(color)
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
      height: getCheckboxToken(getDesignToken()).buttonHeight,
      minHeight: getCheckboxToken(getDesignToken()).buttonHeight,
      minWidth: getCheckboxToken(getDesignToken()).buttonMinWidth,
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

  it('inherits the Button visual variant through the group and preserves selection state', async () => {
    await render(
      <ConfigProvider>
        <Checkbox.Group variant="button" buttonVariant="filled" defaultValue={['filled']}>
          <Checkbox testID="filled-unchecked" name="unchecked">
            Unchecked
          </Checkbox>
          <Checkbox testID="filled-checked" name="filled">
            Checked
          </Checkbox>
        </Checkbox.Group>
      </ConfigProvider>,
    )

    expect(styleOf('filled-unchecked')).toMatchObject({
      backgroundColor: getCheckboxToken(getDesignToken()).buttonFilledBackground,
      borderWidth: 0,
    })
    expect(styleOf('filled-checked')).toMatchObject({
      backgroundColor: getCheckboxToken(getDesignToken()).buttonCheckedFilledBackground,
      borderWidth: 0,
    })
    expect(StyleSheet.flatten(screen.getByText('Checked').props.style).color).toBe(
      getCheckboxToken(getDesignToken()).checkedBackground,
    )
  })
})

describe('CheckboxGroup', () => {
  it('supports options and reports the next array value', async () => {
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <CheckboxGroup
          testID="options"
          defaultValue={['email']}
          onChange={onChange}
          options={[
            { value: 'email', label: '邮件' },
            { value: 'sms', label: '短信' },
            { value: 'locked', label: '锁定', disabled: true },
          ]}
        />
      </ConfigProvider>,
    )

    expect(screen.getByText('邮件').parent?.props.accessibilityState?.checked).toBe(true)
    expect(screen.getByText('短信').parent?.props.accessibilityState?.checked).toBe(false)
    await press(screen.getByText('短信'))
    expect(onChange).toHaveBeenCalledWith(['email', 'sms'])
    expect(screen.getByText('短信').parent?.props.accessibilityState?.checked).toBe(true)

    await press(screen.getByText('邮件'))
    expect(onChange).toHaveBeenLastCalledWith(['sms'])

    await press(screen.getByText('锁定'))
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('uses button options in the equal-width Grid layout', async () => {
    const view = await render(
      <ConfigProvider>
        <CheckboxGroup
          variant="button"
          buttonLayout="equal"
          direction="horizontal"
          buttonColumns={2}
          options={[
            { value: 'one', label: '选项一' },
            { value: 'two', label: '选项二' },
            { value: 'three', label: '选项三' },
          ]}
        />
      </ConfigProvider>,
    )

    expect(screen.getByText('选项一')).toBeTruthy()
    expect(screen.getByText('选项二')).toBeTruthy()
    expect(screen.getByText('选项三')).toBeTruthy()
    expect(
      findNodes(view.toJSON(), (node) => {
        const style = StyleSheet.flatten(node.props.style)
        return style?.flexBasis === '50%'
      }),
    ).toHaveLength(3)
  })

  it('warns and prefers children when options and children are both provided', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    await render(
      <ConfigProvider>
        <CheckboxGroup options={[{ value: 'option', label: '配置项' }]}>
          <Checkbox name="child">子项</Checkbox>
        </CheckboxGroup>
      </ConfigProvider>,
    )

    expect(error).toHaveBeenCalledWith(
      'Checkbox.Group accepts either options or children, not both.',
    )
    expect(screen.getByText('子项')).toBeTruthy()
    expect(screen.queryByText('配置项')).toBeNull()
    error.mockRestore()
  })

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

  it('inherits button variants and wraps equal-width options through Grid', async () => {
    const view = await render(
      <ConfigProvider>
        <Checkbox.Group
          testID="equal-grid"
          variant="button"
          buttonLayout="equal"
          buttonColumns={5}
          direction="horizontal"
          gap={8}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <Checkbox key={index} testID={`grid-${index}`} name={index}>
              {index === 0 ? '一个很长的选项' : `选项 ${index}`}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </ConfigProvider>,
    )

    expect(styleOf('grid-0')).toMatchObject({
      alignSelf: 'stretch',
      flexGrow: 0,
      flexShrink: 0,
      width: '100%',
    })
    expect(screen.getByText('一个很长的选项').props.numberOfLines).toBe(1)
    expect(
      findNodes(view.toJSON(), (node) => {
        const style = StyleSheet.flatten(node.props.style)
        return style?.flexBasis === '20%'
      }),
    ).toHaveLength(8)
  })

  it('supports imperative true, false, and per-item reverse operations', async () => {
    const ref = createRef<CheckboxGroupRef>()
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <Checkbox.Group ref={ref} defaultValue={['a']} onChange={onChange}>
          <Checkbox testID="toggle-a" name="a">
            A
          </Checkbox>
          <Checkbox testID="toggle-b" name="b">
            B
          </Checkbox>
          <Checkbox testID="toggle-c" name="c">
            C
          </Checkbox>
        </Checkbox.Group>
      </ConfigProvider>,
    )

    await toggleAll(ref, true)
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('toggle-a').props.accessibilityState?.checked).toBe(true)
    expect(screen.getByTestId('toggle-b').props.accessibilityState?.checked).toBe(true)
    expect(screen.getByTestId('toggle-c').props.accessibilityState?.checked).toBe(true)

    await toggleAll(ref, false)
    expect(onChange).toHaveBeenLastCalledWith([])
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('toggle-a').props.accessibilityState?.checked).toBe(false)
    expect(screen.getByTestId('toggle-b').props.accessibilityState?.checked).toBe(false)
    expect(screen.getByTestId('toggle-c').props.accessibilityState?.checked).toBe(false)

    await toggleAll(ref)
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'])
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('reverses each item independently instead of treating toggleAll as a select-all switch', async () => {
    const ref = createRef<CheckboxGroupRef>()
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <Checkbox.Group ref={ref} defaultValue={['a', 'c']} onChange={onChange}>
          <Checkbox name="a">A</Checkbox>
          <Checkbox name="b">B</Checkbox>
          <Checkbox name="c">C</Checkbox>
        </Checkbox.Group>
      </ConfigProvider>,
    )

    await toggleAll(ref)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(['b'])
  })

  it('supports skipDisabled for enabled items and includes disabled items by default', async () => {
    const ref = createRef<CheckboxGroupRef>()
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <Checkbox.Group ref={ref} defaultValue={['b']} onChange={onChange}>
          <Checkbox testID="skip-a" name="a">
            A
          </Checkbox>
          <Checkbox testID="skip-b" name="b" disabled>
            B
          </Checkbox>
          <Checkbox testID="skip-c" name="c">
            C
          </Checkbox>
        </Checkbox.Group>
      </ConfigProvider>,
    )

    await toggleAll(ref, { checked: true, skipDisabled: true })
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'])
    await toggleAll(ref, { checked: false, skipDisabled: true })
    expect(onChange).toHaveBeenLastCalledWith(['b'])
    expect(screen.getByTestId('skip-b').props.accessibilityState?.checked).toBe(true)

    await toggleAll(ref, true)
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'])
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('supports reverse operations with skipDisabled and preserves disabled values', async () => {
    const ref = createRef<CheckboxGroupRef>()
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <Checkbox.Group ref={ref} defaultValue={['a', 'b']} onChange={onChange}>
          <Checkbox name="a">A</Checkbox>
          <Checkbox name="b" disabled>
            B
          </Checkbox>
          <Checkbox name="c">C</Checkbox>
        </Checkbox.Group>
      </ConfigProvider>,
    )

    await toggleAll(ref, { skipDisabled: true })

    expect(onChange).toHaveBeenCalledWith(['b', 'c'])
  })

  it('allows imperative updates for a disabled group while skipDisabled preserves all items', async () => {
    const ref = createRef<CheckboxGroupRef>()
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <Checkbox.Group ref={ref} disabled defaultValue={['b']} onChange={onChange}>
          <Checkbox testID="group-disabled-a" name="a">
            A
          </Checkbox>
          <Checkbox testID="group-disabled-b" name="b">
            B
          </Checkbox>
        </Checkbox.Group>
      </ConfigProvider>,
    )

    await press(screen.getByText('A'))
    expect(onChange).not.toHaveBeenCalled()

    await toggleAll(ref, { checked: true, skipDisabled: true })
    expect(onChange).toHaveBeenCalledWith(['b'])
    expect(screen.getByTestId('group-disabled-a').props.accessibilityState?.checked).toBe(false)
    expect(screen.getByTestId('group-disabled-b').props.accessibilityState?.checked).toBe(true)

    await toggleAll(ref, true)
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'])
    expect(screen.getByTestId('group-disabled-a').props.accessibilityState?.checked).toBe(true)
  })

  it('keeps controlled rendered state unchanged while reporting one next value', async () => {
    const ref = createRef<CheckboxGroupRef>()
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <Checkbox.Group ref={ref} value={['a']} onChange={onChange}>
          <Checkbox testID="controlled-a" name="a">
            A
          </Checkbox>
          <Checkbox testID="controlled-b" name="b">
            B
          </Checkbox>
        </Checkbox.Group>
      </ConfigProvider>,
    )

    await toggleAll(ref, true)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    expect(screen.getByTestId('controlled-a').props.accessibilityState?.checked).toBe(true)
    expect(screen.getByTestId('controlled-b').props.accessibilityState?.checked).toBe(false)
  })

  it('supports toggleAll for options-generated checkboxes', async () => {
    const ref = createRef<CheckboxGroupRef>()

    await render(
      <ConfigProvider>
        <Checkbox.Group
          ref={ref}
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
            { value: 'locked', label: 'Locked', disabled: true },
          ]}
        />
      </ConfigProvider>,
    )

    await toggleAll(ref, { checked: true, skipDisabled: true })

    expect(screen.getByText('One').parent?.props.accessibilityState?.checked).toBe(true)
    expect(screen.getByText('Two').parent?.props.accessibilityState?.checked).toBe(true)
    expect(screen.getByText('Locked').parent?.props.accessibilityState?.checked).toBe(false)
  })

  it('preserves unknown values, render order, and value uniqueness', async () => {
    const ref = createRef<CheckboxGroupRef>()
    const onChange = jest.fn()

    await render(
      <ConfigProvider>
        <Checkbox.Group
          ref={ref}
          value={['external', 'c', 'external', 'a', 'a']}
          onChange={onChange}
        >
          <Checkbox name="a">A</Checkbox>
          <Checkbox name="b">B</Checkbox>
          <Checkbox name="c">C</Checkbox>
        </Checkbox.Group>
      </ConfigProvider>,
    )

    await toggleAll(ref, true)

    expect(onChange).toHaveBeenCalledWith(['external', 'a', 'b', 'c'])
  })
})
