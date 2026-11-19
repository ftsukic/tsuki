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
        'tsuki-cell-group-radius': 'var(--tsuki-cell-group-radius)',
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
        'tsuki-cell-padding-horizontal': 'var(--tsuki-cell-padding-horizontal)',
        'tsuki-cell-padding-vertical': 'var(--tsuki-cell-padding-vertical)',
        'tsuki-cell-large-padding-vertical': 'var(--tsuki-cell-large-padding-vertical)',
        'tsuki-cell-min-height': 'var(--tsuki-cell-min-height)',
        'tsuki-cell-large-min-height': 'var(--tsuki-cell-large-min-height)',
        'tsuki-cell-icon-size': 'var(--tsuki-cell-icon-size)',
        'tsuki-cell-gap': 'var(--tsuki-cell-gap)',
        'tsuki-cell-vertical-gap': 'var(--tsuki-cell-vertical-gap)',
        'tsuki-cell-title-extra-gap': 'var(--tsuki-cell-title-extra-gap)',
        'tsuki-cell-value-extra-gap': 'var(--tsuki-cell-value-extra-gap)',
        'tsuki-cell-divider-width': 'var(--tsuki-cell-divider-width)',
        'tsuki-cell-group-title-padding-horizontal':
          'var(--tsuki-cell-group-title-padding-horizontal)',
        'tsuki-cell-group-title-padding-vertical': 'var(--tsuki-cell-group-title-padding-vertical)',
        'tsuki-cell-group-inset-margin-horizontal':
          'var(--tsuki-cell-group-inset-margin-horizontal)',
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
      fontSize: {
        'tsuki-cell-font-size': 'var(--tsuki-cell-font-size)',
        'tsuki-cell-large-font-size': 'var(--tsuki-cell-large-font-size)',
        'tsuki-cell-description-font-size': 'var(--tsuki-cell-description-font-size)',
      },
      lineHeight: {
        'tsuki-cell-slot': 'var(--tsuki-cell-line-height-value)',
        'tsuki-cell-line-height': 'var(--tsuki-cell-line-height)',
        'tsuki-cell-description-line-height': 'var(--tsuki-cell-description-line-height)',
      },
      opacity: {
        'tsuki-cell-disabled-opacity': 'var(--tsuki-cell-disabled-opacity)',
      },
    },
  },
}
