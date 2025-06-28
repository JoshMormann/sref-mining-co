/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MidJourney-inspired color palette with enhanced mining theme
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: '#FF6B35', // MidJourney primary orange
          50: '#FFF4F0',
          100: '#FFE9E0',
          200: '#FFD3C1',
          300: '#FFBDA2',
          400: '#FFA783',
          500: '#FF6B35', // Primary
          600: '#E5562A',
          700: '#CC4120',
          800: '#B22C15',
          900: '#99170A',
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: '#2A2A2A', // MidJourney sidebar grey
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#D4D4D4',
          300: '#A3A3A3',
          400: '#737373',
          500: '#2A2A2A', // Secondary
          600: '#262626',
          700: '#1F1F1F',
          800: '#1A1A1A',
          900: '#0A0A0A',
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: '#FFD700', // Gold accent for mining theme
          50: '#FFFDF0',
          100: '#FFFBE0',
          200: '#FFF7C2',
          300: '#FFF3A3',
          400: '#FFEF85',
          500: '#FFD700', // Accent
          600: '#E6C200',
          700: '#CCAC00',
          800: '#B39700',
          900: '#998200',
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: '#10B981', // Green
        warning: '#F59E0B', // Amber
        danger: '#EF4444',  // Red
        info: '#3B82F6',    // Blue
      },
      fontFamily: {
        // MidJourney uses a custom font, but we can use similar system fonts
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
