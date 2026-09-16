import { useState } from 'react'
import { View } from 'react-native'
import { Cell, Text, Avatar, Icon, showPicker } from '../../..'

/**
 * @title Link
 * @description An isLink Cell with default clickable active feedback.
 */
export default function CellLinkFixture() {
  const [message, setMessage] = useState('点击 Cell')

  return (
    <View>
      <Cell.Group border={false}>
        <Cell
          size="large"
          title="账号"
          value="查看详情"
          isLink
          onPress={() => setMessage('已打开账号详情')}
        />
        <Cell
          styles={{ title: { alignSelf: 'center' } }}
          center
          title="参会人"
          titleExtra={
            <Avatar.Group shape="square" size={30}>
              <Avatar style={{ backgroundColor: '#1989FA' }}>A</Avatar>
              <Avatar style={{ backgroundColor: '#07C160' }}>B</Avatar>
              <Avatar style={{ backgroundColor: '#FF976A' }}>C</Avatar>
              <Avatar
                style={{
                  backgroundColor: '#fff',
                  borderStyle: 'dashed',
                  borderColor: 'rgba(0,0,0,0.2)',
                }}
              >
                <Icon name="PlusOutlined" />
              </Avatar>
            </Avatar.Group>
          }
          value="3人"
          isLink
          onPress={() => showPicker({ title: 'test', columns: [] })}
        />
        <Cell
          size="large"
          title="账号"
          value="查看详情"
          isLink
          onPress={() => setMessage('已打开账号详情')}
        />
      </Cell.Group>

      <Text>{message}</Text>
    </View>
  )
}
