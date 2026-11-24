/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { StrictMode, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Pressable, Text, View } from 'react-native'
import { ConfigProvider, Portal, PortalHost, TsukiProvider, useTsukiTheme } from '..'
import { OverlayRegistryContext } from '../overlay/context'
import { createOverlayRegistry } from '../overlay/registry'
import type { OverlayRegistry } from '../overlay/types'

jest.mock('../overlay/transition', () => {
  const React = jest.requireActual('react')
  return {
    OverlayEntryTransition: ({ entry }: { entry: { content: ReactNode; mask?: ReactNode } }) =>
      React.createElement(React.Fragment, null, entry.mask, entry.content),
  }
})

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

it('renders arbitrary children in the default Host and removes them with the owner', async () => {
  const view = await render(
    <TsukiProvider scheme="light">
      <Portal>
        <View testID="portal-content">
          <Text>Portal content</Text>
        </View>
      </Portal>
    </TsukiProvider>,
  )

  expect(screen.getByTestId('portal-content')).toBeTruthy()
  expect(screen.getByTestId(/^tsuki-portal-layer-/)).toBeTruthy()

  view.unmount()
  await waitFor(() => expect(screen.queryByTestId('portal-content')).toBeNull())
})

it('keeps multiple entries ordered and updates content without replacing their identities', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }

  function Harness() {
    const [revision, setRevision] = useState(0)
    return (
      <>
        <Portal>
          <Text testID="portal-first">First {revision}</Text>
        </Portal>
        <Portal>
          <Text testID="portal-second">Second</Text>
        </Portal>
        <Text onPress={() => setRevision((value) => value + 1)} testID="portal-update">
          Update
        </Text>
        <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
      </>
    )
  }

  await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )

  await waitFor(() => expect(registryStore.current).not.toBeNull())
  const registry = requireRegistry(registryStore)
  const before = registry.getPortalSnapshot().map((entry) => entry.id)
  expect(registry.getPortalSnapshot().map((entry) => entry.order)).toEqual([0, 1])
  expect(screen.getByTestId('portal-first').props.children).toEqual(['First ', 0])
  expect(screen.getByTestId('portal-second')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('portal-update'))

  expect(registry.getPortalSnapshot().map((entry) => entry.id)).toEqual(before)
  expect(registry.getPortalSnapshot()).toHaveLength(2)
  expect(screen.getByTestId('portal-first').props.children).toEqual(['First ', 1])
})

it('bridges root and ConfigProvider theme updates', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }

  function ThemeText() {
    const theme = useTsukiTheme()
    return <Text testID="portal-theme">{`${theme.scheme}/${theme.semantic.colorPrimary}`}</Text>
  }

  function Harness() {
    const [scheme, setScheme] = useState<'light' | 'dark'>('light')
    return (
      <TsukiProvider scheme={scheme}>
        <ConfigProvider theme={{ semantic: { colorPrimary: '#db2777' } }}>
          <Portal>
            <ThemeText />
          </Portal>
          <Pressable
            onPress={() => setScheme((current) => (current === 'light' ? 'dark' : 'light'))}
            testID="portal-theme-toggle"
          >
            <Text>Toggle theme</Text>
          </Pressable>
          <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
        </ConfigProvider>
      </TsukiProvider>
    )
  }

  await render(<Harness />)
  await waitFor(() => expect(registryStore.current).not.toBeNull())
  const registry = requireRegistry(registryStore)
  expect(screen.getByTestId('portal-theme').props.children).toBe('light/#db2777')

  await fireEvent.press(screen.getByTestId('portal-theme-toggle'))

  expect(screen.getByTestId('portal-theme').props.children).toBe('dark/#db2777')
  expect(registry.getPortalSnapshot()[0].theme.scheme).toBe('dark')
})

it('does not join Overlay Back or modal isolation and keeps Roots isolated', async () => {
  const firstStore: { current: OverlayRegistry | null } = { current: null }
  const secondStore: { current: OverlayRegistry | null } = { current: null }
  await render(
    <>
      <TsukiProvider scheme="light">
        <Text testID="first-page">First page</Text>
        <Portal>
          <Text>First root portal</Text>
        </Portal>
        <RegistryCapture onRegistry={(registry) => (firstStore.current = registry)} />
      </TsukiProvider>
      <TsukiProvider scheme="dark">
        <Text testID="second-page">Second page</Text>
        <Portal>
          <Text>Second root portal</Text>
        </Portal>
        <RegistryCapture onRegistry={(registry) => (secondStore.current = registry)} />
      </TsukiProvider>
    </>,
  )

  await waitFor(() => {
    expect(firstStore.current).not.toBeNull()
    expect(secondStore.current).not.toBeNull()
  })
  const first = requireRegistry(firstStore)
  const second = requireRegistry(secondStore)
  expect(first).not.toBe(second)
  expect(first.getPortalSnapshot()[0].id).toBe(1)
  expect(second.getPortalSnapshot()[0].id).toBe(1)
  expect(first.getSnapshot()).toEqual([])
  expect(second.getSnapshot()).toEqual([])
  expect(first.dispatchBack()).toBe(false)
  expect(second.dispatchBack()).toBe(false)
  expect(
    screen
      .getAllByTestId('tsuki-overlay-page-accessibility-boundary')
      .map((node) => node.props.importantForAccessibility),
  ).toEqual(['auto', 'auto'])
  expect(screen.getByText('First root portal')).toBeTruthy()
  expect(screen.getByText('Second root portal')).toBeTruthy()
})

