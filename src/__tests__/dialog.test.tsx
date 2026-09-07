import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import {
  closeDialog,
  ConfigProvider,
  Dialog,
  PortalHost,
  resetDialogDefaultOptions,
  setDialogDefaultOptions,
  showConfirmDialog,
  showDialog,
} from '..'
import type { ReactNode } from 'react'
import type { TestInstance } from 'test-renderer'

function AppProvider({ children }: { children?: ReactNode }) {
  return (
    <ConfigProvider theme={{ token: { motion: false } }}>
      <PortalHost>{children}</PortalHost>
    </ConfigProvider>
  )
}

function findOverlay(view: {
  container: { queryAll: (predicate: (node: TestInstance) => boolean) => TestInstance[] }
}) {
  return view.container.queryAll((node) => node.props.accessibilityElementsHidden === true)[0]
}

describe('Dialog', () => {
  afterEach(() => {
    resetDialogDefaultOptions()
  })

  it('renders a controlled alert with the default confirm button and overlay', async () => {
    const onShowChange = jest.fn()
    const view = await render(
      <AppProvider>
        <Dialog show testID="dialog" title="提示" message="操作完成" onShowChange={onShowChange} />
      </AppProvider>,
    )

    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('提示')).toBeTruthy()
    expect(screen.getByText('操作完成')).toBeTruthy()
    expect(screen.getByTestId('dialog-confirm-button')).toBeTruthy()
    expect(screen.queryByTestId('dialog-cancel-button')).toBeNull()
    expect(StyleSheet.flatten(screen.getByTestId('dialog').props.style)).toMatchObject({
      backgroundColor: '#ffffff',
      width: 320,
    })
    expect(findOverlay(view)).toBeTruthy()
    await view.unmount()
  })

  it('handles confirm and cancel actions in controlled mode', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()

    function ControlledDialog() {
      const [show, setShow] = useState(true)
      return (
        <Dialog
          show={show}
          title="确认操作"
          message="是否继续？"
          showCancelButton
          onConfirm={onConfirm}
          onCancel={onCancel}
          onShowChange={setShow}
        />
      )
    }

    const view = await render(
      <AppProvider>
        <ControlledDialog />
      </AppProvider>,
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-cancel-button')))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('是否继续？')).toBeNull()

    await view.unmount()

    function ConfirmDialog() {
      const [show, setShow] = useState(true)
      return (
        <Dialog
          show={show}
          message="是否继续？"
          showCancelButton
          onConfirm={onConfirm}
          onCancel={onCancel}
          onShowChange={setShow}
        />
      )
    }

    const utils = await render(
      <AppProvider>
        <ConfirmDialog />
      </AppProvider>,
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('是否继续？')).toBeNull()
    await utils.unmount()
  })

  it('resolves and rejects the imperative dialog promises', async () => {
    const view = await render(<AppProvider />)

    let alertPromise!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      alertPromise = showDialog({ title: '提示', message: '函数调用' })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    await expect(alertPromise).resolves.toBe('confirm')

    let confirmPromise!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      confirmPromise = showConfirmDialog({ message: '需要确认' })
    })
    const cancelExpectation = expect(confirmPromise).rejects.toBe('cancel')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-cancel-button')))
    await cancelExpectation

    let explicitPromise!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      explicitPromise = showConfirmDialog({ message: '显式隐藏取消', showCancelButton: false })
    })
    expect(screen.queryByTestId('dialog-cancel-button')).toBeNull()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    await expect(explicitPromise).resolves.toBe('confirm')
    await view.unmount()
  })

  it('keeps component token defaults available to imperative dialogs', async () => {
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: { Dialog: { width: 280 } },
        }}
      >
        <PortalHost />
      </ConfigProvider>,
    )

    let pending!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      pending = showDialog({ message: '使用主题宽度' })
    })
    expect(StyleSheet.flatten(screen.getByRole('alert').props.style)).toMatchObject({ width: 280 })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    await expect(pending).resolves.toBe('confirm')
    await view.unmount()
  })

  it('supports defaults and closes the current imperative dialog without settling it', async () => {
    setDialogDefaultOptions({
      message: '默认消息',
      showCancelButton: true,
    })
    const view = await render(<AppProvider />)

    let pending!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      pending = showDialog()
    })
    expect(screen.getByText('默认消息')).toBeTruthy()
    expect(screen.getByTestId('dialog-cancel-button')).toBeTruthy()

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => closeDialog())
    expect(screen.queryByText('默认消息')).toBeNull()
    void pending
    await view.unmount()
  })

  it('supports synchronous and asynchronous beforeClose interception', async () => {
    const blocked = jest.fn(() => false)
    const utils = await render(
      <AppProvider>
        <Dialog show message="同步拦截" beforeClose={blocked} />
      </AppProvider>,
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    expect(blocked).toHaveBeenCalledWith('confirm')
    expect(screen.getByText('同步拦截')).toBeTruthy()
    await utils.unmount()

    let resolveClose!: (allowed: boolean) => void
    const beforeClose = jest.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveClose = resolve
        }),
    )
    function AsyncDialog() {
      const [show, setShow] = useState(true)
      return (
        <Dialog show={show} message="异步拦截" beforeClose={beforeClose} onShowChange={setShow} />
      )
    }

    const view = await render(
      <AppProvider>
        <AsyncDialog />
      </AppProvider>,
    )

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    expect(screen.getByTestId('dialog-confirm-button').props.accessibilityState?.disabled).toBe(
      true,
    )
    resolveClose(true)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})
    expect(screen.queryByText('异步拦截')).toBeNull()
    await view.unmount()
  })

  it('keeps the dialog open when beforeClose rejects', async () => {
    const beforeClose = jest.fn(() => Promise.reject(new Error('拒绝关闭')))
    const view = await render(
      <AppProvider>
        <Dialog show message="异常保持打开" beforeClose={beforeClose} />
      </AppProvider>,
    )

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})
    expect(screen.getByText('异常保持打开')).toBeTruthy()
    expect(screen.getByTestId('dialog-confirm-button').props.accessibilityState?.disabled).toBe(
      false,
    )
    await view.unmount()
  })

  it('does not close from the overlay by default and supports opt-in overlay close', async () => {
    const utils = await render(
      <AppProvider>
        <Dialog show message="默认不关闭" />
      </AppProvider>,
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(findOverlay(utils)))
    expect(screen.getByText('默认不关闭')).toBeTruthy()
    await utils.unmount()

    function OverlayDialog() {
      const [show, setShow] = useState(true)
      return <Dialog show={show} closeOnClickOverlay onShowChange={setShow} message="遮罩关闭" />
    }

    const view = await render(
      <AppProvider>
        <OverlayDialog />
      </AppProvider>,
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(findOverlay(view)))
    expect(screen.queryByText('遮罩关闭')).toBeNull()
    await view.unmount()
  })

  it('supports message alignment, disabled actions, and lifecycle callbacks', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    const onOpened = jest.fn()
    const onClose = jest.fn()

    function StatefulDialog() {
      const [show, setShow] = useState(true)
      return (
        <Dialog
          show={show}
          message="左对齐正文"
          messageAlign="left"
          showCancelButton
          confirmButtonDisabled
          onConfirm={onConfirm}
          onCancel={onCancel}
          onOpened={onOpened}
          onClose={onClose}
          onShowChange={setShow}
        />
      )
    }

    const view = await render(
      <AppProvider>
        <StatefulDialog />
      </AppProvider>,
    )

    expect(StyleSheet.flatten(screen.getByText('左对齐正文').props.style)).toMatchObject({
      textAlign: 'left',
    })
    expect(screen.getByTestId('dialog-confirm-button').props.accessibilityState?.disabled).toBe(
      true,
    )
    expect(onOpened).toHaveBeenCalledTimes(1)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    expect(onConfirm).not.toHaveBeenCalled()

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-cancel-button')))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('左对齐正文')).toBeNull()
    await view.unmount()
  })

  it('does not settle an imperative promise when beforeClose blocks and the overlay closes', async () => {
    const beforeClose = jest.fn(() => false)
    const view = await render(<AppProvider />)
    let pending!: Promise<unknown>

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      pending = showConfirmDialog({
        beforeClose,
        closeOnClickOverlay: true,
        message: '遮罩不应确认',
      })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    expect(screen.getByText('遮罩不应确认')).toBeTruthy()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(findOverlay(view)))
    expect(screen.queryByText('遮罩不应确认')).toBeNull()
    void pending
    await view.unmount()
  })

  it('supports custom content, custom footer, round buttons, and theme styles', async () => {
    const styles = jest.fn(() => ({ root: { borderWidth: 2 } }))
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: { Dialog: { backgroundColor: '#123456', borderRadius: 20 } },
        }}
      >
        <PortalHost>
          <Dialog
            show
            theme="round-button"
            title={<Text testID="custom-title">自定义标题</Text>}
            message="不会显示"
            footer={<Text testID="custom-footer">自定义底部</Text>}
            styles={styles}
          >
            <Text testID="custom-body">自定义正文</Text>
          </Dialog>
        </PortalHost>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('custom-title')).toBeTruthy()
    expect(screen.getByTestId('custom-body')).toBeTruthy()
    expect(screen.queryByText('不会显示')).toBeNull()
    expect(screen.getByTestId('custom-footer')).toBeTruthy()
    expect(screen.queryByTestId('dialog-confirm-button')).toBeNull()
    expect(styles).toHaveBeenCalled()
    expect(StyleSheet.flatten(screen.getByRole('alert').props.style)).toMatchObject({
      backgroundColor: '#123456',
      borderRadius: 20,
    })
    await view.unmount()
  })

  it('requires PortalHost for imperative calls and makes close safe without an instance', async () => {
    expect(() => showDialog({ message: '没有 PortalHost' })).toThrow(
      'PortalHost must be rendered before mounting an imperative portal',
    )
    expect(() => closeDialog()).not.toThrow()
  })

  it('clears the imperative Dialog entry when the PortalHost unmounts', async () => {
    const view = await render(<AppProvider />)
    let pending!: Promise<unknown>

    await act(async () => {
      pending = showDialog({ message: '宿主卸载后清理' })
    })
    expect(screen.getByText('宿主卸载后清理')).toBeTruthy()

    await view.unmount()
    expect(screen.queryByText('宿主卸载后清理')).toBeNull()
    expect(() => closeDialog()).not.toThrow()
    void pending
  })

  it('requires Portal.Host for controlled rendering', async () => {
    await expect(
      render(
        <ConfigProvider theme={{ token: { motion: false } }}>
          <Dialog show message="没有 Portal.Host" />
        </ConfigProvider>,
      ),
    ).rejects.toThrow('Portal must be rendered inside Portal.Host')
  })
})
