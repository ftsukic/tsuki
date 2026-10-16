import { teleportPortalBackend } from '../teleport'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  createRef,
  useEffect,
  useState,
} from 'react'
import { TextInput } from 'react-native'
import { Portal, PortalHost, TsukiProvider, mountPortal, updatePortal, unmountPortal } from '..'

// Model RN TextInput's native-text bookkeeping and value reconciliation.
function NativeValueProbe({
  value,
  onChangeText,
  writes,
}: {
  value: string
  onChangeText: (text: string) => void
  writes: string[]
}) {
  const [nativeText, setNativeText] = useState(value)
  useLayoutEffect(() => {
    if (nativeText !== value) writes.push(value)
  }, [nativeText, value, writes])
  return (
    <TextInput
      testID="probe"
      value={value}
      onChangeText={(text) => {
        onChangeText(text)
        setNativeText(text)
      }}
    />
  )
}

it.each([false, true])('records controlled reconciliation with portal=%s', async (portal) => {
  const writes: string[] = []
  function App() {
    const [value, setValue] = useState('')
    const input = <NativeValueProbe value={value} onChangeText={setValue} writes={writes} />
    return <PortalHost>{portal ? <Portal>{input}</Portal> : input}</PortalHost>
  }
  await render(<App />)
  // eslint-disable-next-line testing-library/no-await-sync-events
  await fireEvent.changeText(screen.getByTestId('probe'), 'zh')
  expect(writes).toEqual(portal ? [''] : [])
  expect(screen.getByTestId('probe').props.value).toBe('zh')
})

// Keep the controller in the mounted portal subtree; external commands target that controller.
it('keeps controlled edits atomic inside Portal and supports external assignment and rejection', async () => {
  const writes: string[] = []
  interface FormRef {
    setValue: (value: string) => void
  }
  const Form = forwardRef<FormRef>(function Form(_props, ref) {
    const [value, setValue] = useState('')
    useImperativeHandle(ref, () => ({ setValue }), [])
    return (
      <NativeValueProbe
        value={value}
        onChangeText={(text) => {
          if (text !== 'rejected') setValue(text)
        }}
        writes={writes}
      />
    )
  })
  const controller = createRef<FormRef>()
  function App() {
    return (
      <PortalHost>
        <Portal>
          <Form ref={controller} />
        </Portal>
      </PortalHost>
    )
  }
  await render(<App />)
  for (const text of ['z', 'zh', 'zhong', '中国']) {
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(screen.getByTestId('probe'), text)
    expect(writes).toEqual([])
    expect(screen.getByTestId('probe').props.value).toBe(text)
  }
  // eslint-disable-next-line testing-library/no-await-sync-events
  await fireEvent.changeText(screen.getByTestId('probe'), 'rejected')
  expect(screen.getByTestId('probe').props.value).toBe('中国')
  expect(writes).toEqual(['中国'])
  await act(() => {
    controller.current?.setValue('外部赋值')
  })
  expect(screen.getByTestId('probe').props.value).toBe('外部赋值')
  await act(() => {
    controller.current?.setValue('')
  })
  expect(screen.getByTestId('probe').props.value).toBe('')
})

jest.mock('react-native-teleport', () => {
  const React = jest.requireActual('react')
  const { View } = jest.requireActual('react-native')
  return {
    PortalProvider: ({ children }: { children?: React.ReactNode }) => children,
    PortalHost: ({ name }: { name: string }) =>
      React.createElement(View, { testID: `native-host-${name}` }),
    Portal: ({ children, hostName }: { children?: React.ReactNode; hostName: string }) =>
      React.createElement(View, { testID: 'native-portal', hostName }, children),
  }
})

it('keeps parent-controlled values in the same React commit with the native backend', async () => {
  const writes: string[] = []
  let mounts = 0
  let assign: ((value: string) => void) | undefined
  function Probe(props: Parameters<typeof NativeValueProbe>[0]) {
    useEffect(() => {
      mounts += 1
    }, [])
    return <NativeValueProbe {...props} />
  }
  function App() {
    const [value, setValue] = useState('')
    assign = setValue
    return (
      <TsukiProvider gesture={false} portalBackend={teleportPortalBackend}>
        <Portal>
          <Probe
            value={value}
            writes={writes}
            onChangeText={(text) => {
              if (text !== 'rejected') setValue(text)
            }}
          />
        </Portal>
      </TsukiProvider>
    )
  }
  await render(<App />)
  expect(screen.getByTestId('native-portal')).toBeTruthy()
  for (const text of ['z', 'zh', 'zhong', '中国']) {
    // eslint-disable-next-line testing-library/no-await-sync-events
    await fireEvent.changeText(screen.getByTestId('probe'), text)
    expect(writes).toEqual([])
    expect(screen.getByTestId('probe').props.value).toBe(text)
  }
  // eslint-disable-next-line testing-library/no-await-sync-events
  await fireEvent.changeText(screen.getByTestId('probe'), 'rejected')
  expect(screen.getByTestId('probe').props.value).toBe('中国')
  await act(() => assign?.('外部赋值'))
  expect(screen.getByTestId('probe').props.value).toBe('外部赋值')
  await act(() => assign?.(''))
  expect(screen.getByTestId('probe').props.value).toBe('')
  expect(mounts).toBe(1)
})

