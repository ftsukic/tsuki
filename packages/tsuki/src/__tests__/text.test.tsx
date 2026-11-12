import { ConfigProvider, darkAlgorithm, Text as UI_Text, getDesignToken } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

describe('Text', () => {
  it('uses the default theme without a provider and lets style override it', async () => {
    await render(
      <UI_Text testID="default-text" style={{ color: '#123456' }}>
        默认文本
      </UI_Text>,
    )

    const style = StyleSheet.flatten(screen.getByTestId('default-text').props.style)
    expect(style).toMatchObject({
      color: '#123456',
      fontSize: getDesignToken().fontSize,
      lineHeight: getDesignToken().lineHeight,
    })
  })

  it('resolves semantic colors, size and weight from the active theme', async () => {
    await render(
      <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
        <UI_Text testID="secondary-text" type="secondary" size="large" weight="600">
          暗色说明
        </UI_Text>
      </ConfigProvider>,
    )

    const style = StyleSheet.flatten(screen.getByTestId('secondary-text').props.style)
    const token = getDesignToken({ algorithm: darkAlgorithm })
    expect(style).toMatchObject({
      color: token.colorTextSecondary,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: '600',
    })
  })
})
