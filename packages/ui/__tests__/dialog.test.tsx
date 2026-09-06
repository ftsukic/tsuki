import { cleanup, render, screen } from '@testing-library/react-native'
import { Dialog, UIProvider } from '../src'

afterEach(cleanup)

test('renders a controlled dialog', async () => {
  await render(
    <UIProvider>
      <Dialog visible duration={0} title="提示" message="操作完成" />
    </UIProvider>,
  )

  expect(screen.getByText('提示')).toBeTruthy()
  expect(screen.getByText('操作完成')).toBeTruthy()
})
