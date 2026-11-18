import { cva } from 'class-variance-authority'

export const textVariants = cva('text-tsuki-foreground', {
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
