import {
  Fragment,
  forwardRef,
  isValidElement,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Tab, Tabs } from '../tabs'
import { useToken } from '../theme'
import { PickerToolbar } from '../picker/picker-toolbar'
import { PickerGroupProvider } from './context'
import { getPickerGroupStyles } from './style'
import type { PickerGroupChildRef, PickerGroupProps, PickerGroupRef } from './types'

const EMPTY_SELECTION = { values: [], options: [], indexes: [] } as const

function flattenPickerGroupChildren(children: ReactNode): ReactNode[] {
  if (children === null || children === undefined || children === false) return []
  if (Array.isArray(children)) return children.flatMap(flattenPickerGroupChildren)
  if (isValidElement(children) && children.type === Fragment) {
    return flattenPickerGroupChildren((children.props as { children?: ReactNode }).children)
  }
  return [children]
}

function normalizeActiveTab(index: number, count: number) {
  if (count <= 0) return 0
  const normalized = Number.isFinite(index) ? Math.trunc(index) : 0
  return Math.min(Math.max(normalized, 0), count - 1)
}

function PickerGroupPane({
  index,
  children,
  register,
}: {
  index: number
  children: ReactNode
  register: (index: number, ref: PickerGroupChildRef | null) => void
}) {
  const value = useMemo(() => ({ index, register }), [index, register])
  return <PickerGroupProvider value={value}>{children}</PickerGroupProvider>
}

export const PickerGroup = forwardRef<PickerGroupRef, PickerGroupProps>(function PickerGroup(
  {
    children,
    tabs = [],
    activeTab,
    defaultActiveTab = 0,
    onChange,
    nextStepText,
    title,
    cancelButtonText = '取消',
    confirmButtonText = '确定',
    showToolbar = true,
    onConfirm,
    onCancel,
    style,
    styles,
    testID,
  },
  ref,
) {
  const { token } = useToken()
  const childRefs = useRef<Array<PickerGroupChildRef | null>>([])
  const childNodes = useMemo(() => flattenPickerGroupChildren(children), [children])
  const mismatchSignature = `${tabs.length}:${childNodes.length}`
  const warnedMismatchRef = useRef<string | null>(null)
  useEffect(() => {
    if (typeof __DEV__ !== 'undefined' && __DEV__ && tabs.length !== childNodes.length) {
      if (warnedMismatchRef.current !== mismatchSignature) {
        console.warn(
          `PickerGroup tabs (${tabs.length}) and children (${childNodes.length}) are not positionally aligned`,
        )
        warnedMismatchRef.current = mismatchSignature
      }
    } else {
      warnedMismatchRef.current = null
    }
  }, [childNodes.length, mismatchSignature, tabs.length])
  const controlled = activeTab !== undefined
  const [internalActiveTab, setInternalActiveTab] = useState(() =>
    normalizeActiveTab(activeTab ?? defaultActiveTab, tabs.length),
  )
  const index = controlled
    ? normalizeActiveTab(activeTab as number, tabs.length)
    : normalizeActiveTab(internalActiveTab, tabs.length)

  const selectIndex = useCallback(
    (next: number) => {
      const normalized = normalizeActiveTab(next, tabs.length)
      if (normalized === index) return false
      if (!controlled) setInternalActiveTab(normalized)
      onChange?.(normalized)
      return true
    },
    [controlled, index, onChange, tabs.length],
  )
  const register = useCallback((i: number, childRef: PickerGroupChildRef | null) => {
    childRefs.current[i] = childRef
  }, [])
  const finalConfirm = useCallback(() => {
    const results = Array.from(
      { length: tabs.length },
      (_, childIndex) => childRefs.current[childIndex]?.confirm() ?? EMPTY_SELECTION,
    )
    onConfirm?.(results)
  }, [onConfirm, tabs.length])
  const confirm = useCallback(() => {
    if (index < tabs.length - 1 && Boolean(nextStepText)) {
      selectIndex(index + 1)
      return
    }
    finalConfirm()
  }, [finalConfirm, index, nextStepText, selectIndex, tabs.length])
  const cancel = useCallback(() => onCancel?.(), [onCancel])
  useImperativeHandle(
    ref,
    () => ({
      cancel,
      confirm,
      getSelectedValues: () =>
        Array.from(
          { length: tabs.length },
          (_, childIndex) => childRefs.current[childIndex]?.getSelectedValues() ?? [],
        ),
    }),
    [cancel, confirm, tabs.length],
  )

  const groupStyles = getPickerGroupStyles(token)
  const tabsStyles = useMemo(
    () => ({
      root: [groupStyles.tabs, styles?.tabs],
    }),
    [groupStyles.tabs, styles?.tabs],
  )
  const panes = tabs.map((tab, i) => (
    <Tab key={i} title={tab}>
      <PickerGroupPane index={i} register={register}>
        {childNodes[i]}
      </PickerGroupPane>
    </Tab>
  ))

  return (
    <View testID={testID ?? 'picker-group'} style={[groupStyles.root, styles?.root, style]}>
      {showToolbar ? (
        <PickerToolbar
          cancelButtonText={cancelButtonText}
          confirmButtonText={
            index < tabs.length - 1 && Boolean(nextStepText) ? nextStepText : confirmButtonText
          }
          onCancel={cancel}
          onConfirm={confirm}
          title={title}
          testID="picker-toolbar"
        />
      ) : null}
      <Tabs
        animated
        lazyRender={false}
        value={index}
        onChange={(value) => selectIndex(typeof value === 'number' ? value : Number(value))}
        shrink
        swipeable={false}
        styles={tabsStyles}
        testID="picker-group-tabs"
      >
        {panes}
      </Tabs>
    </View>
  )
})
