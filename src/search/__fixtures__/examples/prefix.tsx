import { Icon, Search } from '../../..'

/**
 * @title Prefix
 * @description Replace the default leading search icon with a custom prefix.
 */
export default function SearchPrefixFixture() {
  return <Search prefix={<Icon name="UserOutlined" />} placeholder="搜索联系人" />
}
