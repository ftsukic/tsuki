import { Cell, ConfigProvider } from '../../..'

/**
 * @title Theme
 * @description Customize Cell and CellGroup semantic tokens through ConfigProvider.
 */
export default function CellThemeFixture() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Cell: {
            groupTitleFontSize: 15,
            insetRadius: 10,
            largePaddingVertical: 14,
          },
        },
      }}
    >
      <Cell.Group title="主题分组" inset>
        <Cell size="large" title="昵称" value="Altron" />
      </Cell.Group>
    </ConfigProvider>
  )
}
