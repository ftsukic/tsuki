import { Cell, Icon } from '../../..'

/**
 * @title Icon
 * @description A Cell with a leading icon.
 */
export default function CellIconFixture() {
  return <Cell icon={<Icon name="UserOutlined" size={16} />} title="账号" value="个人资料" />
}
