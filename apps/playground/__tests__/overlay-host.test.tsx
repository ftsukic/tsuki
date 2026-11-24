/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { useState, type ReactNode } from 'react'
import { useEffect } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import { useOverlayRuntime } from '@tsuki-v2/overlay/use-overlay-runtime'
import type { OverlayRegistry } from '@tsuki-v2/overlay/types'
import { TsukiProvider } from '@tsuki-v2/theme/tsuki-provider'
import { DemoProvider } from '../components/demo-provider'
import { InteractionLabProvider } from '../components/interaction-lab/interaction-lab-provider'
import { OverlayStackLab } from '../components/interaction-lab/overlay/overlay-stack-lab'
import { OverlayDeclarativeLab } from '../components/interaction-lab/overlay/overlay-declarative-lab'
import { OverlayImperativeLab } from '../components/interaction-lab/overlay/overlay-imperative-lab'
import { OverlayAccessibilityLab } from '../components/interaction-lab/overlay/overlay-accessibility-lab'
import { OverlayTransitionLab } from '../components/interaction-lab/overlay/overlay-transition-lab'
import { OverlayThemeLab } from '../components/interaction-lab/overlay/overlay-theme-lab'
import { V2Preview } from '../components/v2-preview'

jest.mock('@ftsukic/tsuki', () => {
  const { Text } = jest.requireActual('react-native')
  return {
    ImagePreview: { Provider: ({ children }: { children: ReactNode }) => children },
    Text,
    TsukiProvider: ({ children }: { children: ReactNode }) => children,
    darkAlgorithm: {},
    defaultAlgorithm: {},
    useToken: () => ({
      token: {
        colorBgContainer: '#ffffff',
        colorBgLayout: '#f8fafc',
        colorBorder: '#d1d5db',
        colorPrimary: '#2563eb',
        colorText: '#111827',
        colorTextLightSolid: '#ffffff',
        colorTextSecondary: '#6b7280',
      },
    }),
  }
})
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }), { virtual: true })
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardProvider: ({ children }: { children: ReactNode }) => children,
}))
jest.mock('../components/v2-preview', () => {
  const React = jest.requireActual('react')
  const { TsukiProvider } = jest.requireActual('../../../packages/tsuki/src/theme/tsuki-provider')

  return {
    V2Preview: ({ children }: { children: ReactNode }) =>
      React.createElement(TsukiProvider, { scheme: 'light' }, children),
  }
})

afterEach(async () => {
  await cleanup()
  jest.clearAllMocks()
})

it('keeps one application Host and the same Registry while v2 pages change providers', async () => {
  const registries: OverlayRegistry[] = []

  function PageSwitch() {
    const [page, setPage] = useState<'preview' | 'interaction'>('preview')
    return (
      <>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPage((current) => (current === 'preview' ? 'interaction' : 'preview'))}
          testID="switch-v2-page"
        >
          <Text>Switch v2 page</Text>
        </Pressable>
        {page === 'preview' ? (
          <V2Preview>
            <PreviewPage onRegistry={(registry) => registries.push(registry)} />
          </V2Preview>
        ) : (
          <InteractionPage onRegistry={(registry) => registries.push(registry)} />
        )}
      </>
    )
  }

  function PreviewPage({ onRegistry }: { onRegistry: (registry: OverlayRegistry) => void }) {
    return (
      <>
        <RegistryCapture onRegistry={onRegistry} />
        <Text>V2 preview page</Text>
      </>
    )
  }

  function InteractionPage({ onRegistry }: { onRegistry: (registry: OverlayRegistry) => void }) {
    return (
      <InteractionLabProvider>
        <RegistryCapture onRegistry={onRegistry} />
        <Text>Interaction Lab page</Text>
      </InteractionLabProvider>
    )
  }

  await render(
    <DemoProvider>
      <PageSwitch />
    </DemoProvider>,
  )
  expect(screen.getAllByTestId('tsuki-overlay-host')).toHaveLength(1)
  expect(screen.getByText('V2 preview page')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('switch-v2-page'))
  expect(screen.getAllByTestId('tsuki-overlay-host')).toHaveLength(1)
  expect(screen.getByText('Interaction Lab page')).toBeTruthy()
  expect(registries.length).toBeGreaterThanOrEqual(2)
  expect(registries[0]).toBe(registries.at(-1))

  await fireEvent.press(screen.getByTestId('switch-v2-page'))
  expect(screen.getAllByTestId('tsuki-overlay-host')).toHaveLength(1)
  expect(screen.getByText('V2 preview page')).toBeTruthy()
  expect(registries[0]).toBe(registries.at(-1))
})

