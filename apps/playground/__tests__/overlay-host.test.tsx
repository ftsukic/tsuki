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

function RegistryCapture({ onRegistry }: { onRegistry: (registry: OverlayRegistry) => void }) {
  const { registry } = useOverlayRuntime()
  useEffect(() => {
    onRegistry(registry)
  }, [onRegistry, registry])
  return null
}
