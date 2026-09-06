import { Button } from '../button'
import { ButtonBar } from '../button-bar'
import { attachPropertiesToComponent } from '../helpers'
import { useLocale } from '../locale'
import { Popup, PopupHeader } from '../popup'
import { mountPortal, unmountPortal } from '../portal'
import { Tree, findNodeByValue } from '../tree'
import type { SelectorOption, SelectorProps, SelectorValue } from './interface'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

type SelectorViewProps = SelectorProps & { onConfirm?: () => void }

function SelectorView({
  title,
  confirmButtonText,
  closeOnPressOverlay = true,
  onClose,
  onChange,
  onChangeImmediate,
  multiple = false,
  value: valueProp,
  defaultValue,
  options,
  onConfirm,
  ...props
}: SelectorViewProps) {
  const locale = useLocale().Selector
  const [value, setValue] = useState<SelectorValue | SelectorValue[]>(
    valueProp ?? defaultValue ?? (multiple ? [] : options[0]?.value),
  )
  useEffect(() => {
    if (valueProp !== undefined) setValue(valueProp)
  }, [valueProp])
  const current = multiple ? (value as SelectorValue[]) : value
  const content = (
    <>
      <PopupHeader title={title ?? locale.title} onClose={onClose} />
      <Tree
        {...props}
        multiple={multiple}
        options={options}
        value={current}
        onChange={(next) => {
          const normalized =
            onChangeImmediate?.(next as SelectorValue | SelectorValue[]) ??
            (next as SelectorValue | SelectorValue[])
          setValue(normalized)
          if (!multiple)
            onChange?.(
              normalized as SelectorValue,
              normalized == null
                ? []
                : ([findNodeByValue(options, normalized as SelectorValue)].filter(
                    Boolean,
                  ) as typeof options),
            )
        }}
      />
      {multiple ? (
        <ButtonBar alone divider={false}>
          <Button
            type="primary"
            text={confirmButtonText ?? locale.confirmButtonText}
            onPress={() => {
              onChange?.(
                value as SelectorValue[],
                (value as SelectorValue[])
                  .map((item) => findNodeByValue(options, item))
                  .filter(Boolean) as typeof options,
              )
              onConfirm?.()
            }}
          />
        </ButtonBar>
      ) : null}
    </>
  )
  return (
    <Popup
      {...props}
      position="bottom"
      visible={props.visible}
      closeOnPressOverlay={closeOnPressOverlay}
      onPressOverlay={onClose}
      onClose={onClose}
    >
      {content}
    </Popup>
  )
}

export type SelectorShowOptions = Omit<SelectorProps, 'visible' | 'onChange' | 'onClose'>
export interface SelectorResult {
  action: 'cancel' | 'confirm'
  value: SelectorValue | SelectorValue[]
  options: SelectorOption[]
}

interface SelectorMethodProps {
  options: SelectorShowOptions
  onResult: (result: SelectorResult) => void
  onClosed: () => void
  onReady: (close: (() => void) | null) => void
}

function SelectorMethod({ options, onResult, onClosed, onReady }: SelectorMethodProps) {
  const [visible, setVisible] = useState(false)
  const currentValue = useRef<SelectorResult['value']>(
    options.value ?? options.defaultValue ?? (options.multiple ? [] : options.options[0]?.value),
  )
  const currentOptions = useRef<SelectorOption[]>([])
  const settled = useRef(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const finish = useCallback(
    (action: SelectorResult['action']) => {
      if (settled.current) return
      settled.current = true
      onResult({ action, value: currentValue.current, options: currentOptions.current })
      setVisible(false)
    },
    [onResult],
  )

  useEffect(() => {
    onReady(() => finish('cancel'))
    return () => onReady(null)
  }, [finish, onReady])

  return (
    <SelectorView
      {...options}
      visible={visible}
      onChange={(value, selectedOptions) => {
        currentValue.current = value
        currentOptions.current = selectedOptions
        if (!options.multiple) finish('confirm')
      }}
      onConfirm={() => finish('confirm')}
      onClose={() => finish('cancel')}
      onRequestClose={() => {
        if (options.onRequestClose?.()) return true
        finish('cancel')
        return true
      }}
      onClosed={() => {
        options.onClosed?.()
        onClosed()
      }}
    />
  )
}

let selectorKey: number | null = null
let selectorClose: (() => void) | null = null
function showSelector(options: SelectorShowOptions) {
  if (selectorKey !== null) {
    selectorClose?.()
    unmountPortal(selectorKey)
    selectorKey = null
    selectorClose = null
  }
  return new Promise<SelectorResult>((resolve) => {
    let key: number | null = null
    selectorKey = mountPortal(
      <SelectorMethod
        options={options}
        onResult={resolve}
        onReady={(close) => {
          if (key !== null && selectorKey === key) selectorClose = close
        }}
        onClosed={() => {
          if (key !== null && selectorKey === key) {
            unmountPortal(key)
            selectorKey = null
            selectorClose = null
          }
        }}
      />,
    )
    key = selectorKey
  })
}
export const Selector = attachPropertiesToComponent(memo(SelectorView), {
  show: showSelector,
  hide: () => {
    if (selectorKey !== null) {
      if (selectorClose) selectorClose()
      else {
        unmountPortal(selectorKey)
        selectorKey = null
      }
    }
  },
})
export default Selector
