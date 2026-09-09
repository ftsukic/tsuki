import { ConfigProvider, NoticeBar } from '../../..'

/**
 * @title Theme
 * @description Override NoticeBar colors and spacing through ConfigProvider tokens.
 */
export default function NoticeBarThemeFixture() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorWarning: '#155EEF',
          colorWarningBg: '#EFF4FF',
          padding: 20,
        },
      }}
    >
      <NoticeBar text="NoticeBar 的语义颜色和间距来自当前主题 token。" />
    </ConfigProvider>
  )
}
