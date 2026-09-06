import { Button } from '../button'
import { attachPropertiesToComponent } from '../helpers'
import { useLocale } from '../locale'
import { PickerView } from '../picker-view'
import { Popup } from '../popup'
import { mountPortal, unmountPortal } from '../portal'
import { useToken } from '../theme'
import type { PickerProps } from './interface'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'

function PickerViewComponent({
  title,
  confirmButtonText,
  cancelButtonText,
  toolbarPosition = 'top',
  showToolbar = true,
  onCancel,
  onConfirm,
  ...props
}: PickerProps) {
  const locale = useLocale().Picker
  const { components } = useToken()
  const token = components.Picker
  const toolbar = showToolbar ? (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: token.toolbarBackgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: token.toolbarPaddingHorizontal,
        paddingVertical: token.toolbarPaddingVertical,
      }}
    >
      <Button
        type="link"
        square
        size="medium"
        text={cancelButtonText ?? locale.cancelButtonText}
        textColor={token.toolbarTextColor}
        onPress={onCancel}
      />
      <Text style={{ color: token.titleColor }}>{title}</Text>
      <Button
        type="link"
        square
        size="medium"
        text={confirmButtonText ?? locale.confirmButtonText}
        textColor={token.toolbarTextColor}
        onPress={onConfirm}
      />
    </View>
  ) : null
  return (
    <Popup {...props} position="bottom">
      <>
        {toolbarPosition === 'top' ? toolbar : null}
        <PickerView {...props} />
        {toolbarPosition === 'bottom' ? toolbar : null}
      </>
    </Popup>
  )
}

export type PickerShowOptions = Omit<PickerProps, 'visible' | 'onCancel' | 'onConfirm'>
export interface PickerResult {
  action: 'cancel' | 'confirm'
  values?: PickerProps['value']
}

interface PickerMethodProps {
  options: PickerShowOptions
  onResult: (result: PickerResult) => void
  onClosed: () => void
  onReady: (close: (() => void) | null) => void
}

function PickerMethod({ options, onResult, onClosed, onReady }: PickerMethodProps) {
  const [visible, setVisible] = useState(false)
  const currentValues = useRef(options.value)
  const settled = useRef(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const finish = useCallback(
    (action: PickerResult['action']) => {
      if (settled.current) return
      settled.current = true
      onResult({ action, values: action === 'confirm' ? currentValues.current : undefined })
      setVisible(false)
    },
    [onResult],
  )

  useEffect(() => {
    onReady(() => finish('cancel'))
    return () => onReady(null)
  }, [finish, onReady])

  return (
    <PickerViewComponent
      {...options}
      visible={visible}
      onChange={(values, columns) => {
        currentValues.current = values
        options.onChange?.(values, columns)
      }}
      onCancel={() => finish('cancel')}
      onConfirm={() => finish('confirm')}
      onPressOverlay={() => {
        options.onPressOverlay?.()
        finish('cancel')
      }}
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

let pickerKey: number | null = null
let pickerClose: (() => void) | null = null
function showPicker(options: PickerShowOptions) {
  if (pickerKey !== null) {
    pickerClose?.()
    unmountPortal(pickerKey)
    pickerKey = null
    pickerClose = null
  }
  return new Promise<PickerResult>((resolve) => {
    let key: number | null = null
    pickerKey = mountPortal(
      <PickerMethod
        options={options}
        onResult={resolve}
        onReady={(close) => {
          if (key !== null && pickerKey === key) pickerClose = close
        }}
        onClosed={() => {
          if (key !== null && pickerKey === key) {
            unmountPortal(key)
            pickerKey = null
            pickerClose = null
          }
        }}
      />,
    )
    key = pickerKey
  })
}
export const Picker = attachPropertiesToComponent(memo(PickerViewComponent), {
  show: showPicker,
  hide: () => {
    if (pickerKey !== null) {
      if (pickerClose) pickerClose()
      else {
        unmountPortal(pickerKey)
        pickerKey = null
      }
    }
  },
})
export default Picker
