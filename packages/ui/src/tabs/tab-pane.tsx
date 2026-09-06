import type { TabPaneProps } from './interface'
import type { ReactElement } from 'react'
import { memo } from 'react'
function TabPane({ children }: TabPaneProps) {
  return children as ReactElement
}
export default memo(TabPane)
