import { ConfigProvider, Empty } from '@ftsukic/tsuki'

/**
 * @title Empty 主题
 * @description 通过 Empty component token 调整图片尺寸、描述文字和底部间距。
 */
export default function EmptyThemeExample() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Empty: {
            empty_image_size: 128,
            empty_description_margin_top: 12,
            empty_description_padding_horizontal: 40,
            empty_description_color: '#646566',
            empty_description_font_size: 13,
            empty_footer_margin_top: 20,
          },
        },
      }}
    >
      <Empty description="暂无结果" />
    </ConfigProvider>
  )
}
