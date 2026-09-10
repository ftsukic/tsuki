import { ConfigProvider, Skeleton } from '@ftsukic/tsuki'

/**
 * @title Theme and motion
 * @description Override Skeleton tokens and disable motion through the global theme.
 */
export default function SkeletonThemeExample() {
  return (
    <ConfigProvider
      theme={{
        token: { motion: false },
        components: {
          Skeleton: {
            backgroundColor: '#d9e8ff',
            borderRadius: 4,
            rowGap: 8,
          },
        },
      }}
    >
      <Skeleton avatar title row={3} styles={{ root: { padding: 12 } }} />
    </ConfigProvider>
  )
}
