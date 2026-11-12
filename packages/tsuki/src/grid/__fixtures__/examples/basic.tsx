import { StyleSheet, Text, View } from 'react-native'
import { Grid, Icon } from '../../..'

/**
 * @title Basic Grid
 * @description Use a four-column mobile grid with icons and text.
 */
export default function GridBasicFixture() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>常用操作</Text>
      <Grid columnNum={4} gutter={12} square border center>
        <Grid.Item icon={<Icon name="UserOutlined" size={24} color="#1989FA" />} text="账号" />
        <Grid.Item icon={<Icon name="SettingOutlined" size={24} color="#07C160" />} text="设置" />
        <Grid.Item icon={<Icon name="HeartOutlined" size={24} color="#E91E63" />} text="收藏" />
        <Grid.Item icon={<Icon name="MoreOutlined" size={24} color="#667085" />} text="更多" />
      </Grid>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heading: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
})
