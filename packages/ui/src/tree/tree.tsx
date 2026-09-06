import { Empty } from '../empty'
import { useControllableValue } from '../hooks'
import { Icon } from '../icon'
import { Search } from '../search'
import { useToken } from '../theme'
import type { TreeOption, TreeProps, TreeSearchListData, TreeValue } from './interface'
import { TreeItem } from './tree-item'
import { TreeMultipleMode } from './multiple-mode'
import { memo, useMemo, useState } from 'react'
import { FlatList, Text, View } from 'react-native'

export const findNodeByValue = (tree: TreeOption[], value: TreeValue): TreeOption | undefined => {
  for (const item of tree) {
    if (item.value === value) return item
    const found: TreeOption | undefined = item.children
      ? findNodeByValue(item.children, value)
      : undefined
    if (found) return found
  }
  return undefined
}
export const findAllChildrenValue = (tree: TreeOption[]): TreeValue[] =>
  tree.flatMap((item) => [
    item.value,
    ...(item.children ? findAllChildrenValue(item.children) : []),
  ])
export const flattenTree = (tree: TreeOption[]): TreeOption[] =>
  tree.flatMap((item) => [item, ...(item.children ? flattenTree(item.children) : [])])
const parentsOf = (tree: TreeOption[], value: TreeValue): TreeOption[] => {
  for (const item of tree) {
    if (item.children?.some((child) => child.value === value)) return [item]
    const nested = item.children ? parentsOf(item.children, value) : []
    if (nested.length) return [item, ...nested]
  }
  return []
}
const highlight = (label: string, keyword: string): TreeSearchListData['labels'] => {
  if (!keyword) return []
  const result: TreeSearchListData['labels'] = []
  const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  let pointer = 0
  for (const match of label.matchAll(regex)) {
    const index = match.index ?? 0
    if (index > pointer) result.push({ text: label.slice(pointer, index), highlight: false })
    result.push({ text: match[0], highlight: true })
    pointer = index + match[0].length
  }
  if (pointer < label.length) result.push({ text: label.slice(pointer), highlight: false })
  return result
}

