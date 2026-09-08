import { Avatar, Grid, Icon } from '../../..'

/**
 * @title Member Grid
 * @description Show members and common add or remove actions in a mobile grid.
 */
export default function GridMemberFixture() {
  return (
    <Grid columnNum={4} gutter={12} square border center>
      <Grid.Item icon={<Avatar size={34}>林</Avatar>} text="林默" />
      <Grid.Item
        icon={
          <Avatar size={34} style={{ backgroundColor: '#07C160' }}>
            周
          </Avatar>
        }
        text="周宁"
      />
      <Grid.Item
        icon={
          <Avatar size={34} style={{ backgroundColor: '#7232DD' }}>
            陈
          </Avatar>
        }
        text="陈墨"
      />
      <Grid.Item icon={<Icon name="PlusOutlined" size={28} color="#1989FA" />} text="添加成员" />
      <Grid.Item
        icon={
          <Avatar size={34} style={{ backgroundColor: '#FF976A' }}>
            王
          </Avatar>
        }
        text="王安"
      />
      <Grid.Item icon={<Icon name="DeleteOutlined" size={26} color="#EE0A24" />} text="移除成员" />
    </Grid>
  )
}
