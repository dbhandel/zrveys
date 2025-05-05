export const theme = {
  colors: {
    primary: '#2B3990',    // Deep blue/purple
    secondary: '#FF3B9A',  // Bright pink
    accent: '#7CDEDC',     // Turquoise/cyan
    highlight: '#A7C7FF',  // Light blue
    white: '#FFFFFF',
    black: '#000000',
  },
} as const;

export type Theme = typeof theme;
