/**
 * @title Shapes
 * @description Compares default, round pill, and circular icon buttons across sizes and variants.
 */
import { Button, Icon } from '@ftsukic/tsuki'
import { View } from 'react-native'

export default function Shapes() {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Button shape="default">Default</Button>
        <Button shape="round">Round</Button>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Button
          shape="circle"
          size="small"
          accessibilityLabel="Small check"
          icon={<Icon name="CheckOutlined" color="white" size={14} />}
        />
        <Button
          shape="circle"
          size="medium"
          accessibilityLabel="Add"
          icon={<Icon name="PlusOutlined" color="white" size={18} />}
        />
        <Button
          shape="circle"
          size="large"
          variant="outlined"
          accessibilityLabel="Search"
          icon={<Icon name="SearchOutlined" size={20} />}
        />
        <Button shape="circle" loading accessibilityLabel="Loading" />
      </View>
    </View>
  )
}
