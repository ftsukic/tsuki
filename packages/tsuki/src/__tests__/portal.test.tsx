import { act, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Portal } from 'react-native-teleport'
import { Dialog, showDialog, closeDialog } from '..'
import { PortalHost } from './test-host'

it('renders direct Teleport Portal content beneath the application provider', async () => {
  await render(
    <PortalHost>
      <Portal hostName="root">
        <Text testID="teleported-content">Content</Text>
      </Portal>
    </PortalHost>,
  )

  expect(screen.getByTestId('teleported-content')).toHaveTextContent('Content')
})

it('keeps function based Dialog available through the Tsuki React renderer', async () => {
  await render(<PortalHost />)
  await act(async () => {
    showDialog({ message: 'Imperative content' })
  })

  expect(screen.getByText('Imperative content')).toBeTruthy()
  await act(async () => closeDialog())
})

it('keeps controlled dialogs as declarative Teleport consumers', async () => {
  await render(
    <PortalHost>
      <Dialog show title="Declarative" message="Controlled content" />
    </PortalHost>,
  )

  expect(screen.getByText('Controlled content')).toBeTruthy()
})
