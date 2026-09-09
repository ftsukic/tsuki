import { Icon, NoticeBar } from '../../..'

/**
 * @title Basic
 * @description 展示基础通知和左侧自定义图标。
 */
export default function NoticeBarExample() {
  return (
    <NoticeBar
      leftIcon={<Icon name="SoundOutlined" size={16} color="#d46b08" />}
      text="系统将在今晚 22:00 进行维护，请提前保存当前内容。"
    />
  )
}
