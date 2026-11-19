/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import { TsukiProvider, useTsukiTheme } from '@ftsukic/tsuki'
import { View } from 'react-native'
import type { PropsWithChildren } from 'react'
import { ConsumerDemo } from '../src'
import type { ConsumerThemeVariablesProps } from '../src'

jest.mock('nativewind', () => ({ vars: () => ({}) }), { virtual: true })

const onCycleAppearance = jest.fn()

function ThemeVariables({ children }: PropsWithChildren<ConsumerThemeVariablesProps>) {
  const theme = useTsukiTheme()
  return (
    <View style={{ flex: 1, backgroundColor: theme.semantic.colorBackground }}>{children}</View>
  )
}

function App() {
  return (
    <TsukiProvider scheme="light">
      <ThemeVariables>
        <ConsumerDemo
          ThemeVariables={ThemeVariables}
          appearance="system"
          scheme="light"
          title="Tsuki NativeWind consumer"
          onCycleAppearance={onCycleAppearance}
        />
      </ThemeVariables>
    </TsukiProvider>
  )
}

afterEach(async () => {
  await cleanup()
  onCycleAppearance.mockClear()
})

it('renders the shared scenarios for all nine v2 components', async () => {
  await render(<App />)

  for (const testID of [
    'root-button',
    'root-input',
    'root-text',
    'nested-primary',
    'space-gap',
    'divider-default',
    'surface-default',
    'card-simple',
    'cell-group',
  ]) {
    expect(screen.getByTestId(testID)).toBeTruthy()
  }
  expect(screen.getByText('Icon presses: 0')).toBeTruthy()
  expect(screen.getByTestId('nested-primary').props.children).toContain('#7c3aed')
})

it('keeps theme controls and component interactions active', async () => {
  await render(<App />)

  await fireEvent.press(screen.getByTestId('scheme-toggle'))
  await fireEvent.press(screen.getByTestId('cell-action'))
  await fireEvent.press(screen.getByText('Save card'))
  await fireEvent.press(screen.getByTestId('surface-padding-toggle'))
  await fireEvent.press(screen.getByTestId('divider-thickness-toggle'))
  await fireEvent.press(screen.getByTestId('space-gap-toggle'))

  expect(onCycleAppearance).toHaveBeenCalledTimes(1)
  expect(screen.getByText('Count: 1')).toBeTruthy()
  expect(screen.getByText('Card saved')).toBeTruthy()
  expect(screen.getByText('Change surface padding (20)')).toBeTruthy()
  expect(screen.getByText('Change divider thickness (7)')).toBeTruthy()
  expect(screen.getByText('Change Space gap (19)')).toBeTruthy()
})
