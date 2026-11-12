import { Empty, Icon } from '@ftsukic/tsuki'

/**
 * @title 自定义 image
 * @description image 支持自定义 ReactNode，imageSize 可调整容器尺寸。
 */
export default function EmptyImageExample() {
  return <Empty image={<Icon name="FolderOpenOutlined" size={72} />} imageSize={128} />
}
