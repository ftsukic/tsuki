import { Icon, NoticeBar } from '../../..'

/**
 * @title Wrapable
 * @description Disable scrolling and allow a long notice to wrap onto multiple lines.
 */
export default function NoticeBarWrapableFixture() {
  return (
    <NoticeBar
      leftIcon={<Icon name="InfoCircleOutlined" size={16} />}
      scrollable={false}
      text="wrapable 会在关闭滚动时将较长通知拆成多行显示，适合需要完整阅读的提示内容。"
      wrapable
    />
  )
}
