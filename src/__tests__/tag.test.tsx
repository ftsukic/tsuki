import { fireEvent, render, screen } from '@testing-library/react-native'
import { ConfigProvider, getDesignToken, Tag } from '..'
import { StyleSheet } from 'react-native'

function styleOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style)
}

describe('Tag', () => {
  it('maps types to semantic colors and keeps the default neutral', async () => {
    const token = getDesignToken()
    await render(
      <ConfigProvider>
        <Tag testID="default">默认</Tag>
        <Tag testID="primary" type="primary">
          主要
        </Tag>
        <Tag testID="success" type="success">
          成功
        </Tag>
        <Tag testID="warning" type="warning">
          警告
        </Tag>
        <Tag testID="danger" type="danger">
          危险
        </Tag>
      </ConfigProvider>,
    )

    expect(styleOf('default')).toMatchObject({
      backgroundColor: token.colorFillSecondary,
      borderWidth: 0,
    })
    expect(styleOf('primary').backgroundColor).toBe(token.colorPrimary)
    expect(styleOf('success').backgroundColor).toBe(token.colorSuccess)
    expect(styleOf('warning').backgroundColor).toBe(token.colorWarning)
    expect(styleOf('danger').backgroundColor).toBe(token.colorError)
    expect(StyleSheet.flatten(screen.getByText('默认').props.style)).toMatchObject({
      color: token.colorText,
    })
  })

  it('uses the requested heights and horizontal padding for every size', async () => {
    await render(
      <ConfigProvider>
        <Tag testID="small" size="small">
          小
        </Tag>
        <Tag testID="medium" size="medium">
          中
        </Tag>
        <Tag testID="large" size="large">
          大
        </Tag>
      </ConfigProvider>,
    )

    expect(styleOf('small')).toMatchObject({ height: 22 })
    expect(styleOf('medium')).toMatchObject({ height: 28 })
    expect(styleOf('large')).toMatchObject({ height: 34 })
    expect(StyleSheet.flatten(screen.getByText('小').props.style)).toMatchObject({ fontSize: 12 })
    expect(StyleSheet.flatten(screen.getByText('中').props.style)).toMatchObject({ fontSize: 14 })
    expect(StyleSheet.flatten(screen.getByText('大').props.style)).toMatchObject({ fontSize: 16 })
    expect(StyleSheet.flatten(screen.getByText('小').parent?.props.style).paddingHorizontal).toBe(8)
    expect(StyleSheet.flatten(screen.getByText('中').parent?.props.style).paddingHorizontal).toBe(
      10,
    )
    expect(StyleSheet.flatten(screen.getByText('大').parent?.props.style).paddingHorizontal).toBe(
      12,
    )
  })

  it('supports round and mark shapes', async () => {
    const token = getDesignToken()
    await render(
      <ConfigProvider>
        <Tag testID="round" round>
          圆
        </Tag>
        <Tag testID="mark" mark>
          标记
        </Tag>
      </ConfigProvider>,
    )

    expect(styleOf('round').borderRadius).toBe(999)
    expect(styleOf('mark')).toMatchObject({
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: token.borderRadiusSM,
      borderBottomRightRadius: token.borderRadiusSM,
    })
  })

  it('renders plain tags with transparent backgrounds and semantic borders', async () => {
    const token = getDesignToken()
    await render(
      <ConfigProvider>
        <Tag testID="plain" type="primary" plain>
          空心
        </Tag>
        <Tag testID="custom-plain" color="#7232dd" plain>
          自定义
        </Tag>
      </ConfigProvider>,
    )

    expect(styleOf('plain')).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: token.colorPrimary,
      borderWidth: token.lineWidth,
    })
    expect(styleOf('custom-plain')).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: '#7232dd',
    })
    expect(StyleSheet.flatten(screen.getByText('空心').props.style)).toMatchObject({
      color: token.colorPrimary,
    })
  })

  it('supports custom colors, automatic contrast, and textColor overrides', async () => {
    const token = getDesignToken()
    await render(
      <ConfigProvider>
        <Tag testID="dark" color="#7232dd">
          深色
        </Tag>
        <Tag testID="light" color="#ffe1e1">
          浅色
        </Tag>
        <Tag color="#ffe1e1" textColor="#ad0000">
          覆盖
        </Tag>
      </ConfigProvider>,
    )

    expect(styleOf('dark').backgroundColor).toBe('#7232dd')
    expect(styleOf('light').backgroundColor).toBe('#ffe1e1')
    expect(StyleSheet.flatten(screen.getByText('深色').props.style)).toMatchObject({
      color: token.colorTextLightSolid,
    })
    expect(StyleSheet.flatten(screen.getByText('浅色').props.style)).toMatchObject({
      color: token.colorText,
    })
    expect(StyleSheet.flatten(screen.getByText('覆盖').props.style)).toMatchObject({
      color: '#ad0000',
    })
  })

  it('notifies on close without hiding the tag and does not expose a root press handler', async () => {
    const onClose = jest.fn()
    await render(
      <ConfigProvider>
        <Tag testID="closeable" closeable onClose={onClose}>
          可关闭
        </Tag>
      </ConfigProvider>,
    )

    expect(screen.getByTestId('closeable').props.onPress).toBeUndefined()
    fireEvent.press(screen.getByLabelText('关闭标签'))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('closeable')).toBeTruthy()
  })

  it('disables the close action without changing the public close contract', async () => {
    const onClose = jest.fn()
    await render(
      <ConfigProvider>
        <Tag closeable disabled onClose={onClose}>
          禁用
        </Tag>
      </ConfigProvider>,
    )

    const closeButton = screen.getByLabelText('关闭标签')
    expect(closeButton.props.accessibilityState).toMatchObject({ disabled: true })
    fireEvent.press(closeButton)
    expect(onClose).not.toHaveBeenCalled()
  })
})
