import { act, cleanup, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { ConfigProvider, Notify, PortalHost } from '..'
import type { ReactNode } from 'react'

function AppProvider({ children }: { children?: ReactNode }) {
  return (
    <ConfigProvider theme={{ token: { motion: false } }}>
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

describe('Notify', () => {
  afterEach(() => {
    cleanup()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('uses its own top layer animation and close lifecycle', async () => {
    jest.useFakeTimers()
    const onClosed = jest.fn()
    const view = await render(
      <AppProvider>
        <Notify duration={100} message="顶部通知" onClosed={onClosed} />
      </AppProvider>,
    )

    const message = screen.getByText('顶部通知')
    const bar = message.parent?.parent
    expect(StyleSheet.flatten(bar?.props.style)).toMatchObject({ width: '100%' })

    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    expect(screen.queryByText('顶部通知')).toBeNull()
    expect(onClosed).toHaveBeenCalledTimes(1)
    await view.unmount()
  })
})
