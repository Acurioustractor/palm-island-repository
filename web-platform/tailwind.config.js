/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // PICC Logo-Derived Brand Colors
        'picc-red': {
          DEFAULT: '#8B1A1A',
          50: '#FDF2F2',
          100: '#F9E0E0',
          200: '#E8A0A0',
          300: '#D06060',
          400: '#A63D3D',
          500: '#8B1A1A',
          600: '#761616',
          700: '#611212',
          800: '#4C0E0E',
          900: '#370A0A',
        },
        'picc-ochre': {
          DEFAULT: '#C8922A',
          50: '#FDF8EE',
          100: '#F9EDCC',
          200: '#F0D88A',
          300: '#DAA84A',
          400: '#C8922A',
          500: '#B07E22',
          600: '#9A6F1E',
          700: '#7A5818',
          800: '#5A4112',
          900: '#3A2A0C',
        },
        'picc-earth': {
          DEFAULT: '#2D2319',
          50: '#F5F0EB',
          100: '#E0D5C8',
          200: '#C0A98A',
          300: '#8B7355',
          400: '#5A4A36',
          500: '#4A3C2E',
          600: '#3A2F24',
          700: '#2D2319',
          800: '#201810',
          900: '#130E0A',
        },
        'warm': {
          50: '#FDF8F0',
          100: '#F9EDDC',
          200: '#F0DCC0',
          300: '#E0C89E',
          400: '#C8A870',
          500: '#A88850',
          600: '#886838',
          700: '#685028',
          800: '#483818',
          900: '#282010',
        },
        'sage': {
          DEFAULT: '#5B7B5E',
          50: '#F0F5F0',
          100: '#DCE8DD',
          200: '#B8D0BA',
          300: '#8AB08D',
          400: '#6B926E',
          500: '#5B7B5E',
          600: '#4A6A4D',
          700: '#3A543D',
          800: '#2A3E2D',
          900: '#1A281D',
        },
        'picc-ocean': {
          DEFAULT: '#0B4F6C',
          50: '#EFF8FC',
          100: '#D0ECF6',
          200: '#A1D9ED',
          300: '#5FBDDD',
          400: '#2A95BE',
          500: '#0B4F6C',
          600: '#09435B',
          700: '#07374A',
          800: '#052B39',
          900: '#031F28',
        },
        'cream': '#F5E6D3',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: 0, transform: "translateX(-20px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: 0, transform: "translateX(20px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(30px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #2D2319 0%, #8B1A1A 50%, #C8922A 100%)',
        'success-gradient': 'linear-gradient(135deg, #5B7B5E 0%, #4A6A4D 100%)',
        'warm-gradient': 'linear-gradient(135deg, #C8922A 0%, #8B1A1A 100%)',
        'subtle-gradient': 'linear-gradient(135deg, #FDF8F0 0%, #F9EDDC 50%, #F5E6D3 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'hsl(var(--foreground))',
            '[class~="lead"]': {
              color: 'hsl(var(--muted-foreground))',
            },
            a: {
              color: '#8B1A1A',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'ol > li::marker': {
              fontWeight: '400',
              color: 'hsl(var(--muted-foreground))',
            },
            'ul > li::marker': {
              backgroundColor: 'hsl(var(--muted-foreground))',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
              borderTopWidth: 1,
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'hsl(var(--foreground))',
              borderLeftWidth: '0.25rem',
              borderLeftColor: '#C8922A',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            h1: {
              color: 'hsl(var(--foreground))',
              fontWeight: '800',
            },
            h2: {
              color: 'hsl(var(--foreground))',
              fontWeight: '700',
            },
            h3: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            h4: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            code: {
              color: 'hsl(var(--foreground))',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
}