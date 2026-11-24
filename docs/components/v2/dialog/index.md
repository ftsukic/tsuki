# Dialog v2

`Dialog` is a modal prompt backed by the current Tsuki Root's Overlay Registry. It supports controlled or uncontrolled visibility, asynchronous `beforeClose` checks across actions/mask/Back, keyboard avoidance, in-tree `useDialog()`, and out-of-tree `createDialogService()`.

## Declarative API

```tsx
import { Dialog } from '@ftsukic/tsuki'

;<Dialog
  visible={visible}
  onVisibleChange={setVisible}
  title="Delete item?"
  message="This action cannot be undone."
  showCancelButton
  onConfirm={deleteItem}
/>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | — | Controlled visibility. When provided, Dialog requests changes through `onVisibleChange` and does not change the value itself. |
| `defaultVisible` | `boolean` | `false` | Initial visibility for uncontrolled use. |
| `onVisibleChange` | `(visible: boolean) => void` | — | Reports requests from actions, mask taps, and Android Back. |
| `afterOpen`, `afterClose` | `() => void` | — | Lifecycle callbacks fired after enter/exit transitions finish. |
| `title`, `message`, `children`, `footer` | `ReactNode` | — | Optional title and body. Defined `children` replace `message`; a defined `footer` replaces the default buttons. |
| `width` | `DimensionValue` | theme token | Optional explicit panel width override. |
| `theme` | `'default' \| 'round-button'` | `'default'` | Selects the default or pill-shaped action buttons. |
| `showConfirmButton` | `boolean` | `true` | Shows the default confirm action when no custom footer is supplied. |
| `showCancelButton` | `boolean` | `false` | Shows the default cancel action. |
| `confirmButtonText`, `cancelButtonText` | `ReactNode` | `'确认'`, `'取消'` | Labels for the default actions. |
| `confirmButtonDisabled`, `cancelButtonDisabled` | `boolean` | `false` | Disables the corresponding default action. |
| `overlay` | `boolean` | `true` | Renders the mask. The Dialog remains modal when the mask is hidden. |
| `closeOnPressOverlay` | `boolean` | `false` | Requests dismissal when the mask is pressed. Routed through `beforeClose('overlay')`. |
| `closeOnBack` | `boolean` | `true` | Whether Android Back requests dismissal. Routed through `beforeClose('back')`. |
| `keyboardAvoiding` | `boolean` | `true` | Wraps the centered dialog container in a `KeyboardAvoidingView` so dialogs containing inputs stay above the soft keyboard. |
| `beforeClose` | `(reason: DialogDismissReason) => boolean \| void \| Promise<boolean \| void>` | — | Guard called for `'confirm'`, `'cancel'`, `'overlay'`, and `'back'`. Returning `false`, throwing, or rejecting keeps the Dialog open. |
| `onConfirm`, `onCancel` | `() => void` | — | Business callbacks run before `beforeClose`. |
| `initialFocusRef`, `returnFocusRef` | `RefObject<ComponentRef<typeof View> \| null>` | — | Optional explicit accessibility focus targets on open and close. |
| `className`, `classNames`, `style`, `styles` | — | — | Utility classes and native styles for the root, mask, container, header, title, body, message, footer, and actions. |

Dialog inherits React Native `ViewProps`; accessibility properties are applied to the dialog panel and modal isolation is managed by `OverlayHost`. The panel ref points to that native View. Long body content scrolls within the viewport-limited panel. While an asynchronous `beforeClose` is pending, the dialog marks its overlay entry as `busy`, shows loading on the active action, and blocks concurrent actions, mask taps, and Android Back.

## Imperative API (`useDialog` & `createDialogService`)

### In-tree hook (recommended)

`useDialog()` binds directly to the current `TsukiProvider` / `ConfigProvider` scope with no bridge component required, automatically inheriting local theme overrides:

```tsx
import { useDialog } from '@ftsukic/tsuki'

