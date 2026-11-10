import { act, fireEvent, render, screen } from '@testing-library/react-native'
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  createRef,
  useEffect,
  useState,
} from 'react'
import { StyleSheet, Text as NativeText, TextInput, View } from 'react-native'
import type { PortalBackend } from '../portal/types'
import {
  Button,
  Portal,
  PortalHost,
  Text,
  TsukiProvider,
  mountPortal,
  updatePortal,
  unmountPortal,
} from '..'

const customPortalBackend: PortalBackend = {
  Provider: ({ children }) => <>{children}</>,
  Host: ({ name, style }) => <View testID={`custom-host-${name}`} nativeID={name} style={style} />,
  Portal: ({ children, hostName, style }) => (
    <View testID="custom-portal" nativeID={hostName} style={style}>
      {children}
    </View>
  ),
}

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

it('keeps parent-controlled values in the same React commit with a custom backend', async () => {
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
      <TsukiProvider gesture={false} portalBackend={customPortalBackend}>
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
  expect(screen.getByTestId('custom-portal')).toBeTruthy()
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

it('fixes the backend at TsukiProvider mount and selects the closest custom host', async () => {
  const tree = (enabled: boolean) => (
    <TsukiProvider gesture={false} portalBackend={enabled ? customPortalBackend : undefined}>
      <PortalHost>
        <Portal>
          <TextInput testID="nested-input" />
        </Portal>
      </PortalHost>
    </TsukiProvider>
  )
  const view = await render(tree(true))
  const hostName = screen.getByTestId('custom-portal').props.nativeID
  expect(screen.getByTestId(`custom-host-${hostName}`)).toBeTruthy()
  await view.rerender(tree(false))
  expect(screen.getByTestId('custom-portal').props.nativeID).toBe(hostName)
})

it('routes imperative entries through the selected custom host and retains their ownership', async () => {
  await render(<TsukiProvider gesture={false} portalBackend={customPortalBackend} />)
  let key = 0
  await act(() => {
    key = mountPortal(<TextInput testID="imperative-native" value="first" />)
  })
  const hostName = screen.getByTestId('custom-portal').props.nativeID
  expect(screen.getByTestId(`custom-host-${hostName}`)).toBeTruthy()
  await act(() => updatePortal(key, <TextInput testID="imperative-native" value="updated" />))
  expect(screen.getByTestId('imperative-native').props.value).toBe('updated')
  expect(screen.getByTestId('custom-portal').props.nativeID).toBe(hostName)
  await act(() => unmountPortal(key))
  expect(screen.queryByTestId('imperative-native')).toBeNull()
})

it('configures a standalone Host and inherits its backend in nested hosts', async () => {
  const view = await render(
    <PortalHost portalBackend={customPortalBackend}>
      <PortalHost>
        <Portal>
          <TextInput testID="standalone-input" />
        </Portal>
      </PortalHost>
    </PortalHost>,
  )
  const destination = screen.getByTestId('custom-portal').props.nativeID
  expect(screen.getByTestId(`custom-host-${destination}`)).toBeTruthy()
  await act(() => {
    mountPortal(<TextInput testID="standalone-imperative" />)
  })
  expect(screen.getByTestId('standalone-imperative')).toBeTruthy()
  await view.unmount()
})

it('uses the generic JS fallback when a Provider has no explicit backend', async () => {
  await render(
    <TsukiProvider gesture={false}>
      <Portal>
        <TextInput testID="default-js-input" />
      </Portal>
    </TsukiProvider>,
  )
  expect(screen.getByTestId('default-js-input')).toBeTruthy()
  expect(screen.queryByTestId('custom-portal')).toBeNull()
})

it('prioritizes a standalone custom backend and fixes its selection at mount', async () => {
  const tree = (enabled: boolean) => (
    <PortalHost portalBackend={enabled ? customPortalBackend : undefined}>
      <Portal>
        <TextInput testID="custom-host-input" />
      </Portal>
    </PortalHost>
  )
  const view = await render(tree(true))
  const destination = screen.getByTestId('custom-portal').props.nativeID
  await view.rerender(tree(false))
  expect(screen.getByTestId('custom-portal').props.nativeID).toBe(destination)
  expect(screen.getByTestId('custom-host-input')).toBeTruthy()
})

it('keeps the custom entry layer when its root child is replaced', async () => {
  const tree = (version: number) => (
    <PortalHost portalBackend={customPortalBackend}>
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

function PortalTextLeaf({ testID }: { testID: string }) {
  return <Text testID={testID}>订单已保存</Text>
}

function PortalTextBranch({ testID }: { testID: string }) {
  return (
    <View>
      <PortalTextLeaf testID={testID} />
    </View>
  )
}

it.each([false, true])(
  'bridges and updates Text inheritance with custom backend=%s',
  async (customBackend) => {
    const tree = (primary: boolean) => (
      <TsukiProvider
        gesture={false}
        portalBackend={customBackend ? customPortalBackend : undefined}
      >
        <PortalHost>
          <Button type={primary ? 'primary' : 'default'}>
            <Portal>
              <PortalTextBranch testID="portal-inherited-text" />
            </Portal>
          </Button>
        </PortalHost>
      </TsukiProvider>
    )

    const view = await render(tree(false))
    const text = screen.getByTestId('portal-inherited-text')
    const initialColor = StyleSheet.flatten(text.props.style).color
    expect(screen.queryByTestId('custom-portal') !== null).toBe(customBackend)

    await view.rerender(tree(true))

    expect(
      StyleSheet.flatten(screen.getByTestId('portal-inherited-text').props.style).color,
    ).not.toBe(initialColor)
  },
)

it('does not apply Tsuki text inheritance to native Text inside Portal content', async () => {
  await render(
    <TsukiProvider gesture={false}>
      <PortalHost>
        <Button type="primary">
          <Portal>
            <NativeText testID="native-portal-text">原生文本</NativeText>
          </Portal>
        </Button>
      </PortalHost>
    </TsukiProvider>,
  )

  expect(screen.getByTestId('native-portal-text').props.style).toBeUndefined()
})
