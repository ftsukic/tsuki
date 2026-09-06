import { cleanup, render, screen } from '@testing-library/react-native'
import { Toast, UIProvider } from '../src'

afterEach(cleanup)

test('renders a visible toast through the portal host', async () => {
  await render(
    <UIProvider>
      <Toast message="已保存" duration={0} />
    </UIProvider>,
  )

  expect(screen.getByText('已保存')).toBeTruthy()
  expect(Toast.show).toBeDefined()
})
