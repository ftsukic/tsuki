import React, { useEffect } from 'react';

import type { SnackPreviewProps } from '../../types';
import { ensureSnackEmbedScript } from '../../utils/loadSnackEmbed';

export function SnackPreview({
  snackId,
  platform = 'ios',
  height = 560,
  theme = 'light',
}: SnackPreviewProps): React.JSX.Element {
  useEffect(() => {
    if (snackId) {
      ensureSnackEmbedScript();
    }
  }, [snackId]);

  if (!snackId) {
    return (
      <div role="status" style={{ padding: 16, border: '1px dashed #cbd5e1', borderRadius: 8 }}>
        Snack demo is not configured yet. Add a saved Snack ID to enable the preview.
      </div>
    );
  }

  return (
    <div
      data-snack-id={snackId}
      data-snack-platform={platform}
      data-snack-preview="true"
      data-snack-theme={theme}
      data-snack-loading="lazy"
      style={{ width: '100%', height, overflow: 'hidden', borderRadius: 8 }}
    />
  );
}
