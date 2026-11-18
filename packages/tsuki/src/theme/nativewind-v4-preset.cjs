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
        'tsuki-input': 'var(--tsuki-input-border-radius)',
      },
      height: {
        'tsuki-button': 'var(--tsuki-button-height)',
        'tsuki-input': 'var(--tsuki-input-height)',
      },
    },
  },
}
