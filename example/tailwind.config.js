/** @type {import('tailwindcss').Config} */
const variable = (name) => `var(--app-${name})`
// eslint-disable-next-line @typescript-eslint/no-require-imports
const plugin = require('tailwindcss/plugin')

const typographyRoleClassNames = {
  display: 'display',
  pageTitle: 'page-title',
  sectionTitle: 'section-title',
  body: 'body',
  bodySmall: 'body-small',
  label: 'label',
  caption: 'caption',
}

const typographyUtilities = Object.fromEntries(
  Object.values(typographyRoleClassNames).map((className) => {
    const variablePrefix = `type-role-${className}`
    return [
      `.type-${className}`,
      {
        fontFamily: variable(`${variablePrefix}-font-family`),
        fontSize: variable(`${variablePrefix}-font-size`),
        fontWeight: variable(`${variablePrefix}-font-weight`),
        lineHeight: variable(`${variablePrefix}-line-height`),
        letterSpacing: variable(`${variablePrefix}-letter-spacing`),
      },
    ]
  }),
)

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './theme/**/*.{js,jsx,ts,tsx}',
    '../src/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: Object.values(typographyRoleClassNames).map((className) => `type-${className}`),
  presets: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('nativewind/preset'),
  ],
  theme: {
    extend: {
      colors: {
        app: {
          brand: {
            primary: variable('color-brand-primary'),
            'on-primary': variable('color-brand-on-primary'),
            'primary-container': variable('color-brand-primary-container'),
            'on-primary-container': variable('color-brand-on-primary-container'),
          },
          surface: {
            canvas: variable('color-surface-canvas'),
            page: variable('color-surface-page'),
            container: variable('color-surface-container'),
            elevated: variable('color-surface-elevated'),
            sunken: variable('color-surface-sunken'),
            overlay: variable('color-surface-overlay'),
          },
          text: {
            primary: variable('color-text-primary'),
            secondary: variable('color-text-secondary'),
            tertiary: variable('color-text-tertiary'),
            disabled: variable('color-text-disabled'),
            inverse: variable('color-text-inverse'),
            link: variable('color-text-link'),
          },
          icon: {
            primary: variable('color-icon-primary'),
            secondary: variable('color-icon-secondary'),
            tertiary: variable('color-icon-tertiary'),
            disabled: variable('color-icon-disabled'),
          },
          border: {
            subtle: variable('color-border-subtle'),
            default: variable('color-border-default'),
            strong: variable('color-border-strong'),
            focus: variable('color-border-focus'),
          },
          status: {
            success: {
              foreground: variable('color-status-success-foreground'),
              background: variable('color-status-success-background'),
              border: variable('color-status-success-border'),
            },
            warning: {
              foreground: variable('color-status-warning-foreground'),
              background: variable('color-status-warning-background'),
              border: variable('color-status-warning-border'),
            },
            danger: {
              foreground: variable('color-status-danger-foreground'),
              background: variable('color-status-danger-background'),
              border: variable('color-status-danger-border'),
            },
            info: {
              foreground: variable('color-status-info-foreground'),
              background: variable('color-status-info-background'),
              border: variable('color-status-info-border'),
            },
          },
          state: {
            pressed: variable('color-state-pressed'),
            selected: {
              foreground: variable('color-state-selected-foreground'),
              background: variable('color-state-selected-background'),
              border: variable('color-state-selected-border'),
            },
          },
        },
      },
      spacing: {
        ...Object.fromEntries(
          [0, 1, 2, 3, 4, 5, 6, 8, 10, 12].map((key) => [
            `app-${key}`,
            variable(`spacing-scale-${key}`),
          ]),
        ),
        'app-page-horizontal': variable('spacing-layout-page-horizontal'),
        'app-page-vertical': variable('spacing-layout-page-vertical'),
        'app-section': variable('spacing-layout-section'),
        'app-card': variable('spacing-layout-card'),
        'app-item': variable('spacing-layout-item'),
        'app-inline': variable('spacing-layout-inline'),
      },
      borderRadius: {
        'app-none': variable('shape-radius-scale-none'),
        'app-xs': variable('shape-radius-scale-xs'),
        'app-sm': variable('shape-radius-scale-sm'),
        'app-md': variable('shape-radius-scale-md'),
        'app-lg': variable('shape-radius-scale-lg'),
        'app-xl': variable('shape-radius-scale-xl'),
        'app-2xl': variable('shape-radius-scale-2xl'),
        'app-full': variable('shape-radius-scale-full'),
        'app-control': variable('shape-radius-control'),
        'app-card': variable('shape-radius-card'),
        'app-sheet': variable('shape-radius-sheet'),
        'app-popover': variable('shape-radius-popover'),
        'app-pill': variable('shape-radius-pill'),
      },
      borderWidth: {
        'app-hairline': variable('shape-border-width-hairline'),
        'app-default': variable('shape-border-width-default'),
        'app-strong': variable('shape-border-width-strong'),
      },
      fontSize: {
        'app-xs': variable('type-size-xs'),
        'app-sm': variable('type-size-sm'),
        'app-md': variable('type-size-md'),
        'app-lg': variable('type-size-lg'),
        'app-xl': variable('type-size-xl'),
        'app-2xl': variable('type-size-2xl'),
        'app-3xl': variable('type-size-3xl'),
        'app-4xl': variable('type-size-4xl'),
      },
      fontFamily: {
        'app-base': [variable('type-family-base')],
        'app-heading': [variable('type-family-heading')],
        'app-mono': [variable('type-family-mono')],
      },
      fontWeight: {
        'app-regular': variable('type-weight-regular'),
        'app-medium': variable('type-weight-medium'),
        'app-semibold': variable('type-weight-semibold'),
        'app-bold': variable('type-weight-bold'),
      },
      letterSpacing: {
        'app-tight': variable('type-letter-spacing-tight'),
        'app-compact': variable('type-letter-spacing-compact'),
        'app-subtle': variable('type-letter-spacing-subtle'),
        'app-normal': variable('type-letter-spacing-normal'),
        'app-wide': variable('type-letter-spacing-wide'),
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities(typographyUtilities)
    }),
  ],
}
