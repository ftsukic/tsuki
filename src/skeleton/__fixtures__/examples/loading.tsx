import { useState } from 'react'
import { Button, Skeleton } from '@ftsukic/tsuki'

/**
 * @title Loading state
 * @description Toggle between placeholders and the loaded content.
 */
export default function SkeletonLoadingExample() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <Skeleton loading={loading} title row={2}>
        <Button onPress={() => setLoading(true)}>已加载内容</Button>
      </Skeleton>
      <Button onPress={() => setLoading((value) => !value)}>
        {loading ? '显示内容' : '显示骨架'}
      </Button>
    </>
  )
}
