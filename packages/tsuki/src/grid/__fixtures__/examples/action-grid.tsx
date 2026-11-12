import { Grid, Icon } from '../../..'

/**
 * @title Action Grid
 * @description Show a compact set of chat and content actions.
 */
export default function GridActionFixture() {
  return (
    <Grid columnNum={4} gutter={12} border center>
      <Grid.Item icon={<Icon name="MessageOutlined" size={24} color="#1989FA" />} text="聊天" />
      <Grid.Item icon={<Icon name="FileOutlined" size={24} color="#07C160" />} text="文件" />
      <Grid.Item icon={<Icon name="PictureOutlined" size={24} color="#FF976A" />} text="图片" />
      <Grid.Item icon={<Icon name="LinkOutlined" size={24} color="#7232DD" />} text="链接" />
    </Grid>
  )
}
