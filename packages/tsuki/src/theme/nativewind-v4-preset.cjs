module.exports = {
  theme: {
    extend: {
      colors: {
        tsuki: {
          primary: 'var(--tsuki-color-primary)',
          'primary-foreground': 'var(--tsuki-color-primary-foreground)',
          success: 'var(--tsuki-color-success)',
          warning: 'var(--tsuki-color-warning)',
          danger: 'var(--tsuki-color-danger)',
          foreground: 'var(--tsuki-color-foreground)',
          muted: 'var(--tsuki-color-muted)',
          background: 'var(--tsuki-color-background)',
          surface: 'var(--tsuki-color-surface)',
          border: 'var(--tsuki-color-border)',
        },
      },
      borderRadius: {
        'tsuki-button': 'var(--tsuki-button-border-radius)',
        'tsuki-card': 'var(--tsuki-card-border-radius)',
        'tsuki-input': 'var(--tsuki-input-border-radius)',
        'tsuki-surface': 'var(--tsuki-surface-border-radius)',
      },
      height: {
        'tsuki-button': 'var(--tsuki-button-height)',
        'tsuki-input': 'var(--tsuki-input-height)',
      },
      spacing: {
        'tsuki-card': 'var(--tsuki-card-padding)',
        'tsuki-card-header': 'var(--tsuki-card-header-padding)',
        'tsuki-card-body': 'var(--tsuki-card-body-padding)',
        'tsuki-card-footer': 'var(--tsuki-card-footer-padding)',
        'tsuki-card-gap': 'var(--tsuki-card-gap)',
        'tsuki-divider': 'var(--tsuki-divider-thickness)',
        'tsuki-surface': 'var(--tsuki-surface-padding)',
      },
      borderWidth: {
        'tsuki-surface-width': 'var(--tsuki-surface-border-width)',
      },
    },
  },
}
