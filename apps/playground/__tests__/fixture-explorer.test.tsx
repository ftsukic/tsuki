/* RNTL v14 fireEvent returns a Promise; this lint rule still assumes synchronous events. */
/* eslint-disable testing-library/no-await-sync-events */
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'
import FixtureExplorer from '../components/fixture-explorer'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }), { virtual: true })
jest.mock('../components/demo-provider', () => ({
  useDemoTheme: () => ({ mode: 'system', setMode: jest.fn() }),
}))

jest.mock('../fixtures/catalog', () => {
  const React = jest.requireActual('react')
  const { Text } = jest.requireActual('react-native')
  const FirstOverview = () => React.createElement(Text, null, 'Button overview')
  const SecondOverview = () => React.createElement(Text, null, 'Cell overview')

  return {
    componentCatalog: [
      {
        Component: FirstOverview,
        component: 'button',
        description: 'Button overview description',
        version: 'v1',
        category: '基础组件',
        id: 'button',
        title: 'Button',
      },
      {
        Component: SecondOverview,
        component: 'cell',
        description: 'Cell overview description',
        version: 'v2',
        category: 'Tsuki v2',
        id: 'cell-v2',
        title: 'Cell',
      },
    ],
  }
})

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native')

  return { SafeAreaProvider: View, SafeAreaView: View }
})

describe('FixtureExplorer component navigation', () => {
  afterEach(async () => {
    await cleanup()
    mockPush.mockClear()
  })

  it('opens component routes from the catalog', async () => {
    await render(<FixtureExplorer />)
    expect(screen.getByText('组件游乐场')).toBeTruthy()
    expect(screen.getByText('Button')).toBeTruthy()
    expect(screen.getByText('Cell')).toBeTruthy()
    await fireEvent.press(screen.getByText('Cell'))
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/components/[id]',
      params: { id: 'cell-v2' },
    })
  })

  it('filters by version and preserves the category heading', async () => {
    await render(<FixtureExplorer />)
    await fireEvent.changeText(screen.getByLabelText('搜索组件'), 'Legacy v1')
    expect(screen.getByText('基础组件')).toBeTruthy()
    expect(screen.getByText('Button')).toBeTruthy()
    expect(screen.queryByText('Cell')).toBeNull()
  })

  it('filters the component catalog by search text', async () => {
    await render(<FixtureExplorer />)
    await fireEvent.changeText(screen.getByLabelText('搜索组件'), 'Cell')
    expect(screen.getByText('Cell')).toBeTruthy()
    expect(screen.queryByText('Button')).toBeNull()
    await fireEvent.changeText(screen.getByLabelText('搜索组件'), 'missing')
    expect(screen.getByText('没有找到组件')).toBeTruthy()
  })
})
