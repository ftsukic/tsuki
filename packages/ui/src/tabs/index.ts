export * from './interface'
import TabsBase from './tabs'
import TabPane from './tab-pane'

export const Tabs = Object.assign(TabsBase, { TabPane })
export { TabPane }
