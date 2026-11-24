import { fireEvent, render, screen } from '@testing-library/react-native'
import {
  Button,
  cn,
  ConfigProvider,
  Input,
  Portal,
  serializeTheme,
  TsukiProvider,
  useTsukiTheme,
} from '..'
import type { ResolvedTheme, ThemeScopeKind, ThemeScopeRenderer } from '..'
import { StyleSheet, Text, View } from 'react-native'

function ThemeProbe({ testID }: { testID: string }) {
  const theme = useTsukiTheme()
  return (
    <Text testID={testID}>
      {theme.semantic.colorPrimary}:{theme.components.Button.height}
    </Text>
  )
}

describe('Tsuki v2 theme scopes', () => {
  it('merges nested overrides and resets inheritance to scheme defaults', async () => {
    await render(
      <TsukiProvider
        scheme="dark"
        theme={{ semantic: { colorPrimary: '#123456' }, components: { Button: { height: 52 } } }}
      >
        <ThemeProbe testID="root-theme" />
        <ConfigProvider
          theme={{ semantic: { colorPrimary: '#654321' }, components: { Button: { height: 60 } } }}
        >
          <ThemeProbe testID="nested-theme" />
        </ConfigProvider>
        <ConfigProvider theme={{ inherit: false, semantic: { colorPrimary: '#abcdef' } }}>
          <ThemeProbe testID="reset-theme" />
        </ConfigProvider>
      </TsukiProvider>,
    )

    expect(screen.getByTestId('root-theme').props.children).toEqual(['#123456', ':', 52])
    expect(screen.getByTestId('nested-theme').props.children).toEqual(['#654321', ':', 60])
    expect(screen.getByTestId('reset-theme').props.children).toEqual(['#abcdef', ':', 44])
  })

  it('serializes semantic and component tokens to CSS variables', async () => {
    let theme: ResolvedTheme | undefined
    function CaptureTheme() {
      theme = useTsukiTheme()
      return null
    }

    await render(
      <TsukiProvider scheme="light">
        <CaptureTheme />
      </TsukiProvider>,
    )

    expect(serializeTheme(theme!)).toMatchObject({
      '--tsuki-color-primary': '#055FFD',
      '--tsuki-button-border-radius': '8px',
      '--tsuki-input-height': '44px',
    })
  })

  it('updates the resolved theme when the scheme and override change', async () => {
    const view = await render(
      <TsukiProvider scheme="light">
        <ThemeProbe testID="dynamic-theme" />
      </TsukiProvider>,
    )

    expect(screen.getByTestId('dynamic-theme').props.children).toEqual(['#055FFD', ':', 44])

    await view.rerender(
      <TsukiProvider
        scheme="dark"
        theme={{ semantic: { colorPrimary: '#123456' }, components: { Button: { height: 56 } } }}
      >
        <ThemeProbe testID="dynamic-theme" />
      </TsukiProvider>,
    )

    expect(screen.getByTestId('dynamic-theme').props.children).toEqual(['#123456', ':', 56])
  })

  it('bridges serialized CSS variables through renderThemeScope for root, ConfigProvider, and overlays', async () => {
    const scopes: Array<{ kind: ThemeScopeKind; primary: string }> = []
    const renderThemeScope: ThemeScopeRenderer = ({ kind, variables, children }) => {
      scopes.push({ kind, primary: variables['--tsuki-color-primary'] })
      return <View testID={`theme-scope-${kind}`}>{children}</View>
    }

    await render(
      <TsukiProvider renderThemeScope={renderThemeScope} scheme="dark">
        <ConfigProvider theme={{ semantic: { colorPrimary: '#7c3aed' } }}>
          <Portal>
            <Text>Portaled content</Text>
          </Portal>
        </ConfigProvider>
      </TsukiProvider>,
    )

    expect(screen.getByText('Portaled content')).toBeTruthy()
    expect(scopes).toEqual(
      expect.arrayContaining([
        { kind: 'root', primary: '#4D8DFF' },
        { kind: 'scope', primary: '#7c3aed' },
        { kind: 'overlay', primary: '#7c3aed' },
      ]),
    )
  })
})

describe('Tsuki v2 class merging', () => {
  it.each([
    ['h-tsuki-button h-12', 'h-12'],
    ['h-12 h-tsuki-button', 'h-tsuki-button'],
    ['rounded-tsuki-button rounded-xl', 'rounded-xl'],
    ['rounded-xl rounded-tsuki-button', 'rounded-tsuki-button'],
    ['rounded-tsuki-dialog rounded-2xl', 'rounded-2xl'],
    ['rounded-tsuki-popup rounded-none', 'rounded-none'],
    ['w-tsuki-dialog w-80', 'w-80'],
    ['bg-tsuki-primary bg-red-500', 'bg-red-500'],
    ['bg-tsuki-surface-elevated bg-blue-500', 'bg-blue-500'],
    ['text-tsuki-dialog-title text-red-500', 'text-tsuki-dialog-title text-red-500'],
    ['text-tsuki-dialog-title text-lg', 'text-lg'],
    ['text-tsuki-cell-font-size text-red-500', 'text-tsuki-cell-font-size text-red-500'],
    ['opacity-tsuki-button-disabled-opacity opacity-50', 'opacity-50'],
    ['duration-tsuki-popup duration-300', 'duration-300'],
  ])('merges %s to %s', (input, expected) => {
    expect(cn(input)).toBe(expected)
  })
})

