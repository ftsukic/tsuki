import { PortalHost } from './test-host'
import { act, cleanup, render, screen } from '@testing-library/react-native'
import { createRef } from 'react'
import { ScrollView } from 'react-native'
import { DropdownItem, DropdownMenu, useBackgroundScrollLocked } from '..'
import type { DropdownMenuRef } from '..'

function Background({ id }: { id: string }) {
  const locked = useBackgroundScrollLocked()
  return <ScrollView testID={id} scrollEnabled={!locked} />
}

afterEach(async () => {
  await cleanup()
})

it('keeps sibling holders locked, releases on unmount, and isolates PortalHosts', async () => {
  const first = createRef<DropdownMenuRef>()
  const second = createRef<DropdownMenuRef>()
  const content = (show: boolean) => (
    <>
      <PortalHost>
        <Background id="first-background" />
        <DropdownMenu ref={first} duration={0}>
          <DropdownItem options={[{ text: 'A', value: 'a' }]} />
        </DropdownMenu>
        {show ? (
          <DropdownMenu ref={second} duration={0}>
            <DropdownItem options={[{ text: 'B', value: 'b' }]} />
          </DropdownMenu>
        ) : null}
      </PortalHost>
      <PortalHost>
        <Background id="other-background" />
      </PortalHost>
    </>
  )
  const view = await render(content(true))
  await act(async () => {
    first.current?.open(0)
    second.current?.open(0)
  })
  expect(screen.getByTestId('first-background').props.scrollEnabled).toBe(false)
  expect(screen.getByTestId('other-background').props.scrollEnabled).toBe(true)
  await act(async () => first.current?.close())
  expect(screen.getByTestId('first-background').props.scrollEnabled).toBe(false)
  await view.rerender(content(false))
  expect(screen.getByTestId('first-background').props.scrollEnabled).toBe(true)
})
