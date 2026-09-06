import { cleanup, render, screen } from '@testing-library/react-native'
import { Button, UIThemeProvider } from '../src'

afterEach(cleanup)

test('applies theme overrides through UIThemeProvider', async () => {
  await render(
    <UIThemeProvider theme={{ token: { colorPrimary: '#07c160' } }}>
      <Button text="主题按钮" />
    </UIThemeProvider>,
  )

  expect(screen.getByText('主题按钮')).toBeTruthy()
})
