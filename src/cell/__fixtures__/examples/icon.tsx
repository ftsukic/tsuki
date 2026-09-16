import { Avatar, Cell, Icon } from '../../..'

/**
 * @title Icon
 * @description A Cell with a leading icon.
 */
export default function CellIconFixture() {
  return (
    <>
      <Cell divider icon={<Icon name="UserOutlined" size={16} />} title="账号" value="个人资料" />
      <Cell
        center
        icon={<Avatar size={30} />}
        title="账号"
        value="个人资料"
        styles={{ icon: { marginRight: 12 } }}
      />
    </>
  )
}