it('renders and controls live stack entries through the root Registry and Host', async () => {
  await render(
    <TsukiProvider scheme="light">
      <OverlayStackLab />
    </TsukiProvider>,
  )

  await fireEvent.press(screen.getByTestId('overlay-stack-add-three'))
  expect(screen.getAllByTestId(/^tsuki-overlay-layer-/)).toHaveLength(3)
  expect(screen.getAllByTestId(/^overlay-stack-layer-content-/)).toHaveLength(3)
  expect(screen.getByTestId('overlay-stack-entry-count').props.children).toContain(3)

  await fireEvent.press(screen.getByTestId('overlay-stack-update'))
  expect(screen.getByText('Current revision: 1')).toBeTruthy()
  await fireEvent.press(screen.getByTestId('overlay-stack-remove-middle'))
  expect(screen.getAllByTestId(/^tsuki-overlay-layer-/)).toHaveLength(2)

  await fireEvent.press(screen.getByTestId('overlay-stack-toggle-host'))
  expect(screen.queryByTestId('tsuki-overlay-host')).toBeNull()
  expect(screen.getByTestId('overlay-stack-entry-count').props.children).toContain(2)
  await fireEvent.press(screen.getByTestId('overlay-stack-toggle-host'))
  expect(screen.getAllByTestId(/^tsuki-overlay-layer-/)).toHaveLength(2)
})

it('previews Overlay transitions, Reduced Motion, and Back order through the real Host', async () => {
  await render(
    <DemoProvider>
      <InteractionLabProvider>
        <OverlayTransitionLab />
      </InteractionLabProvider>
    </DemoProvider>,
  )

  await fireEvent.press(screen.getByTestId('overlay-transition-reduced-motion'))
  await fireEvent.press(screen.getByTestId('overlay-transition-open'))
  expect(screen.getByTestId('overlay-transition-debug-registry-entry-count').props.children).toBe(
    '1',
  )
  expect(screen.getByText('Overlay 1')).toBeTruthy()
  expect(screen.getByTestId('overlay-transition-mask-layer')).toBeTruthy()
  expect(screen.getByTestId('overlay-transition-debug-presentation-phase').props.children).toBe(
    'entered',
  )

  await fireEvent.press(screen.getByTestId('overlay-transition-preset-slide-right'))
  expect(screen.getByText('Content preset: slide-right')).toBeTruthy()
  await fireEvent.press(screen.getByTestId('overlay-transition-preset-overlay-asymmetric-test'))
  expect(screen.getByText('Content preset: overlay-asymmetric-test')).toBeTruthy()
  await fireEvent.press(screen.getByTestId('overlay-transition-add-layer'))
  expect(screen.getByTestId('overlay-transition-debug-registry-entry-count').props.children).toBe(
    '2',
  )

  await fireEvent.press(screen.getByTestId('overlay-transition-back'))
  await waitFor(() =>
    expect(screen.getByTestId('overlay-transition-debug-registry-entry-count').props.children).toBe(
      '1',
    ),
  )
  await fireEvent.press(screen.getByTestId('overlay-transition-back'))
  await waitFor(() =>
    expect(screen.getByTestId('overlay-transition-debug-registry-entry-count').props.children).toBe(
      '0',
    ),
  )
})

it('completes a mask-free transition through the Content channel alone', async () => {
  await render(
    <DemoProvider>
      <InteractionLabProvider>
        <OverlayTransitionLab />
      </InteractionLabProvider>
    </DemoProvider>,
  )

  await fireEvent.press(screen.getByTestId('overlay-transition-reduced-motion'))
  await fireEvent.press(screen.getByTestId('overlay-transition-mask-none'))
  await fireEvent.press(screen.getByTestId('overlay-transition-open'))

  expect(screen.getByTestId('overlay-transition-debug-presentation-phase').props.children).toBe(
    'entered',
  )
  expect(screen.getByTestId('overlay-transition-debug-mask-progress').props.children).toBe(
    'not mounted',
  )
  expect(screen.queryByTestId('overlay-transition-mask-layer')).toBeNull()
  expect(screen.getByText('Overlay 1')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('overlay-transition-close'))
  await waitFor(() =>
    expect(screen.getByTestId('overlay-transition-debug-registry-entry-count').props.children).toBe(
      '0',
    ),
  )
})

it('bridges live Root and ConfigProvider theme updates into mounted Theme Lab entries', async () => {
  await render(
    <DemoProvider>
      <InteractionLabProvider>
        <OverlayThemeLab />
      </InteractionLabProvider>
    </DemoProvider>,
  )

  await fireEvent.press(screen.getByTestId('overlay-theme-open-root'))
  await fireEvent.press(screen.getByTestId('overlay-theme-dark'))
  expect(screen.getByText('scheme: dark')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('overlay-theme-config-open'))
  await fireEvent.press(screen.getByTestId('overlay-theme-config-rose'))
  expect(screen.getByText('primary: #e11d48')).toBeTruthy()
})

