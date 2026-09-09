import { Button, Search } from '../../..'

/**
 * @title Suffix
 * @description Add a custom action to the trailing Search layout region.
 */
export default function SearchSuffixFixture() {
  return <Search suffix={<Button size="small">搜索</Button>} placeholder="搜索内容" />
}
