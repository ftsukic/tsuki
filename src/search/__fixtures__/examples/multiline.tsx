import { Search } from '../../..'

/**
 * @title Multiline
 * @description Let a multiline Search grow with IM text input.
 */
export default function SearchMultilineFixture() {
  return <Search multiline placeholder="输入消息" returnKeyType="default" />
}
