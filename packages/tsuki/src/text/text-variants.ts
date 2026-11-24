import { cva } from 'class-variance-authority'

export const TEXT_BASE_CLASS = 'text-tsuki-foreground'

export const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-base',
      'body-sm': 'text-sm',
      label: 'text-sm font-medium',
      caption: 'text-xs text-tsuki-muted',
      title: 'text-xl font-semibold',
      heading: 'text-2xl font-bold',
    },
  },
  defaultVariants: { variant: 'body' },
})
