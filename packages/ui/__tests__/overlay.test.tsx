import { cleanup, render, screen } from '@testing-library/react-native'
import { Overlay, UIProvider } from '../src'

afterEach(cleanup)

test('renders a visible overlay through the portal host', async () => {
  await render(
    <UIProvider>
      <Overlay visible duration={0} testID="overlay" />
    </UIProvider>,
  )

  expect(screen.getByTestId('overlay')).toBeTruthy()
})
