import { act, cleanup, render, screen } from '@testing-library/react-native'
import { Text, View } from 'react-native'
import ComponentScreen from '../../example/app/components/[id]'
import { mountPortal, TsukiProvider } from '..'
import type { TestInstance } from 'test-renderer'

let mockFocused = true
let mockComponentId = 'floating-bubble'

jest.mock(
  'expo-router',
  () => ({
    useIsFocused: () => mockFocused,
    useLocalSearchParams: () => ({ id: mockComponentId }),
    Link: jest.requireActual('react-native').Text,
  }),
  { virtual: true },
)
jest.mock('expo-router/stack', () => ({ Stack: { Screen: () => null } }), { virtual: true })
jest.mock(
  'react-native-keyboard-controller',
  () => ({
    KeyboardToolbar: Object.assign(() => null, { Done: () => null }),
  }),
  { virtual: true },
)
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context')
  const { View } = jest.requireActual('react-native')
  return { ...actual, SafeAreaProvider: View, SafeAreaView: View }
})
jest.mock('../../example/fixtures/catalog', () => {
  const React = jest.requireActual('react')
  const { Text } = jest.requireActual('react-native')
  const { FloatingBubble, FloatingPanel } = jest.requireActual('../index')
  return {
    componentCatalog: [
      {
        id: 'floating-bubble',
        title: 'FloatingBubble',
        Component: () => React.createElement(FloatingBubble, { testID: 'page-preview' }),
      },
      {
        id: 'floating-panel',
        title: 'FloatingPanel',
        Component: () =>
          React.createElement(
            FloatingPanel,
            { testID: 'page-preview' },
            React.createElement(Text, null, 'panel'),
          ),
      },
      {
        id: 'button',
        title: 'Button',
        Component: () => React.createElement(Text, { testID: 'ordinary-preview' }, 'button'),
      },
    ],
  }
})

function isInsidePage(node: TestInstance) {
  let parent = node.parent
  while (parent) {
    if (parent.props.testID === 'route-boundary') return true
    parent = parent.parent
  }
  return false
}

function App({ showPage = true }: { showPage?: boolean }) {
  return (
    <TsukiProvider theme={{ seed: { motion: false } }}>
      <View testID="route-boundary" style={{ flex: 1 }}>
        {showPage ? <ComponentScreen /> : null}
      </View>
    </TsukiProvider>
  )
}

describe('page-owned floating previews', () => {
  afterEach(async () => {
    await cleanup()
    mockFocused = true
    mockComponentId = 'floating-bubble'
  })

  it.each(['floating-bubble', 'floating-panel'])(
    'keeps %s inside its page and releases its host on blur',
    async (id) => {
      mockComponentId = id
      const view = await render(<App showPage={false} />)
      await view.rerender(<App />)
      expect(
        isInsidePage(screen.getByTestId('page-preview', { includeHiddenElements: true })),
      ).toBe(true)
      await act(async () => {
        mountPortal(<Text testID="local-imperative">local</Text>)
      })
      expect(isInsidePage(screen.getByTestId('local-imperative'))).toBe(true)

      mockFocused = false
      await view.rerender(<App />)
      expect(screen.queryByTestId('page-preview', { includeHiddenElements: true })).toBeNull()
      expect(screen.queryByTestId('local-imperative')).toBeNull()
      await act(async () => {
        mountPortal(<Text testID="global-imperative">global</Text>)
      })
      expect(isInsidePage(screen.getByTestId('global-imperative'))).toBe(false)

      mockFocused = true
      await view.rerender(<App />)
      expect(
        isInsidePage(screen.getByTestId('page-preview', { includeHiddenElements: true })),
      ).toBe(true)
      expect(screen.getByTestId('global-imperative')).toBeTruthy()
    },
  )

  it('keeps ordinary previews mounted when the page loses focus', async () => {
    mockComponentId = 'button'
    const view = await render(<App />)
    mockFocused = false
    await view.rerender(<App />)
    expect(screen.getByTestId('ordinary-preview')).toBeTruthy()
    await act(async () => {
      mountPortal(<Text testID="ordinary-global">global</Text>)
    })
    expect(isInsidePage(screen.getByTestId('ordinary-global'))).toBe(false)
  })
})
