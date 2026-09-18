import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import * as Reanimated from 'react-native-reanimated'
import {
  closeDialog,
  ConfigProvider,
  Dialog,
  getDialogToken,
  getDesignToken,
  PortalHost,
  resetDialogDefaultOptions,
  setDialogDefaultOptions,
  showConfirmDialog,
  showDialog,
} from '..'
import type { ReactNode } from 'react'
import type { JsonElement, JsonNode, TestInstance } from 'test-renderer'

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

function findJsonNodeByTestID(node: JsonNode | null, testID: string): JsonElement | undefined {
  if (node === null || typeof node === 'string') return undefined
  if (node.props.testID === testID) return node

  for (const child of node.children) {
    const found = findJsonNodeByTestID(child, testID)
    if (found) return found
  }

  return undefined
}

function findPressedOverlays(node: JsonNode | null): JsonElement[] {
  if (node === null || typeof node === 'string') return []

  return [
    ...(node.props.pointerEvents === 'none' ? [node] : []),
    ...node.children.flatMap((child) => findPressedOverlays(child)),
  ]
}

async function firePressState(instance: TestInstance, eventName: 'pressIn' | 'pressOut') {
  fireEvent(instance, eventName)
  await Promise.resolve()
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
    const dialog = screen.getByTestId('dialog')
    const popupPanel = dialog.parent

    expect(StyleSheet.flatten(dialog.props.style)).toMatchObject({
      backgroundColor: '#ffffff',
      width: '100%',
    })
    expect(StyleSheet.flatten(dialog.props.style).maxWidth).toBeUndefined()
    expect(StyleSheet.flatten(popupPanel?.props.style)).toMatchObject({
      width: 320,
      maxWidth: '90%',
    })
    const overlay = findOverlay(view)
    const overlayLayer = overlay?.parent
    const popupRoot = overlayLayer?.parent
    const popupContainer = popupPanel?.parent

    expect(overlay).toBeTruthy()
    expect(popupContainer?.parent).toBe(popupRoot)
    expect(StyleSheet.flatten(popupRoot?.props.style)).toMatchObject({
      ...StyleSheet.absoluteFillObject,
    })
    expect(StyleSheet.flatten(popupContainer?.props.style).zIndex).toBe(
      StyleSheet.flatten(overlayLayer?.props.style).zIndex + 1,
    )
    await view.unmount()
  })

  it('applies a custom width to the Popup panel wrapper', async () => {
    const view = await render(
      <AppProvider>
        <Dialog show width={280} message="自定义宽度" />
      </AppProvider>,
    )

    const dialog = screen.getByRole('alert')
    const popupPanel = dialog.parent

    expect(StyleSheet.flatten(popupPanel?.props.style)).toMatchObject({
      width: 280,
      maxWidth: '90%',
    })
    expect(StyleSheet.flatten(dialog.props.style)).toMatchObject({ width: '100%' })

    await view.unmount()
  })

  it('uses isolated layout for an imperative title-only Dialog', async () => {
    const dialogToken = getDialogToken(getDesignToken())
    const view = await render(<AppProvider />)
    let pending!: Promise<unknown>

    await act(async () => {
      pending = showDialog({ title: '仅标题' })
    })

    const header = screen.getByTestId('dialog-header')
    expect(screen.queryByTestId('dialog-content')).toBeNull()
    expect(StyleSheet.flatten(header.props.style)).toMatchObject({
      paddingTop: dialogToken.headerIsolatedPaddingTop,
      paddingBottom: dialogToken.headerIsolatedPaddingBottom,
      paddingHorizontal: dialogToken.headerIsolatedPaddingHorizontal,
    })

    await act(async () => closeDialog())
    await expect(pending).resolves.toBeUndefined()
    await view.unmount()
  })

  it('uses content-only layout and primary message color for an imperative message-only Dialog', async () => {
    const dialogToken = getDialogToken(getDesignToken())
    const view = await render(<AppProvider />)
    let pending!: Promise<unknown>

    await act(async () => {
      pending = showDialog({ message: '仅正文' })
    })

    expect(screen.queryByTestId('dialog-header')).toBeNull()
    const content = screen.getByTestId('dialog-content')
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({
      paddingTop: dialogToken.messagePaddingHorizontal,
    })
    expect(StyleSheet.flatten(screen.getByText('仅正文').props.style)).toMatchObject({
      color: dialogToken.messageColor,
    })

    await act(async () => closeDialog())
    await expect(pending).resolves.toBeUndefined()
    await view.unmount()
  })

  it('keeps the header and content branches for a title-and-message Dialog', async () => {
    const dialogToken = getDialogToken(getDesignToken())
    const view = await render(
      <AppProvider>
        <Dialog show title="标题" message="正文" />
      </AppProvider>,
    )

    expect(screen.getByTestId('dialog-header')).toBeTruthy()
    const content = screen.getByTestId('dialog-content')
    expect(StyleSheet.flatten(screen.getByTestId('dialog-header').props.style)).toMatchObject({
      paddingTop: dialogToken.headerPaddingTop,
      paddingBottom: dialogToken.headerPaddingBottom,
      paddingHorizontal: dialogToken.headerPaddingHorizontal,
    })
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({
      paddingTop: dialogToken.messagePaddingTop,
    })
    expect(StyleSheet.flatten(screen.getByText('正文').props.style)).toMatchObject({
      color: dialogToken.messageHasTitleColor,
    })

    await view.unmount()
  })

  it('treats empty title and message values as absent content', async () => {
    const { unmount: unmountTitleOnly } = await render(
      <AppProvider>
        <Dialog show title="标题" message="" />
      </AppProvider>,
    )
    expect(screen.getByTestId('dialog-header')).toBeTruthy()
    expect(screen.queryByTestId('dialog-content')).toBeNull()
    await unmountTitleOnly()

    const { unmount: unmountMessageOnly } = await render(
      <AppProvider>
        <Dialog show title="" message="正文" />
      </AppProvider>,
    )
    expect(screen.queryByTestId('dialog-header')).toBeNull()
    expect(screen.getByTestId('dialog-content')).toBeTruthy()
    await unmountMessageOnly()
  })

  it('keeps numeric zero as renderable title and message content', async () => {
    const view = await render(
      <AppProvider>
        <Dialog show title={0} message={1} />
      </AppProvider>,
    )

    expect(screen.getByTestId('dialog-header')).toBeTruthy()
    expect(screen.getByTestId('dialog-content')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()

    await view.unmount()
  })

  it('renders default dialog actions as direct, equally sized footer children', async () => {
    const dialogToken = getDialogToken(getDesignToken())
    const view = await render(
      <AppProvider>
        <Dialog show message="确认操作" showCancelButton />
      </AppProvider>,
    )

    const cancelButton = screen.getByTestId('dialog-cancel-button')
    const confirmButton = screen.getByTestId('dialog-confirm-button')
    const footer = cancelButton.parent

    expect(confirmButton.parent).toBe(footer)
    expect(footer?.children).toHaveLength(2)
    const footerStyle = StyleSheet.flatten(footer?.props.style)
    expect(footerStyle.height).toBeGreaterThan(0)
    expect(StyleSheet.flatten(cancelButton.props.style)).toMatchObject({
      flex: 1,
      minWidth: 0,
      minHeight: footerStyle.height,
    })
    expect(StyleSheet.flatten(confirmButton.props.style)).toMatchObject({
      flex: 1,
      minWidth: 0,
      minHeight: footerStyle.height,
      borderLeftWidth: dialogToken.dividerWidth,
    })
    expect(StyleSheet.flatten(cancelButton.props.style).borderLeftWidth).toBeUndefined()
    expect(StyleSheet.flatten(screen.getByText('取消').props.style)).toMatchObject({
      textAlign: 'center',
    })
    expect(StyleSheet.flatten(screen.getByText('确认').props.style)).toMatchObject({
      textAlign: 'center',
    })

    await view.unmount()
  })

  it('uses Dialog token feedback for default actions and isolates each pressed half', async () => {
    const dialogToken = getDialogToken(getDesignToken())
    const view = await render(
      <AppProvider>
        <Dialog show message="确认操作" showCancelButton />
      </AppProvider>,
    )

    const footer = screen.getByTestId('dialog-cancel-button').parent
    expect(StyleSheet.flatten(footer?.props.style)).toMatchObject({
      borderTopWidth: dialogToken.dividerWidth,
    })
    expect(StyleSheet.flatten(screen.getByRole('alert').props.style)).toMatchObject({
      borderRadius: dialogToken.borderRadius,
    })
    expect(dialogToken.borderRadius).toBe(16)
    expect(
      StyleSheet.flatten(screen.getByTestId('dialog-confirm-button').props.style),
    ).toMatchObject({
      backgroundColor: 'transparent',
      borderRadius: 0,
      minHeight: dialogToken.buttonHeight,
      opacity: 1,
      borderLeftWidth: dialogToken.dividerWidth,
    })
    expect(StyleSheet.flatten(screen.getByText('取消').props.style)).toMatchObject({
      color: dialogToken.cancelButtonColor,
      fontSize: dialogToken.buttonFontSize,
    })
    expect(StyleSheet.flatten(screen.getByText('确认').props.style)).toMatchObject({
      color: dialogToken.confirmButtonColor,
      fontSize: dialogToken.buttonFontSize,
    })

    await firePressState(screen.getByTestId('dialog-cancel-button'), 'pressIn')
    const cancelButton = findJsonNodeByTestID(view.toJSON(), 'dialog-cancel-button')
    const confirmButton = findJsonNodeByTestID(view.toJSON(), 'dialog-confirm-button')
    const cancelOverlays = findPressedOverlays(cancelButton ?? null)
    expect(cancelOverlays).toHaveLength(1)
    expect(StyleSheet.flatten(cancelOverlays[0].props.style).backgroundColor).toBe(
      dialogToken.buttonPressedOverlayColor,
    )
    expect(StyleSheet.flatten(screen.getByTestId('dialog-cancel-button').props.style).opacity).toBe(
      1,
    )
    expect(StyleSheet.flatten(screen.getByText('取消').props.style)).not.toHaveProperty(
      'opacity',
      0.6,
    )
    expect(findPressedOverlays(confirmButton ?? null)).toHaveLength(0)

    await firePressState(screen.getByTestId('dialog-cancel-button'), 'pressOut')
    await firePressState(screen.getByTestId('dialog-confirm-button'), 'pressIn')
    expect(
      findPressedOverlays(findJsonNodeByTestID(view.toJSON(), 'dialog-cancel-button') ?? null),
    ).toHaveLength(0)
    expect(
      findPressedOverlays(findJsonNodeByTestID(view.toJSON(), 'dialog-confirm-button') ?? null),
    ).toHaveLength(1)

    await view.unmount()
  })

  it('uses Dialog disabled opacity for disabled and loading actions', async () => {
    const dialogToken = getDialogToken(getDesignToken())
    let resolveClose!: (allowed: boolean) => void
    const view = await render(
      <AppProvider>
        <Dialog
          show
          message="确认操作"
          showCancelButton
          cancelButtonDisabled
          beforeClose={() => new Promise<boolean>((resolve) => (resolveClose = resolve))}
        />
      </AppProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('dialog-cancel-button').props.style).opacity).toBe(
      dialogToken.buttonDisabledOpacity,
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    await waitFor(() =>
      expect(
        StyleSheet.flatten(screen.getByTestId('dialog-confirm-button').props.style).opacity,
      ).toBe(dialogToken.buttonDisabledOpacity),
    )
    resolveClose(false)
    await waitFor(() =>
      expect(screen.getByTestId('dialog-confirm-button').props.accessibilityState?.disabled).toBe(
        false,
      ),
    )
    await view.unmount()
  })

  it('keeps round-button feedback on Button without a Dialog overlay', async () => {
    const buttonOverlayColor = '#654321'
    const dialogOverlayColor = '#123456'
    const view = await render(
      <ConfigProvider
        theme={{
          token: { motion: false },
          components: {
            Button: { pressedOverlayColor: buttonOverlayColor },
            Dialog: { buttonPressedOverlayColor: dialogOverlayColor },
          },
        }}
      >
        <PortalHost>
          <Dialog show theme="round-button" message="确认操作" showCancelButton />
        </PortalHost>
      </ConfigProvider>,
    )

    await firePressState(screen.getByTestId('dialog-confirm-button'), 'pressIn')
    const confirmButton = findJsonNodeByTestID(view.toJSON(), 'dialog-confirm-button')
    const overlays = findPressedOverlays(confirmButton ?? null)
    expect(overlays).toHaveLength(1)
    expect(StyleSheet.flatten(overlays[0].props.style).backgroundColor).toBe(buttonOverlayColor)
    expect(
      StyleSheet.flatten(screen.getByTestId('dialog-confirm-button').props.style).opacity,
    ).toBe(1)

    await view.unmount()
  })

  it('keeps a single default action as a full-width direct footer child', async () => {
    const view = await render(
      <AppProvider>
        <Dialog show message="确认操作" showCancelButton={false} />
      </AppProvider>,
    )

    const confirmButton = screen.getByTestId('dialog-confirm-button')
    const footer = confirmButton.parent

    expect(footer?.children).toEqual([confirmButton])
    expect(StyleSheet.flatten(confirmButton.props.style)).toMatchObject({
      flex: 1,
      minWidth: 0,
      minHeight: expect.any(Number),
    })
    expect(StyleSheet.flatten(confirmButton.props.style).borderLeftWidth).toBeUndefined()

    await view.unmount()
  })

  it('renders round dialog actions as direct equal-width footer children with a gap', async () => {
    const view = await render(
      <AppProvider>
        <Dialog show theme="round-button" message="确认操作" showCancelButton />
      </AppProvider>,
    )

    const cancelButton = screen.getByTestId('dialog-cancel-button')
    const confirmButton = screen.getByTestId('dialog-confirm-button')
    const footer = cancelButton.parent
    const themeToken = getDesignToken()

    expect(confirmButton.parent).toBe(footer)
    expect(footer?.children).toHaveLength(2)
    const footerStyle = StyleSheet.flatten(footer?.props.style)
    expect(footerStyle).toMatchObject({ gap: expect.any(Number) })
    expect(footerStyle.height).toBeGreaterThan(0)
    expect(StyleSheet.flatten(cancelButton.props.style)).toMatchObject({
      flex: 1,
      minWidth: 0,
      minHeight: expect.any(Number),
    })
    expect(StyleSheet.flatten(confirmButton.props.style)).toMatchObject({
      flex: 1,
      minWidth: 0,
      minHeight: expect.any(Number),
      backgroundColor: themeToken.colorPrimary,
      borderColor: themeToken.colorPrimary,
    })
    expect(StyleSheet.flatten(cancelButton.props.style)).toMatchObject({
      backgroundColor: themeToken.colorBgContainer,
      borderColor: themeToken.colorBorder,
    })
    expect(StyleSheet.flatten(cancelButton.props.style).backgroundColor).not.toBe(
      themeToken.colorText,
    )
    expect(StyleSheet.flatten(screen.getByText('取消').props.style)).toMatchObject({
      color: themeToken.colorText,
    })
    expect(StyleSheet.flatten(screen.getByText('确认').props.style)).toMatchObject({
      color: themeToken.colorTextLightSolid,
    })
    expect(StyleSheet.flatten(confirmButton.props.style).borderLeftWidth).toBeUndefined()

    await view.unmount()
  })

  it('applies round button colors only to labels', async () => {
    const themeToken = getDesignToken()
    const cancelColor = '#722ed1'
    const confirmColor = '#eb2f96'
    const view = await render(
      <AppProvider>
        <Dialog
          show
          theme="round-button"
          message="确认操作"
          showCancelButton
          cancelButtonColor={cancelColor}
          confirmButtonColor={confirmColor}
        />
      </AppProvider>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('dialog-cancel-button').props.style),
    ).toMatchObject({
      backgroundColor: themeToken.colorBgContainer,
      borderColor: themeToken.colorBorder,
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('dialog-confirm-button').props.style),
    ).toMatchObject({
      backgroundColor: themeToken.colorPrimary,
      borderColor: themeToken.colorPrimary,
    })
    expect(StyleSheet.flatten(screen.getByText('取消').props.style)).toMatchObject({
      color: cancelColor,
    })
    expect(StyleSheet.flatten(screen.getByText('确认').props.style)).toMatchObject({
      color: confirmColor,
    })

    await view.unmount()
  })

  it('keeps round semantic action styles on Button roots', async () => {
    const cancelBackground = '#111111'
    const confirmBackground = '#222222'
    const view = await render(
      <AppProvider>
        <Dialog
          show
          theme="round-button"
          message="确认操作"
          showCancelButton
          styles={{
            cancel: { backgroundColor: cancelBackground },
            confirm: { backgroundColor: confirmBackground },
          }}
        />
      </AppProvider>,
    )

    expect(
      StyleSheet.flatten(screen.getByTestId('dialog-cancel-button').props.style),
    ).toMatchObject({
      backgroundColor: cancelBackground,
    })
    expect(
      StyleSheet.flatten(screen.getByTestId('dialog-confirm-button').props.style),
    ).toMatchObject({
      backgroundColor: confirmBackground,
    })

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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('是否继续？')).toBeNull()
    await utils.unmount()
  })

  it('resolves confirm and rejects cancel for imperative dialog promises', async () => {
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

  it('settles the previous imperative dialog before replacing its content', async () => {
    const view = await render(<AppProvider />)
    let first!: Promise<unknown>
    let second!: Promise<unknown>

    await act(async () => {
      first = showDialog({ message: '第一个' })
      second = showConfirmDialog({ message: '第二个' })
    })
    await expect(first).resolves.toBeUndefined()
    expect(screen.getByText('第二个')).toBeTruthy()

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    await expect(second).resolves.toBe('confirm')
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
    const dialog = screen.getByRole('alert')
    expect(StyleSheet.flatten(dialog.parent?.props.style)).toMatchObject({ width: 280 })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    await expect(pending).resolves.toBe('confirm')
    await view.unmount()
  })

  it('supports defaults and resolves undefined when closing the current imperative dialog', async () => {
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
    await expect(pending).resolves.toBeUndefined()
    expect(screen.queryByText('默认消息')).toBeNull()
    await view.unmount()
  })

  it('resolves closeDialog only after the shared close animation completes', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, config, callback) => {
      if (config?.duration !== 200) return value
      animations.push({
        complete: (finished = true) => callback?.(finished),
      })
      return value
    })

    const view = await render(
      <ConfigProvider theme={{ token: { motion: true } }}>
        <PortalHost />
      </ConfigProvider>,
    )
    let pending!: Promise<unknown>

    await act(async () => {
      pending = showDialog({ message: '动画关闭' })
    })
    await act(async () => animations[0]?.complete())

    await act(async () => closeDialog())
    expect(animations).toHaveLength(2)

    let settled = false
    void pending.then(() => {
      settled = true
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})
    expect(settled).toBe(false)

    await act(async () => animations[1]?.complete())
    await expect(pending).resolves.toBeUndefined()
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

  it('keeps imperative promises pending when beforeClose blocks confirm or cancel', async () => {
    const view = await render(<AppProvider />)
    let confirmPromise!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      confirmPromise = showConfirmDialog({ beforeClose: () => false, message: '阻止确认' })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    let confirmSettled = false
    void confirmPromise.then(
      () => {
        confirmSettled = true
      },
      () => {
        confirmSettled = true
      },
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})
    expect(confirmSettled).toBe(false)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      closeDialog()
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})

    let cancelPromise!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      cancelPromise = showConfirmDialog({ beforeClose: () => false, message: '阻止取消' })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-cancel-button')))
    let cancelSettled = false
    void cancelPromise.then(
      () => {
        cancelSettled = true
      },
      () => {
        cancelSettled = true
      },
    )
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})
    expect(cancelSettled).toBe(false)
    await view.unmount()
  })

  it('settles the allowed async beforeClose action with its action semantics', async () => {
    let allow!: (value: boolean) => void
    const beforeClose = () => new Promise<boolean>((resolve) => (allow = resolve))
    const view = await render(<AppProvider />)

    let confirmPromise!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      confirmPromise = showConfirmDialog({ beforeClose, message: '异步确认' })
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    allow(true)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})
    await expect(confirmPromise).resolves.toBe('confirm')

    let cancelAllow!: (value: boolean) => void
    const cancelBeforeClose = () =>
      new Promise<boolean>((resolve) => {
        cancelAllow = resolve
      })
    let cancelPromise!: Promise<unknown>
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      cancelPromise = showConfirmDialog({ beforeClose: cancelBeforeClose, message: '异步取消' })
    })
    const cancelExpectation = expect(cancelPromise).rejects.toBe('cancel')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-cancel-button')))
    cancelAllow(true)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {})
    await cancelExpectation
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

  it('keeps dialog close lifecycle behind the shared Popup transition', async () => {
    const animations: Array<{ complete: (finished?: boolean) => void }> = []
    jest.spyOn(Reanimated, 'withTiming').mockImplementation((value, config, callback) => {
      if (config?.duration !== 200) return value
      animations.push({
        complete: (finished = true) => callback?.(finished),
      })
      return value
    })
    const onOpened = jest.fn()
    const onClose = jest.fn()

    function StatefulDialog() {
      const [show, setShow] = useState(true)
      return (
        <Dialog
          show={show}
          message="动画生命周期"
          onOpened={onOpened}
          onClose={onClose}
          onShowChange={setShow}
        />
      )
    }

    const view = await render(
      <ConfigProvider theme={{ token: { motion: true } }}>
        <PortalHost>
          <StatefulDialog />
        </PortalHost>
      </ConfigProvider>,
    )

    await act(async () => animations[0]?.complete())
    expect(onOpened).toHaveBeenCalledTimes(1)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => fireEvent.press(screen.getByTestId('dialog-confirm-button')))
    expect(onClose).not.toHaveBeenCalled()
    expect(animations).toHaveLength(2)

    await act(async () => animations[1]?.complete())
    expect(onClose).toHaveBeenCalledTimes(1)
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
    await expect(pending).resolves.toBeUndefined()
  })

  it('requires PortalHost for controlled rendering', async () => {
    await expect(
      render(
        <ConfigProvider theme={{ token: { motion: false } }}>
          <Dialog show message="没有 Portal.Host" />
        </ConfigProvider>,
      ),
    ).rejects.toThrow()
  })
})