it('fixes the backend at TsukiProvider mount and selects the closest native host', async () => {
  const tree = (enabled: boolean) => (
    <TsukiProvider gesture={false} portalBackend={enabled ? teleportPortalBackend : undefined}>
      <PortalHost>
        <Portal>
          <TextInput testID="nested-input" />
        </Portal>
      </PortalHost>
    </TsukiProvider>
  )
  const view = await render(tree(true))
  const hostName = screen.getByTestId('native-portal').props.hostName
  expect(screen.getByTestId(`native-host-${hostName}`)).toBeTruthy()
  await view.rerender(tree(false))
  expect(screen.getByTestId('native-portal').props.hostName).toBe(hostName)
})

it('routes imperative entries through the selected native host and retains their ownership', async () => {
  await render(<TsukiProvider gesture={false} portalBackend={teleportPortalBackend} />)
  let key = 0
  await act(() => {
    key = mountPortal(<TextInput testID="imperative-native" value="first" />)
  })
  const hostName = screen.getByTestId('native-portal').props.hostName
  expect(screen.getByTestId(`native-host-${hostName}`)).toBeTruthy()
  await act(() => updatePortal(key, <TextInput testID="imperative-native" value="updated" />))
  expect(screen.getByTestId('imperative-native').props.value).toBe('updated')
  expect(screen.getByTestId('native-portal').props.hostName).toBe(hostName)
  await act(() => unmountPortal(key))
  expect(screen.queryByTestId('imperative-native')).toBeNull()
})

it('configures a standalone Host and inherits its backend in nested hosts', async () => {
  const view = await render(
    <PortalHost portalBackend={teleportPortalBackend}>
      <PortalHost>
        <Portal>
          <TextInput testID="standalone-input" />
        </Portal>
      </PortalHost>
    </PortalHost>,
  )
  const destination = screen.getByTestId('native-portal').props.hostName
  expect(screen.getByTestId(`native-host-${destination}`)).toBeTruthy()
  await act(() => {
    mountPortal(<TextInput testID="standalone-imperative" />)
  })
  expect(screen.getByTestId('standalone-imperative')).toBeTruthy()
  await view.unmount()
})

it('allows a local Host to explicitly select the JS backend', async () => {
  await render(
    <TsukiProvider gesture={false} portalBackend={teleportPortalBackend}>
      <PortalHost teleport={false}>
        <Portal>
          <TextInput testID="local-js-input" />
        </Portal>
      </PortalHost>
    </TsukiProvider>,
  )
  expect(screen.getByTestId('local-js-input')).toBeTruthy()
  expect(screen.queryByTestId('native-portal')).toBeNull()
})

it('prioritizes a standalone custom backend and fixes its selection at mount', async () => {
  const tree = (enabled: boolean) => (
    <PortalHost portalBackend={enabled ? teleportPortalBackend : undefined} teleport={false}>
      <Portal>
        <TextInput testID="custom-host-input" />
      </Portal>
    </PortalHost>
  )
  const view = await render(tree(true))
  const destination = screen.getByTestId('native-portal').props.hostName
  await view.rerender(tree(false))
  expect(screen.getByTestId('native-portal').props.hostName).toBe(destination)
  expect(screen.getByTestId('custom-host-input')).toBeTruthy()
})

it('keeps the native entry layer when its root child is replaced', async () => {
  const tree = (version: number) => (
    <PortalHost portalBackend={teleportPortalBackend}>
      <Portal>
        <TextInput key={version} testID="changing-root" />
      </Portal>
      <Portal>
        <TextInput testID="later-entry" />
      </Portal>
    </PortalHost>
  )
  const view = await render(tree(0))
  const layer = screen.getByTestId('changing-root').parent
  expect(layer?.props.collapsable).toBe(false)
  expect(layer?.props.pointerEvents).toBe('box-none')
  await view.rerender(tree(1))
  expect(screen.getByTestId('changing-root').parent).toBe(layer)
  expect(screen.getByTestId('later-entry')).toBeTruthy()
})

it('reports the explicit backend migration for an unsupported legacy opt-in', async () => {
  await expect(render(<PortalHost teleport />)).rejects.toThrow(
    'Import teleportPortalBackend from @ftsukic/tsuki/teleport',
  )
})
