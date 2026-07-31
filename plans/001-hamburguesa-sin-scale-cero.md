# 001 — Quitar el `scale(0)` de la línea central de la hamburguesa

- **Status**: DONE (aplicado el 01/08/2026)
- **Commit**: 313c77f
- **Severity**: HIGH
- **Category**: Física y origen
- **Estimated scope**: 1 archivo, 1 línea

## Problem

La línea del medio del botón de menú se encoge hasta tamaño cero antes de
desaparecer. Nada en el mundo real se reduce a la nada: el ojo lee un salto,
no una salida. Además las tres líneas van a duraciones distintas (500 / 300 /
500 ms), así que la que se va no acompaña a las que rotan.

```tsx
// src/components/Navigation.tsx:90-96 — actual
<span
  className={cn(
    'w-full h-0.5 transition-all duration-300 ease-out-quad',
    isScrolled ? 'bg-exvia-black' : 'bg-white',
    isMenuOpen && 'scale-0 opacity-0'
  )}
/>
```

Las otras dos líneas, para contexto (no se tocan en este plan salvo la duración):

```tsx
// src/components/Navigation.tsx:83-89 y 97-103 — actual
'w-full h-0.5 transition-all duration-500 ease-out-quad origin-center'
```

## Target

La línea central se desvanece encogiéndose solo en el eje X y hasta el 90 %,
nunca hasta 0. Las tres líneas comparten duración para que el gesto sea uno.

```tsx
// target — línea central
<span
  className={cn(
    'w-full h-0.5 transition-[transform,opacity,background-color] duration-250 ease-out-quad',
    isScrolled ? 'bg-exvia-black' : 'bg-white',
    isMenuOpen && 'scale-x-90 opacity-0'
  )}
/>
```

Duración objetivo de las tres líneas: **250 ms** (presupuesto de un desplegable
según el catálogo: 150–250 ms; ahora mismo van a 500 ms, el doble del techo).

`duration-250` no existe en Tailwind por defecto. Usa `duration-[250ms]` o
añade `250: '250ms'` a `theme.extend.transitionDuration` en
`tailwind.config.js`. Prefiere el token en la config si vas a hacer también el
plan 004, que reutiliza la misma duración.

## Repo conventions to follow

- Las curvas viven como variables CSS en `src/index.css:78-83` y se consumen
  como clases Tailwind (`ease-out-quad`, `ease-out-quart`, `ease-out-cubic`,
  `ease-out-circ`). No inventes curvas nuevas en este plan.
- Las clases condicionales se componen con `cn()` de `src/lib/utils`, un
  argumento por bloque lógico. Imita el patrón exacto de
  `src/components/Navigation.tsx:83-89`.

## Steps

1. En `tailwind.config.js`, dentro de `theme.extend`, añade
   `transitionDuration: { 250: '250ms' }`. Si ya existe `transitionDuration`,
   añade solo la clave.
2. En `src/components/Navigation.tsx:94`, sustituye `'scale-0 opacity-0'` por
   `'scale-x-90 opacity-0'`.
3. En `src/components/Navigation.tsx:92`, cambia `duration-300` por
   `duration-250` y `transition-all` por
   `transition-[transform,opacity,background-color]`.
4. En `src/components/Navigation.tsx:85` y `:99`, cambia `duration-500` por
   `duration-250` y `transition-all` por
   `transition-[transform,opacity,background-color]`.

## Boundaries

- NO toques el overlay del menú (`src/components/Navigation.tsx:112-151`): es
  el plan 006, fuera de este lote.
- NO toques `src/components/Navigation.tsx:37` (la barra): va en el plan 004.
- NO cambies el marcado ni la lógica de `isMenuOpen`.
- NO añadas dependencias.
- Si el código no coincide con lo citado (deriva desde `313c77f`), PARA y
  repórtalo en vez de improvisar.

## Verification

- **Mecánica**: `npx tsc --noEmit` sin errores nuevos y `npm run build`
  termina en verde. Aviso: `npm run build` limpia `dist/` y se lleva
  `dist/LEEME-DESPLIEGUE.md`; restáuralo con
  `git restore --source=HEAD dist/LEEME-DESPLIEGUE.md`.
- **Feel check**: abre el dev server (`npm run dev`, puerto 5340), pulsa el
  botón de menú en la esquina superior derecha de la barra y confirma:
  - la línea central se atenúa estrechándose ligeramente; en ningún fotograma
    llega a un punto ni desaparece de golpe;
  - las tres líneas terminan a la vez, no una después de otra;
  - en DevTools → Animations, al 10 % de velocidad, el aspa queda formada en
    ~250 ms y la línea central se va acompañando a las otras dos.
- **Done when**: `grep -rn 'scale-0' src/components/Navigation.tsx` no
  devuelve nada y las tres líneas comparten `duration-250`.
