import { ConfigProvider, Field, Input } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

describe('Field', () => {
  it('renders label, required marker, colon, description and error message', async () => {
    await render(
      <Field label="手机号" required colon description="用于接收验证码" errorMessage="请输入手机号">
        <Input testID="field-input" />
      </Field>,
    )

    expect(screen.getByText('手机号:')).toBeTruthy()
    expect(screen.getByText('*')).toBeTruthy()
    expect(screen.getByText('用于接收验证码')).toBeTruthy()
    expect(screen.getByText('请输入手机号')).toBeTruthy()
    expect(screen.getByTestId('field-input')).toBeTruthy()
  })

  it('uses warning status and supports label width and alignment', async () => {
    await render(
      <Field label="备注" status="warning" labelWidth={96} labelAlign="right">
        <Input testID="warning-input" />
      </Field>,
    )

    const label = screen.getByText('备注')
    expect(StyleSheet.flatten(label.props.style)).toEqual(
      expect.objectContaining({ flex: 1, textAlign: 'right' }),
    )
  })

  it('applies Field token overrides to status text and root height', async () => {
    await render(
      <ConfigProvider
        theme={{
          components: {
            Field: { errorColor: '#123456', height: 56 },
          },
        }}
      >
        <Field label="邮箱" errorMessage="邮箱格式错误">
          <Input />
        </Field>
      </ConfigProvider>,
    )

    expect(StyleSheet.flatten(screen.getByText('邮箱').props.style)).toEqual(
      expect.objectContaining({ color: '#123456' }),
    )
    expect(StyleSheet.flatten(screen.getByText('邮箱格式错误').props.style)).toEqual(
      expect.objectContaining({ color: '#123456' }),
    )
  })
})
