import { cleanup, render, screen } from '@testing-library/react-native'
import { TextInput, UIProvider } from '../src'

afterEach(cleanup)

test('renders the migrated text input contract', async () => {
  await render(
    <UIProvider>
      <TextInput placeholder="请输入" clearable />
    </UIProvider>,
  )

  expect(screen.getByPlaceholderText('请输入')).toBeTruthy()
  expect(TextInput.Number).toBeDefined()
  expect(TextInput.Password).toBeDefined()
})
