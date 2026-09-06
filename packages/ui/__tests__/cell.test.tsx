import { cleanup, render, screen } from '@testing-library/react-native'
import { Cell, UIProvider } from '../src'

afterEach(cleanup)

test('renders title and value', async () => {
  await render(
    <UIProvider>
      <Cell title="标题" value="值" />
    </UIProvider>,
  )

  expect(screen.getByText('标题')).toBeTruthy()
  expect(screen.getByText('值')).toBeTruthy()
})