describe('Tsuki v2 foundation components', () => {
  it('applies CVA variants and size classes', async () => {
    await render(
      <Button variant="outlined" size="large">
        Continue
      </Button>,
    )

    const className = screen.getByRole('button').props.className as string
    expect(className).toContain('bg-tsuki-surface')
    expect(className).toContain('h-12')
    expect(className).toContain('px-5')
    expect(className).not.toContain('bg-tsuki-primary')
  })

  it('exposes an accessible Button press action', async () => {
    const onPress = jest.fn()
    await render(<Button onPress={onPress}>Save</Button>)

    fireEvent.press(screen.getByRole('button', { name: 'Save' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('keeps a loading Button busy and prevents presses', async () => {
    const onPress = jest.fn()
    await render(
      <Button loading onPress={onPress}>
        Save
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Save' })
    fireEvent.press(button)

    expect(onPress).not.toHaveBeenCalled()
    expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true })
  })

  it('applies the icon slot class and lets style override the root style slot', async () => {
    await render(
      <Button
        icon={<Text>✓</Text>}
        classNames={{ icon: 'ml-4' }}
        style={{ minWidth: 120 }}
        styles={{ root: { minWidth: 80 } }}
      >
        Continue
      </Button>,
    )

    expect(screen.getByText('✓').parent?.props.className).toBe('mr-2 ml-4')
    expect(StyleSheet.flatten(screen.getByRole('button').props.style)).toMatchObject({
      minWidth: 120,
    })
  })

  it('lets primary className override classNames.root consistently with style > styles.root', async () => {
    await render(
      <>
        <Button className="bg-red-500" classNames={{ root: 'bg-blue-500 px-8' }}>
          Priority
        </Button>
        <Input
          accessibilityLabel="Priority input"
          className="border-red-500"
          classNames={{ root: 'border-blue-500 px-6' }}
        />
      </>,
    )

    const buttonClassName = screen.getByRole('button').props.className as string
    expect(buttonClassName).toContain('bg-red-500')
    expect(buttonClassName).toContain('px-8')
    expect(buttonClassName).not.toContain('bg-blue-500')

    const inputRootClassName = screen.getByLabelText('Priority input').parent?.props
      .className as string
    expect(inputRootClassName).toContain('border-red-500')
    expect(inputRootClassName).toContain('px-6')
    expect(inputRootClassName).not.toContain('border-blue-500')
  })

  it('forwards TextInput value and change behavior through Input', async () => {
    const onChangeText = jest.fn()
    const onFocus = jest.fn()
    const onBlur = jest.fn()
    await render(
      <Input
        accessibilityLabel="Email"
        value="a@example.com"
        onBlur={onBlur}
        onChangeText={onChangeText}
        onFocus={onFocus}
      />,
    )

    const input = screen.getByLabelText('Email')
    fireEvent.changeText(input, 'b@example.com')

    expect(onChangeText).toHaveBeenCalledWith('b@example.com')
    expect(input.props.onFocus).toBe(onFocus)
    expect(input.props.onBlur).toBe(onBlur)
    expect(input.props.value).toBe('a@example.com')
  })

  it('supports uncontrolled Input values and accessibility error hints', async () => {
    const onChangeText = jest.fn()
    await render(
      <Input
        accessibilityLabel="Amount"
        accessibilityHint="Enter a number"
        defaultValue="4"
        error="Amount is required"
        onChangeText={onChangeText}
        prefix={<Text>$</Text>}
        suffix={<Text>USD</Text>}
        classNames={{ prefix: 'mr-1', suffix: 'ml-1' }}
      />,
    )

    const input = screen.getByLabelText('Amount')
    fireEvent.changeText(input, '5')

    expect(onChangeText).toHaveBeenCalledWith('5')
    expect(input.props.accessibilityHint).toBe('Enter a number. Amount is required')
    expect(input.props.defaultValue).toBe('4')
    expect(input.parent?.props.className).toContain('border-tsuki-danger')
    expect(screen.getByText('$').parent?.props.className).toBe('mr-1')
    expect(screen.getByText('USD').parent?.props.className).toBe('ml-1')
  })

  it('applies disabled opacity classes to Button and Input and adapts Input height for multiline', async () => {
    await render(
      <>
        <Button disabled>Disabled Button</Button>
        <Button loading>Loading Button</Button>
        <Input accessibilityLabel="Disabled Input" disabled />
        <Input accessibilityLabel="Notes" multiline />
      </>,
    )

    expect(screen.getByRole('button', { name: 'Disabled Button' }).props.className).toContain(
      'opacity-tsuki-button-disabled-opacity',
    )
    expect(screen.getByRole('button', { name: 'Loading Button' }).props.className).toContain(
      'opacity-tsuki-button-disabled-opacity',
    )

    const disabledInputRoot = screen.getByLabelText('Disabled Input').parent?.props
      .className as string
    expect(disabledInputRoot).toContain('opacity-tsuki-input-disabled-opacity')

    const notesInput = screen.getByLabelText('Notes')
    const notesRootClasses = String(notesInput.parent?.props.className ?? '').split(/\s+/)
    expect(notesInput.props.className).not.toContain('h-full')
    expect(notesRootClasses).toContain('min-h-tsuki-input')
    expect(notesRootClasses).not.toContain('h-tsuki-input')
  })

  it('gives disabled precedence over editable and reports the disabled state', async () => {
    await render(<Input accessibilityLabel="Locked" disabled editable />)

    const input = screen.getByLabelText('Locked')
    expect(input.props.editable).toBe(false)
    expect(input.props.accessibilityState).toMatchObject({ disabled: true })
  })
})
