import React from 'react'

import { SnackPreview } from '../../components/SnackPreview'
import type { SnackAsset } from '../../types'
import { createSnackPayload, readSnackId } from '../../utils/snack'

export interface PreviewerProps {
  asset?: SnackAsset
  children?: React.ReactNode
  identifier?: string
}

export default function Previewer({ asset, children }: PreviewerProps): React.JSX.Element {
  const payload = asset ? createSnackPayload(asset) : null
  const snackId = readSnackId(asset)

  return (
    <section>
      <SnackPreview snackId={snackId} />
      {payload ? (
        <details style={{ marginTop: 12 }}>
          <summary>Snack source payload</summary>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </details>
      ) : null}
      {children}
    </section>
  )
}