it('runs the Declarative Lab through OverlayPortal and the Root Registry', async () => {
  await render(
    <DemoProvider>
      <InteractionLabProvider>
        <OverlayDeclarativeLab />
      </InteractionLabProvider>
    </DemoProvider>,
  )

  expect(screen.getByTestId('overlay-declarative-debug-registry-entry-count').props.children).toBe(
    '0',
  )
  await fireEvent.press(screen.getByTestId('overlay-declarative-toggle'))
  expect(screen.getByTestId('overlay-declarative-debug-registry-entry-count').props.children).toBe(
    '1',
  )
  expect(screen.getByText('Content revision: 0')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('overlay-declarative-card-content-update'))
  expect(screen.getByText('Content revision: 1')).toBeTruthy()
  await fireEvent.press(screen.getByTestId('overlay-declarative-card-context-update'))
  expect(screen.getAllByText('Dialog context: B').length).toBeGreaterThan(0)
  await fireEvent.press(screen.getByTestId('overlay-declarative-card-theme-update'))
  expect(screen.getAllByText('light / #e11d48').length).toBeGreaterThan(0)
  await fireEvent.press(screen.getByTestId('overlay-declarative-card-mask-update'))
  expect(screen.queryByTestId('overlay-declarative-mask')).toBeNull()

  await fireEvent.press(screen.getByTestId('overlay-declarative-card-multiple'))
  expect(screen.getByTestId('overlay-declarative-debug-registry-entry-count').props.children).toBe(
    '2',
  )
  await fireEvent.press(screen.getByTestId('overlay-declarative-card-provider-unmount'))
  expect(screen.getByTestId('overlay-declarative-debug-registry-entry-count').props.children).toBe(
    '3',
  )
  await fireEvent.press(screen.getByTestId('overlay-declarative-card-provider-unmount'))
  expect(screen.getByTestId('overlay-declarative-debug-registry-entry-count').props.children).toBe(
    '2',
  )
  await fireEvent.press(screen.getByTestId('overlay-declarative-card-strict-mode'))
  expect(screen.getByTestId('overlay-declarative-debug-registry-entry-count').props.children).toBe(
    '3',
  )
  expect(screen.getByTestId('overlay-declarative-debug-host-count').props.children).toBe('1')
})

it('runs the Imperative Lab through root-bound controllers and the shared Registry/Host', async () => {
  await render(
    <DemoProvider>
      <InteractionLabProvider>
        <OverlayImperativeLab />
      </InteractionLabProvider>
    </DemoProvider>,
  )

  const entryCount = () =>
    screen.getByTestId('overlay-imperative-debug-registry-entry-count').props.children
  expect(entryCount()).toBe('0')

  await fireEvent.press(screen.getByTestId('overlay-imperative-nested-theme'))
  await fireEvent.press(screen.getByTestId('overlay-imperative-open'))
  expect(entryCount()).toBe('1')
  expect(screen.getByText('Imperative Entry 1')).toBeTruthy()
  expect(screen.getByText('Theme: light / #e11d48')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('overlay-imperative-card-update-1'))
  expect(screen.getByText('Content revision: 1')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('overlay-imperative-open-root'))
  await fireEvent.press(screen.getByTestId('overlay-imperative-open-second'))
  expect(entryCount()).toBe('3')
  expect(screen.getAllByTestId(/^tsuki-overlay-layer-/)).toHaveLength(3)

  await fireEvent.press(screen.getByTestId('overlay-imperative-root-theme'))
  expect(screen.getAllByText('Theme: dark / #4D8DFF').length).toBeGreaterThan(0)

  await fireEvent.press(screen.getByTestId('overlay-imperative-declarative-toggle'))
  expect(entryCount()).toBe('4')
  expect(screen.getByText('Declarative Portal')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('overlay-imperative-close'))
  expect(screen.getByTestId('overlay-imperative-status').props.children).toBe('Close returned true')
  await fireEvent.press(screen.getByTestId('overlay-imperative-close-again'))
  expect(screen.getByTestId('overlay-imperative-status').props.children).toBe(
    'Close returned false',
  )
  await fireEvent.press(screen.getByTestId('overlay-imperative-update-closing'))
  expect(screen.getByTestId('overlay-imperative-status').props.children).toBe(
    'Update while closing returned true',
  )

  await fireEvent.press(screen.getByTestId('overlay-imperative-mask'))
  expect(screen.getAllByTestId('overlay-imperative-mask-layer')).toHaveLength(1)
  await fireEvent.press(screen.getByTestId('overlay-imperative-animation'))
  await fireEvent.press(screen.getByTestId('overlay-imperative-duration'))

  await fireEvent.press(screen.getByTestId('overlay-imperative-owner-toggle'))
  expect(
    screen.getByTestId('overlay-imperative-debug-phase-/-generation-/-theme').props.children,
  ).toContain('exiting')
})

