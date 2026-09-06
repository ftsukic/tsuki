import {
  ActionSheet,
  Button,
  Cell,
  Checkbox,
  Flex,
  Form,
  Notify,
  Popup,
  Provider,
  Tabs,
  TextInput,
  Toast,
  TreeMultipleMode,
  mountPortal,
} from '../src'
import { cleanup, render, screen } from '@testing-library/react-native'
import { act } from 'react'
import { Text, View } from 'react-native'

afterEach(cleanup)

describe('altron UI migration surface', () => {
  it('exports the migrated components and compound APIs', () => {
    expect(Button).toBeDefined()
    expect(Cell.Group).toBeDefined()
    expect(Flex.Item).toBeDefined()
    expect(Form.Item).toBeDefined()
    expect(Popup.Header).toBeDefined()
    expect(Tabs.TabPane).toBeDefined()
    expect(TextInput.Number).toBeDefined()
    expect(TextInput.Password).toBeDefined()
    expect(ActionSheet.show).toBeDefined()
    expect(Notify.show).toBeDefined()
    expect(Toast.show).toBeDefined()
    expect(Provider).toBeDefined()
    expect(TreeMultipleMode).toBeDefined()
  })

  it('renders migrated inputs through the unified provider', async () => {
    await render(
      <Provider>
        <View>
          <Button text="保存" />
          <TextInput placeholder="请输入" />
          <Checkbox label="同意" />
        </View>
      </Provider>,
    )

    expect(screen.getByText('保存')).toBeTruthy()
    expect(screen.getByPlaceholderText('请输入')).toBeTruthy()
    expect(screen.getByText('同意')).toBeTruthy()
  })

  it('mounts and updates imperative portal entries', async () => {
    await render(
      <Provider>
        <Text>host</Text>
      </Provider>,
    )

    let key = -1
    await act(async () => {
      key = mountPortal(<Text>portal-one</Text>)
    })
    expect(screen.getByText('portal-one')).toBeTruthy()
    expect(key).toBeGreaterThanOrEqual(0)
  })
})
