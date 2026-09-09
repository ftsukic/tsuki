import { Icon, NoticeBar } from '../../..'

/**
 * @title Scrollable
 * @description Enable continuous scrolling for short content and configure speed and delay.
 */
export default function NoticeBarScrollableFixture() {
  return (
    <NoticeBar
      delay={0}
      leftIcon={<Icon name="NotificationOutlined" size={16} />}
      scrollable
      speed={80}
      text="scrollable 会让较短内容也沿水平方向循环播放。"
    />
  )
}
