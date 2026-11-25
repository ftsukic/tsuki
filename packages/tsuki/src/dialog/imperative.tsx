import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react'
import { DialogContent, DialogMask } from './dialog-content'
import { createDialogTransition } from '../overlay/transition/presets'
import { useDialogState } from './useDialogState'
import type { OverlayController, OverlayHandle } from '../overlay/controller'
import type { OverlayRegistry } from '../overlay/types'
import { useTsukiTheme } from '../theme/theme'
import type {
  DialogController,
  DialogHandle,
  DialogOptions,
  DialogResult,
  DialogService,
} from './types'

interface DialogRequest {
  readonly id: number
  options: DialogOptions
  readonly listeners: Set<() => void>
  overlayHandle?: OverlayHandle
  busy: boolean
  dismissFromOwner?: (reason: 'overlay' | 'back') => void
  resolve: (result: DialogResult) => void
  settled: boolean
}

interface DialogServiceRegistration {
  controller: OverlayController
  getAnimationDuration: () => number
  lease: number
  pending: boolean
}

interface DialogServiceBinding {
  controller: OverlayController
  registry: OverlayRegistry
  registrations: Map<symbol, DialogServiceRegistration>
}

interface DialogServiceState {
  binding: DialogServiceBinding | null
  requests: Map<number, DialogRequest>
  nextRequestId: number
}

const serviceStates = new WeakMap<DialogService, DialogServiceState>()

function hasActiveBinding(binding: DialogServiceBinding | null): binding is DialogServiceBinding {
  return Boolean(
    binding && [...binding.registrations.values()].some((registration) => !registration.pending),
  )
}

function getActiveRegistration(state: DialogServiceState): DialogServiceRegistration | null {
  if (!hasActiveBinding(state.binding)) return null
  const active = [...state.binding.registrations.values()]
    .filter((registration) => !registration.pending)
    .at(-1)
  return active ?? null
}

function settleRequest(
  requests: Map<number, DialogRequest>,
  request: DialogRequest,
  result: DialogResult,
) {
  if (request.settled) return
  request.settled = true
  requests.delete(request.id)
  request.resolve(result)
}

function closeRequestProgrammatically(
  requests: Map<number, DialogRequest>,
  request: DialogRequest,
) {
  settleRequest(requests, request, { action: 'dismiss', reason: 'programmatic' })
  request.overlayHandle?.close()
}

function notifyRequest(request: DialogRequest) {
  request.listeners.forEach((listener) => listener())
}

function createMask(request: DialogRequest) {
  if (request.options.overlay === false) return undefined
  return (
    <DialogMask
      classNames={request.options.classNames}
      closeOnClick={request.options.closeOnPressOverlay ?? false}
      closeOnPress={() => request.dismissFromOwner?.('overlay')}
      style={request.options.styles?.mask}
    />
  )
}

export function openDialogWithController(
  controller: OverlayController,
  requests: Map<number, DialogRequest>,
  nextId: number,
  options: DialogOptions,
  canContinue: () => boolean,
  animationDuration = 200,
): DialogHandle {
  let resolveResult!: (result: DialogResult) => void
  const result = new Promise<DialogResult>((resolve) => {
    resolveResult = resolve
  })

  const request: DialogRequest = {
    id: nextId,
    options: {
      ...options,
      showConfirmButton: options.showConfirmButton ?? true,
      showCancelButton: options.showCancelButton ?? false,
    },
    listeners: new Set(),
    busy: false,
    resolve: resolveResult,
    settled: false,
  }
  requests.set(request.id, request)

  const closeOnBack = request.options.closeOnBack ?? true
  try {
    request.overlayHandle = controller.open({
      content: (
        <ImperativeDialogContent
          canContinue={canContinue}
          key={request.id}
          request={request}
          requests={requests}
        />
      ),
      mask: createMask(request),
      transition: createDialogTransition(animationDuration),
      accessibility: {
        mode: 'modal',
        initialFocusRef: request.options.initialFocusRef,
        returnFocusRef: request.options.returnFocusRef,
      },
      backBehavior: closeOnBack ? 'dismiss' : 'consume',
      onBack: closeOnBack ? () => request.dismissFromOwner?.('back') : undefined,
      onEntered: () => request.options.afterOpen?.(),
      onExited: () => request.options.afterClose?.(),
    })
  } catch (error) {
    requests.delete(request.id)
    request.settled = true
    const rejected = Promise.reject(error)
    return Object.freeze({
      update: () => undefined,
      close: () => undefined,
      result: rejected,
    })
  }

  return Object.freeze({
    update(patch: Partial<DialogOptions>) {
      if (request.settled) return
      request.options = { ...request.options, ...patch }
      const nextCloseOnBack = request.options.closeOnBack ?? true
      request.overlayHandle?.update({
        mask: createMask(request),
        backBehavior: nextCloseOnBack ? 'dismiss' : 'consume',
        onBack: nextCloseOnBack ? () => request.dismissFromOwner?.('back') : undefined,
        accessibility: {
          mode: 'modal',
          initialFocusRef: request.options.initialFocusRef,
          returnFocusRef: request.options.returnFocusRef,
        },
      })
      notifyRequest(request)
    },
    close() {
      closeRequestProgrammatically(requests, request)
    },
    result,
  })
}

