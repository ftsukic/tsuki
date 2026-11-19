/**
 * @title Custom
 * @description Renders and rotates an Ant Design-compatible SVG definition.
 */

import { Icon } from '@ftsukic/tsuki'
import type { IconDefinition } from '@ftsukic/tsuki'

const definition: IconDefinition = {
  name: 'diamond',
  theme: 'outlined',
  icon: {
    tag: 'svg',
    attrs: { viewBox: '0 0 24 24', fill: 'none' },
    children: [
      {
        tag: 'rect',
        attrs: {
          x: '5',
          y: '5',
          width: '14',
          height: '14',
          stroke: 'currentColor',
          'stroke-width': '2',
        },
      },
    ],
  },
}

export default function Custom() {
  return <Icon name={definition} rotation={45} />
}