function Tree({
  multiple = false,
  multipleMode = TreeMultipleMode.NORMAL,
  options,
  value: valueProp,
  defaultValue,
  onChange,
  renderSwitcherIcon,
  indent = 16,
  activeColor,
  defaultExpandedValues = [],
  defaultExpandAll = false,
  search = false,
  onSearch,
  placeholder,
  minHeight = true,
  cancellable = false,
  editable = true,
}: TreeProps) {
  const { components, token: themeToken } = useToken()
  const token = components.Tree
  const resolvedActiveColor = activeColor ?? token.activeColor
  const [value, setValue] = useControllableValue<TreeValue | TreeValue[] | null>(
    { value: valueProp, defaultValue },
    { defaultValue: multiple ? [] : null },
  )
  const [expanded, setExpanded] = useState<TreeValue[]>(() =>
    defaultExpandAll ? findAllChildrenValue(options) : defaultExpandedValues,
  )
  const [keyword, setKeyword] = useState('')
  const selected = multiple ? ((value as TreeValue[] | null) ?? []) : []
  const visible = useMemo(() => {
    const rows: (TreeOption & { tier: number })[] = []
    const visit = (items: TreeOption[], tier: number) =>
      items.forEach((item) => {
        rows.push({ ...item, tier })
        if (item.children?.length && expanded.includes(item.value)) visit(item.children, tier + 1)
      })
    visit(options, 0)
    return rows
  }, [expanded, options])
  const searchRows = useMemo(() => {
    const all = flattenTree(options)
    const custom = onSearch?.(keyword, all)
    return (
      custom ??
      all
        .filter((item) => item.label.toLowerCase().includes(keyword.toLowerCase()))
        .map((item) => ({ ...item, labels: highlight(item.label, keyword) }))
    ).map((item: TreeOption | TreeSearchListData) => ({
      ...item,
      parents: parentsOf(options, item.value),
    }))
  }, [keyword, onSearch, options])
  const change = (item: TreeOption) => {
    if (!editable || item.disabled) return
    if (!multiple) {
      const checked = value !== item.value
      const next = checked || !cancellable ? item.value : null
      setValue(next)
      onChange?.(next, next ? [item] : [], { checked, option: item })
      return
    }
    const current = [...selected]
    const included = current.includes(item.value)
    let next: TreeValue[]
    if (multipleMode === TreeMultipleMode.INDEPENDENT)
      next = included ? current.filter((v) => v !== item.value) : [...current, item.value]
    else {
      const affected = [item.value, ...(item.children ? findAllChildrenValue(item.children) : [])]
      next = included
        ? current.filter((v) => !affected.includes(v))
        : [...current, ...affected.filter((v) => !current.includes(v))]
    }
    setValue(next)
    onChange?.(next, next.map((v) => findNodeByValue(options, v)).filter(Boolean) as TreeOption[], {
      checked: !included,
      option: item,
    })
  }
  const row = (item: (TreeOption | TreeSearchListData) & { tier: number }, searchable = false) => {
    const active = multiple ? selected.includes(item.value) : value === item.value
    const hasChildren = !!item.children?.length
    const isExpanded = expanded.includes(item.value)
    const switcher = hasChildren ? (
      <View
        style={{
          transform: [
            { rotateZ: isExpanded && item.switcherIconRotatable !== false ? '90deg' : '0deg' },
          ],
        }}
      >
        {(item.renderSwitcherIcon ?? renderSwitcherIcon)?.({
          color: resolvedActiveColor,
          size: themeToken.fontSizeLG,
        }) ?? (
          <Icon name="RightOutlined" color={resolvedActiveColor} size={themeToken.fontSizeLG} />
        )}
      </View>
    ) : null
    const label = searchable
      ? (item as TreeSearchListData).labels?.map((part, index) => (
          <Text key={index} style={{ color: part.highlight ? resolvedActiveColor : undefined }}>
            {part.text}
          </Text>
        ))
      : item.label
    return (
      <TreeItem
        key={`${item.value}`}
        tier={item.tier ?? 0}
        indent={indent}
        switcherIcon={switcher}
        active={active}
        activeColor={resolvedActiveColor}
        multiple={multiple}
        label={item.label}
        renderLabel={
          searchable
            ? () => (
                <Text
                  numberOfLines={1}
                  style={{ flex: 1, marginHorizontal: token.labelMarginHorizontal }}
                >
                  {label}
                </Text>
              )
            : item.render
        }
        bold={item.bold}
        labelHighlight={
          !active &&
          hasChildren &&
          (item.children ?? []).some((child) => selected.includes(child.value))
        }
        hasChildren={hasChildren}
        switcherHighlight={item.switcherHighlight}
        disabled={!editable || item.disabled}
        onPress={() => change(item)}
        onPressSwitcherIcon={() =>
          setExpanded((current) =>
            current.includes(item.value)
              ? current.filter((v) => v !== item.value)
              : [...current, item.value],
          )
        }
      />
    )
  }
  return (
    <View
      style={{
        minHeight:
          minHeight === false ? undefined : typeof minHeight === 'number' ? minHeight : 200,
      }}
    >
      {search ? <Search placeholder={placeholder} onSearch={setKeyword} autoSearch /> : null}
      {search && keyword ? (
        searchRows.length ? (
          <FlatList
            data={searchRows}
            keyExtractor={(item) => `${item.value}`}
            renderItem={({ item }) => row({ ...item, tier: 0 }, true)}
          />
        ) : (
          <Empty full />
        )
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => `${item.value}`}
          renderItem={({ item }) => row(item)}
          ListEmptyComponent={<Empty />}
        />
      )}
    </View>
  )
}

export default memo(Tree)