it('keeps a single entry under StrictMode effect replay and releases it on owner cleanup', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }
  const view = await render(
    <StrictMode>
      <TsukiProvider scheme="light">
        <Portal>
          <Text>Strict portal</Text>
        </Portal>
        <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
      </TsukiProvider>
    </StrictMode>,
  )

  await waitFor(() => expect(registryStore.current).not.toBeNull())
  const registry = requireRegistry(registryStore)
  expect(registry.getPortalSnapshot()).toHaveLength(1)
  expect(screen.getAllByText('Strict portal')).toHaveLength(1)

  view.unmount()
  await waitFor(() => expect(registry.getPortalSnapshot()).toEqual([]))
})

it('keeps entries pending while their named Host is absent and restores them when it returns', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }

  function Harness() {
    const [hostMounted, setHostMounted] = useState(false)
    return (
      <>
        <Portal host="screen-overlay">
          <Text testID="named-portal-content">Named content</Text>
        </Portal>
        {hostMounted ? <PortalHost name="screen-overlay" /> : null}
        <Pressable onPress={() => setHostMounted((mounted) => !mounted)} testID="toggle-named-host">
          <Text>Toggle Host</Text>
        </Pressable>
        <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
      </>
    )
  }

  await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )
  await waitFor(() => expect(registryStore.current).not.toBeNull())
  const registry = requireRegistry(registryStore)
  const id = registry.getPortalSnapshot()[0].id

  expect(screen.queryByTestId('named-portal-content')).toBeNull()
  await fireEvent.press(screen.getByTestId('toggle-named-host'))
  expect(screen.getByTestId('named-portal-content')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('toggle-named-host'))
  expect(screen.queryByTestId('named-portal-content')).toBeNull()
  expect(registry.getPortalSnapshot().map((entry) => entry.id)).toEqual([id])

  await fireEvent.press(screen.getByTestId('toggle-named-host'))
  expect(screen.getByTestId('named-portal-content')).toBeTruthy()
  expect(registry.getPortalSnapshot().map((entry) => entry.id)).toEqual([id])
})

it('moves an Entry when its target changes and renders it only at the matching Host', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }

  function Harness() {
    const [host, setHost] = useState('screen-one')
    return (
      <>
        <PortalHost name="screen-one" />
        <PortalHost name="screen-two" />
        <Portal host={host}>
          <Text testID="moving-content">Target {host}</Text>
        </Portal>
        <Pressable onPress={() => setHost('screen-two')} testID="move-portal">
          <Text>Move Portal</Text>
        </Pressable>
        <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
      </>
    )
  }

  await render(
    <TsukiProvider scheme="light">
      <Harness />
    </TsukiProvider>,
  )
  await waitFor(() => expect(registryStore.current).not.toBeNull())
  const registry = requireRegistry(registryStore)
  const firstId = registry.getPortalSnapshot()[0].id
  expect(screen.getByTestId('moving-content').props.children).toEqual(['Target ', 'screen-one'])

  await fireEvent.press(screen.getByTestId('move-portal'))

  expect(screen.getByTestId('moving-content').props.children).toEqual(['Target ', 'screen-two'])
  expect(registry.getPortalSnapshot()).toMatchObject([{ id: firstId, host: 'screen-two' }])
})

it('keeps named Host names Root-scoped, unique and separate from the single OverlayHost', () => {
  const first = createOverlayRegistry()
  const second = createOverlayRegistry()
  const firstHost = {}
  const sameNameInAnotherRoot = {}
  const registration = first.registerPortalHost('screen-overlay', firstHost)

  expect(() => first.registerPortalHost('screen-overlay', {})).toThrow(
    'already registered in this Root',
  )
  expect(() => first.registerPortalHost('root', {})).toThrow('reserved name "root"')
  expect(second.registerPortalHost('screen-overlay', sameNameInAnotherRoot).host).toBe(
    sameNameInAnotherRoot,
  )
  expect(first.unregisterPortalHost({ ...registration })).toBe(false)
  expect(first.unregisterPortalHost(registration)).toBe(true)
  expect(first.registerPortalHost('screen-overlay', {})).toBeTruthy()
  expect(() => first.registerHost({})).not.toThrow()
})

function RegistryCapture({ onRegistry }: { onRegistry: (registry: OverlayRegistry) => void }) {
  const registry = useContext(OverlayRegistryContext)
  if (!registry) throw new Error('RegistryCapture must be inside a TsukiProvider.')
  useEffect(() => {
    onRegistry(registry)
  }, [onRegistry, registry])
  return null
}

function requireRegistry(store: { current: OverlayRegistry | null }) {
  if (!store.current) throw new Error('Expected the Portal to resolve its root Registry.')
  return store.current
}