function DeleteButton() {
  const dialog = useDialog()

  async function handlePress() {
    const result = await dialog.confirm({
      title: 'Delete item?',
      message: 'This action cannot be undone.',
    })
    if (result.action === 'confirm') {
      // Confirmed
    }
  }

  return <Button onPress={handlePress}>Delete</Button>
}
```

### Out-of-tree service

For module-level callers (such as network interceptors or stores), create a service and mount `<DialogServiceBridge>` inside `TsukiProvider`:

```tsx
import { createDialogService, DialogServiceBridge, TsukiProvider } from '@ftsukic/tsuki'

export const dialogService = createDialogService()

function AppRoot() {
  return (
    <TsukiProvider scheme="light">
      <DialogServiceBridge service={dialogService} />
      <App />
    </TsukiProvider>
  )
}

const alertResult = await dialogService.alert({ title: 'Saved' })
const confirmResult = await dialogService.confirm({ title: 'Delete item?' })
const handle = dialogService.open({ title: 'Uploading...', showConfirmButton: false })
handle.update({ title: 'Done', showConfirmButton: true })
handle.close()
dialogService.closeAll()
```

Both `useDialog()` and `createDialogService()` return a `DialogController` with `alert`, `confirm`, `open`, and `closeAll`:

- `alert(options)` and `confirm(options)` return `Promise<DialogResult>` where `DialogResult` is `{ action: 'confirm' } | { action: 'cancel' } | { action: 'dismiss'; reason: 'overlay' | 'back' | 'programmatic' }`. Cancelling or dismissing resolves with a structured result rather than rejecting.
- `open(options)` returns a `DialogHandle` with `update(partialOptions)`, `close()`, and `result: Promise<DialogResult>`.
- Calling an unbound `createDialogService()` returns a rejected `Promise` (never a synchronous throw). Calling `closeAll()` safely settles all active requests as `{ action: 'dismiss', reason: 'programmatic' }`.

## Theme and styling

`DialogThemeTokens` is available through `TsukiProvider` and `ConfigProvider` under `components.Dialog`:

```tsx
<ConfigProvider
  theme={{
    components: {
      Dialog: {
        width: 300,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        titleFontSize: 18,
        messageFontSize: 14,
        contentPadding: 24,
        buttonHeight: 48,
      },
    },
  }}
>
  <Dialog />
</ConfigProvider>
```

NativeWind v4 and v5 expose `w-tsuki-dialog`, `rounded-tsuki-dialog`, `bg-tsuki-dialog-background`, `bg-tsuki-dialog-overlay`, `px-tsuki-dialog-content`, `pt-tsuki-dialog-content`, `text-tsuki-dialog-title`, and `text-tsuki-dialog-message`. Dialog renders purely with NativeWind-first `--tsuki-*` token classes bridged through `TsukiProvider`'s `renderThemeScope`; `classNames` / `className` and `styles` / `style` override defaults predictably.

## Examples

- [Playground Overview](../../../../packages/tsuki/src/dialog/__fixtures__/overview.tsx)
- [Basic](../../../../packages/tsuki/src/dialog/__fixtures__/examples/basic.tsx)
- [Confirm and cancel](../../../../packages/tsuki/src/dialog/__fixtures__/examples/confirm.tsx)
- [Controlled](../../../../packages/tsuki/src/dialog/__fixtures__/examples/controlled.tsx)
- [Async beforeClose](../../../../packages/tsuki/src/dialog/__fixtures__/examples/before-close.tsx)
- [Custom content](../../../../packages/tsuki/src/dialog/__fixtures__/examples/custom-content.tsx)
- [Round buttons](../../../../packages/tsuki/src/dialog/__fixtures__/examples/round-button.tsx)
- [Theme](../../../../packages/tsuki/src/dialog/__fixtures__/examples/theme.tsx)
- [Imperative service](../../../../packages/tsuki/src/dialog/__fixtures__/examples/imperative.tsx)
- [Multiple services](../../../../packages/tsuki/src/dialog/__fixtures__/examples/multiple.tsx)
