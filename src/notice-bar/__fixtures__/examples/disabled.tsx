import { Icon, NoticeBar } from '../../..'

/**
 * @title Disabled
 * @description Disable bar and close interactions while keeping the notice visible.
 */
export default function NoticeBarDisabledFixture() {
  return (
    <NoticeBar
      disabled
      leftIcon={<Icon name="LockOutlined" size={16} />}
      onClose={() => undefined}
      text="禁用状态不会响应点击或关闭。"
    />
  )
}
