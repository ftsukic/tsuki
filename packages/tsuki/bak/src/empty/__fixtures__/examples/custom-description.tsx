import { Empty, Text } from '@ftsukic/tsuki'

/**
 * @title 自定义 description
 * @description description 支持自定义 ReactNode。
 */
export default function EmptyDescriptionExample() {
  return <Empty description={<Text type="secondary">还没有创建任何项目</Text>} />
}
