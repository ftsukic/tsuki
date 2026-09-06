import { Divider } from '../divider'
import { useControllableValue } from '../hooks'
import { TabBar, type TabItem } from '../tab-bar'
import type { TabPaneProps, TabsProps } from './interface'
import { Children, isValidElement, memo, useMemo } from 'react'

function Tabs({
  children,
  tabBarStyle,
  tabBarHeight,
  tabBarBackgroundColor,
  divider,
  dividerColor,
  activeKey,
  defaultActiveKey,
  onChange,
  ...props
}: TabsProps) {
  const panes = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((node) => ({
          node: node as React.ReactElement<TabPaneProps>,
          ...(node as React.ReactElement<TabPaneProps>).props,
          key: String((node as React.ReactElement).key),
        })),
    [children],
  )
  const options: TabItem<string>[] = panes.map((pane) => ({
    value: pane.key,
    label: pane.tab,
    badge: pane.badge,
  }))
  const [selected, setSelected] = useControllableValue<string>(
    activeKey === undefined
      ? { defaultValue: defaultActiveKey ?? options[0]?.value, onChange }
      : { value: activeKey, onChange },
  )
  return (
    <>
      {
        <TabBar
          {...props}
          style={tabBarStyle}
          height={tabBarHeight}
          backgroundColor={tabBarBackgroundColor}
          indicator
          value={selected}
          options={options}
          onChange={setSelected}
          divider={false}
          safeAreaInsetBottom={false}
          keyboardShowNotRender={false}
          hidden={false}
        />
      }
      {divider ? <Divider color={dividerColor} /> : null}
      {panes.map((pane) => (
        <ViewTab key={pane.key} active={pane.key === selected} lazyRender={pane.lazyRender}>
          {pane.node.props.children}
        </ViewTab>
      ))}
    </>
  )
}

function ViewTab({
  children,
  active,
  lazyRender = true,
}: {
  children?: React.ReactNode
  active: boolean
  lazyRender?: boolean
}) {
  const rendered = useMemo(() => !lazyRender || active, [active, lazyRender])
  return <>{active || rendered ? children : null}</>
}
export default memo(Tabs)
