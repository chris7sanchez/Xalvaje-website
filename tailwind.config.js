/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        exvia: {
          black: '#131313',
          white: '#FFFFFF',
          'base-black': '#1D1D1D',
          subtle: '#EAEAEA',
          border: '#EFEFF2',
          blue: '#0082F3',
          focus: '#4D65FF',
          /* Color de marca XALVAJE, muestreado de la X del logo */
          red: '#B8442A',
          'red-dark': '#8F3320',
          'red-light': '#C04D32',
          /* Rojo de marca aclarado para TEXTO PEQUEÑO sobre fondo oscuro.
             Cumple WCAG AA (4,5:1) en los DOS fondos que usa la web:
               · sobre negro (#000, secciones About y Services): 5,59:1
               · sobre neutral-900 (#171717, Portfolio/Photography/Stills): 4,69:1
             Para comparar, el rojo de marca #B8442A da 3,9:1 y 3,33:1 — ambos
             insuficientes. Usar solo en texto: las líneas y adornos siguen con
             `red`, que como elemento gráfico se conforma con 3:1. */
          'red-text': '#DA5C40',
        },
      },
      fontFamily: {
        geist: ['Geist', 'Arial', 'sans-serif'],
        'geist-mono': ['GeistMono', 'Courier New', 'monospace'],
        /* Titulares tipo cartel de cine: hero, encabezados de sección,
           títulos de tarjeta, banners. No usar en cuerpo de texto. */
        display: ['Anton', 'Arial Narrow', 'sans-serif'],
        /* Voz de marca: frase del hero. Serif de alto contraste en peso ligero,
           elegante y sin gritar. No usar para encabezados de sección. */
        'display-serif': ['Cormorant Garamond', 'Georgia', 'serif'],
        /* Logotipo: geométrica de trazo fino, la que acompaña a la X en el
           logo original. Jost es la versión libre de Futura. Solo para el
           logotipo, no para interfaz. */
        logo: ['Jost', 'Century Gothic', 'Futura', 'sans-serif'],
        /* Titular de la portada */
        roustel: ['Roustel', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      fontSize: {
        'h1': ['clamp(3rem, 21vw, 21vw)', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'h2': ['4rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'h3': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.04em' }],
        'h4': ['2.5rem', { lineHeight: '1.1' }],
        'h5': ['1.5rem', { lineHeight: '1.2' }],
        'h6': ['1.25rem', { lineHeight: '1.3' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'xs': ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(15%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { transform: "scale(1.2) translate3d(42vw, 30vh, 0)" },
          to: { transform: "scale(1) translate3d(0, 0, 0)" },
        },
        "hero-reveal": {
          "0%": { 
            opacity: "0",
            transform: "scale(1.1)",
          },
          "100%": { 
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "text-slide-out": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-150%)" },
        },
        "text-slide-in": {
          from: { transform: "translateY(150%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-in": "fade-in 0.8s cubic-bezier(0.165, 0.840, 0.440, 1) forwards",
        "fade-up": "fade-up 0.8s cubic-bezier(0.165, 0.840, 0.440, 1) forwards",
        "slide-up": "slide-up 0.8s cubic-bezier(0.165, 0.840, 0.440, 1) forwards",
        "scale-in": "scale-in 1.8s cubic-bezier(0.215, 0.610, 0.355, 1) forwards",
        "hero-reveal": "hero-reveal 1.8s cubic-bezier(0.215, 0.610, 0.355, 1) forwards",
        "text-slide-out": "text-slide-out 0.35s cubic-bezier(0.250, 0.460, 0.450, 0.940) forwards",
        "text-slide-in": "text-slide-in 0.35s cubic-bezier(0.250, 0.460, 0.450, 0.940) forwards",
        "slide-in-right": "slide-in-right 0.5s cubic-bezier(0.215, 0.610, 0.355, 1) forwards",
        "spin-slow": "spin-slow 20s linear infinite",
      },
      transitionTimingFunction: {
        'out-quad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        'out-cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1)',
        'out-quart': 'cubic-bezier(0.165, 0.840, 0.440, 1)',
        'out-circ': 'cubic-bezier(0.075, 0.820, 0.165, 1)',
        'in-out-quad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
