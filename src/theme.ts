// AWS Amplify UI theme (for Amplify UI components)
export const amplifyTheme = {
  name: 'wallet-theme',
  tokens: {
    colors: {
      font: {
        primary: 'black',
      },
      brand: {
        primary: {
          10: '#7c9eb2', // airSuperiorityBlue (lighter blue)
          80: '#52528c', // purple-ish
          100: '#372554', // dark violet
        },
      },
      border: {
        primary: '#7c9eb2',
      },
    },
    components: {
      button: {
        primary: {
          backgroundColor: '#52528c',
          color: '#ffffff',
          _hover: {
            backgroundColor: '#7c9eb2',
            color: '#ffffff',
          },
        },
      },
    },
  },
};

// Styled Components theme
export const styledTheme = {
  colors: {
    // Primary colors
    primary: '#52528c',
    primaryLight: '#7c9eb2',
    primaryDark: '#372554',

    // Surface colors
    surface: '#f8f9fa',
    white: '#ffffff',
    border: '#e0e0e0',

    // Text colors
    text: '#333333',
    textSecondary: '#666666',

    // Status colors
    error: '#dc3545',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',

    // Job status colors
    jobStatus: {
      applied: '#4285f4', // Blue
      response: '#ff9800', // Orange
      interviewing: '#9c27b0', // Purple
      rejected: '#f44336', // Red
      offer: '#4caf50', // Green
      accepted: '#2e7d32', // Dark Green
    },
  },

  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    xxl: '3rem', // 48px
  },

  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    round: '50%',
    pill: '9999px',
  },

  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },

  typography: {
    fontSizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      xxl: '1.5rem', // 24px
      xxxl: '2rem', // 32px
    },

    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
    },
  },

  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1200px',
  },
};

// Type definition for styled-components theme
export type StyledTheme = typeof styledTheme;

// Food Challenge theme - extends styledTheme with specific colors
export const foodChallengeTheme = {
  colors: {
    primary: '#e30500', // Red
    secondary: '#c15a09', // Orange
    background: '#f2d59a', // Cream
    white: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    error: '#dc3545',
    success: '#28a745',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
};

// For backwards compatibility, export the amplify theme as default
export const theme = amplifyTheme;