export function createBoundDialogController(
  getController: () => OverlayController | null,
  requests: Map<number, DialogRequest>,
  nextId: () => number,
  canContinue: () => boolean,
  missingMessage: string,
  getAnimationDuration: () => number = () => 200,
): DialogController {
  function open(options: DialogOptions = {}): DialogHandle {
    const controller = getController()
    if (!controller) {
      const error = new Error(missingMessage)
      return Object.freeze({
        update: () => undefined,
        close: () => undefined,
        result: Promise.reject(error),
      })
    }

    for (const previous of [...requests.values()]) {
      closeRequestProgrammatically(requests, previous)
    }

    return openDialogWithController(
      controller,
      requests,
      nextId(),
      options,
      canContinue,
      getAnimationDuration(),
    )
  }

  return Object.freeze({
    alert(options: DialogOptions = {}) {
      return open({
        ...options,
        showConfirmButton: options.showConfirmButton ?? true,
        showCancelButton: options.showCancelButton ?? false,
      }).result
    },
    confirm(options: DialogOptions = {}) {
      return open({
        ...options,
        showConfirmButton: options.showConfirmButton ?? true,
        showCancelButton: options.showCancelButton ?? true,
      }).result
    },
    open,
    closeAll() {
      for (const request of [...requests.values()]) {
        closeRequestProgrammatically(requests, request)
      }
    },
  })
}

/** Creates an imperative API whose calls work only while its Bridge is mounted in a Root. */
export function createDialogService(): DialogService {
  const state: DialogServiceState = {
    binding: null,
    requests: new Map(),
    nextRequestId: 1,
  }
  const service = createBoundDialogController(
    () => getActiveRegistration(state)?.controller ?? null,
    state.requests,
    () => state.nextRequestId++,
    () => hasActiveBinding(state.binding),
    'DialogService requires a mounted DialogServiceBridge inside TsukiProvider.',
    () => getActiveRegistration(state)?.getAnimationDuration() ?? 200,
  )
  serviceStates.set(service, state)
  return service
}

export function bindDialogService(
  service: DialogService,
  controller: OverlayController,
  registry: OverlayRegistry,
  getAnimationDuration: () => number = () => 200,
): symbol {
  const state = getState(service)
  const current = state.binding
  if (current && current.registry !== registry && hasActiveBinding(current)) {
    throw new Error('A DialogService can only be bound to one TsukiProvider Root at a time.')
  }

  if (current && current.registry !== registry) {
    for (const request of [...state.requests.values()]) {
      closeRequestProgrammatically(state.requests, request)
    }
  }

  const binding =
    current?.registry === registry ? current : { controller, registry, registrations: new Map() }
  const token = Symbol('dialog-service-binding')
  binding.controller = controller
  binding.registrations.set(token, {
    controller,
    getAnimationDuration,
    lease: 0,
    pending: false,
  })
  state.binding = binding
  return token
}

export function releaseDialogService(service: DialogService, token: symbol) {
  const state = getState(service)
  const binding = state.binding
  const registration = binding?.registrations.get(token)
  if (!binding || !registration) return

  registration.pending = true
  const cleanupLease = ++registration.lease
  void Promise.resolve().then(() => {
    if (
      state.binding !== binding ||
      binding.registrations.get(token) !== registration ||
      registration.lease !== cleanupLease
    ) {
      return
    }
    binding.registrations.delete(token)
    const remaining = [...binding.registrations.values()].filter((entry) => !entry.pending).at(-1)
    if (remaining) {
      binding.controller = remaining.controller
      return
    }

    for (const request of [...state.requests.values()]) {
      closeRequestProgrammatically(state.requests, request)
    }
    state.binding = null
  })
}

function getState(service: DialogService): DialogServiceState {
  const state = serviceStates.get(service)
  if (!state) throw new Error('The DialogService was not created by createDialogService().')
  return state
}

function ImperativeDialogContent({
  request,
  requests,
  canContinue,
}: {
  request: DialogRequest
  requests: Map<number, DialogRequest>
  canContinue: () => boolean
}) {
  const options = useSyncExternalStore(
    (listener) => {
      request.listeners.add(listener)
      return () => request.listeners.delete(listener)
    },
    () => request.options,
    () => request.options,
  )
  const dialogState = useDialogState({
    defaultVisible: true,
    beforeClose: options.beforeClose,
    onConfirm: options.onConfirm,
    onCancel: options.onCancel,
    canContinue: () => requests.get(request.id) === request && !request.settled && canContinue(),
    onRequestClose: (result) => {
      settleRequest(requests, request, result)
      request.overlayHandle?.close()
    },
  })
  const theme = useTsukiTheme()
  const dialogDuration = theme.components.Dialog.animationDuration
  const { busy, pendingAction, requestAction, requestDismiss } = dialogState

  useLayoutEffect(() => {
    request.overlayHandle?.update({
      transition: createDialogTransition(dialogDuration),
    })
  }, [dialogDuration, request])

  useLayoutEffect(() => {
    request.dismissFromOwner = requestDismiss
    return () => {
      request.dismissFromOwner = undefined
    }
  }, [request, requestDismiss])

  useEffect(() => {
    if (request.busy === busy) return
    request.busy = busy
    request.overlayHandle?.update({ busy })
  }, [busy, request])

  return (
    <DialogContent
      {...options}
      busy={busy}
      onCancelPress={() => requestAction('cancel')}
      onConfirmPress={() => requestAction('confirm')}
      pendingAction={pendingAction}
      visible
    />
  )
}
