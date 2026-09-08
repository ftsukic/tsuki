import { Cell, Grid, Icon, Surface } from '../../..'

/**
 * @title Surface Mixed
 * @description Compose a Cell collection and a mobile Grid in one visual surface.
 */
export default function SurfaceMixedFixture() {
  return (
    <Surface inset>
      <Cell.Group title="群组信息" extra="5 人">
        <Cell title="群管理员" value="林默" isLink />
        <Cell title="群公告" value="查看详情" isLink />
      </Cell.Group>
      <Grid columnNum={4} gutter={12} square border center>
        <Grid.Item icon={<Icon name="MessageOutlined" size={22} color="#1989FA" />} text="聊天" />
        <Grid.Item icon={<Icon name="FileOutlined" size={22} color="#07C160" />} text="文件" />
        <Grid.Item icon={<Icon name="PictureOutlined" size={22} color="#FF976A" />} text="图片" />
        <Grid.Item icon={<Icon name="LinkOutlined" size={22} color="#7232DD" />} text="链接" />
      </Grid>
    </Surface>
  )
}
