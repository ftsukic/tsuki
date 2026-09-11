import { Button, Search } from '../../..'

/**
 * @title Button action
 * @description Use a primary Button as the external Search action.
 */
export default function SearchButtonActionFixture() {
  return (
    <Search
      placeholder="请输入搜索关键词"
      action={
        <Button type="primary" size="small">
          搜索
        </Button>
      }
    />
  )
}