it('keeps another same-Root controller owner Entry when the Imperative owner unmounts', async () => {
  await render(
    <DemoProvider>
      <InteractionLabProvider>
        <OverlayImperativeLab />
      </InteractionLabProvider>
    </DemoProvider>,
  )

  const entryCount = () =>
    screen.getByTestId('overlay-imperative-debug-registry-entry-count').props.children
  await fireEvent.press(screen.getByTestId('overlay-imperative-open-other-owner'))
  await fireEvent.press(screen.getByTestId('overlay-imperative-open'))
  expect(entryCount()).toBe('2')

  await fireEvent.press(screen.getByTestId('overlay-imperative-owner-toggle'))
  await waitFor(() => expect(entryCount()).toBe('1'))

  const phases = screen.getByTestId('overlay-imperative-debug-phase-/-generation-/-theme').props
    .children as string
  expect(phases).toMatch(/^1:/)
  expect(screen.getByTestId('overlay-imperative-entry-1')).toBeTruthy()
  expect(screen.getByText('Imperative Entry 1')).toBeTruthy()
})

it('isolates page accessibility only for modal Portal and Controller entries', async () => {
  const registryStore: { current: OverlayRegistry | null } = { current: null }
  const view = await render(
    <DemoProvider>
      <InteractionLabProvider>
        <>
          <OverlayAccessibilityLab />
          <RegistryCapture onRegistry={(registry) => (registryStore.current = registry)} />
        </>
      </InteractionLabProvider>
    </DemoProvider>,
  )

  const nodeProps = (testID: string) => findRenderedProps(view.toJSON(), testID)
  const entries = () => registryStore.current?.getSnapshot() ?? []
  const entryCount = () => String(entries().length)
  const currentModalId = () =>
    [...entries()]
      .reverse()
      .find((entry) => entry.accessibility.mode === 'modal' && entry.phase !== 'hidden')?.id

  expect(nodeProps('tsuki-overlay-page-accessibility-boundary')?.importantForAccessibility).toBe(
    'auto',
  )
  await fireEvent.press(screen.getByTestId('overlay-accessibility-reduced-motion'))
  await fireEvent.press(screen.getByTestId('overlay-accessibility-open-declarative'))
  await waitFor(() => expect(entryCount()).toBe('1'))
  expect(nodeProps('tsuki-overlay-page-accessibility-boundary')?.importantForAccessibility).toBe(
    'no-hide-descendants',
  )
  expect(screen.getByTestId('overlay-accessibility-initial-1')).toBeTruthy()

  await fireEvent.press(screen.getByTestId('overlay-accessibility-nested-1'))
  await waitFor(() => expect(entryCount()).toBe('2'))
  expect(currentModalId()).toBe(2)
  expect(nodeProps('tsuki-overlay-layer-1')?.importantForAccessibility).toBe('no-hide-descendants')

  await fireEvent.press(screen.getByTestId('overlay-accessibility-close-2'))
  await waitFor(() => expect(entryCount()).toBe('1'))
  expect(currentModalId()).toBe(1)
  await fireEvent.press(screen.getByTestId('overlay-accessibility-close-1'))
  await waitFor(() => expect(entryCount()).toBe('0'))
  expect(nodeProps('tsuki-overlay-page-accessibility-boundary')?.importantForAccessibility).toBe(
    'auto',
  )

  await fireEvent.press(screen.getByTestId('overlay-accessibility-mode'))
  await fireEvent.press(screen.getByTestId('overlay-accessibility-open-imperative'))
  await waitFor(() => expect(entryCount()).toBe('1'))
  expect(nodeProps('tsuki-overlay-page-accessibility-boundary')?.importantForAccessibility).toBe(
    'auto',
  )
  expect(entries()[0].accessibility.mode).toBe('non-modal')
})

function findRenderedProps(value: unknown, testID: string): Record<string, unknown> | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const view = findRenderedProps(child, testID)
      if (view) return view
    }
    return undefined
  }
  if (!value || typeof value !== 'object') return undefined
  const node = value as { props?: Record<string, unknown>; children?: unknown }
  if (node.props?.testID === testID) return node.props
  return findRenderedProps(node.children, testID)
}

function RegistryCapture({ onRegistry }: { onRegistry: (registry: OverlayRegistry) => void }) {
  const { registry } = useOverlayRuntime()
  useEffect(() => {
    onRegistry(registry)
  }, [onRegistry, registry])
  return null
}
