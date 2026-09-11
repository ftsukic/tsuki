import { Button, Icon, Search } from '../../..'

/**
 * @title Left and action
 * @description Combine a custom left region with an external Button action.
 */
export default function SearchLeftFixture() {
  return (
    <Search
      left={<Icon name="ArrowLeftOutlined" />}
      placeholder="请输入搜索关键词"
      action={
        <Button type="primary" size="small">
          搜索
        </Button>
      }
    />
  )
}
