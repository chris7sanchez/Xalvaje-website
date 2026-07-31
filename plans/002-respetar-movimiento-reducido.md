# 002 — Respetar `prefers-reduced-motion` en toda la web

- **Status**: DONE (aplicado el 01/08/2026)
- **Commit**: 313c77f
- **Severity**: HIGH
- **Category**: Accesibilidad
- **Estimated scope**: 1 archivo (`src/index.css`), ~35 líneas nuevas

## Problem

`src/index.css` (410 líneas) no contiene **ni una sola** consulta
`prefers-reduced-motion`. Compruébalo:

```
grep -n "prefers-reduced-motion" src/index.css   # → sin resultados
```

El único sitio de todo el proyecto que la respeta es el Hero, y lo hace bien:

```tsx
// src/sections/Hero.tsx:38-40 — correcto, no tocar
const [reducedMotion] = useState(
  () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);
```

Fuera del Hero hay **27 revelados por scroll** que desplazan el contenido
verticalmente (`translate-y-6` / `translate-y-8` / `translate-y-15%`) durante
700–800 ms, repartidos así:

```
6  src/sections/Portfolio.tsx      2  src/sections/Testimonials.tsx
4  src/sections/Footer.tsx         2  src/sections/Photography.tsx
4  src/sections/CTA.tsx            2  src/sections/About.tsx
3  src/sections/Services.tsx       2  src/components/Navigation.tsx
1  src/sections/Stills.tsx         1  src/components/CtaBanner.tsx
```

Quien haya pedido menos movimiento al sistema operativo recibe la web entera
deslizándose hacia arriba, sección tras sección.

## Target

Movimiento reducido significa **menos movimiento y más suave, no cero**: se
mantiene el fundido de opacidad (que es lo que explica que ha aparecido algo
nuevo) y se elimina el desplazamiento.

Se crea una utilidad `.reveal` que centraliza las tres cosas: las propiedades
que se animan, la curva y la duración, y el comportamiento con movimiento
reducido. El plan 004 la aplicará en los 27 sitios.

```css
/* target — añadir en src/index.css, dentro del @layer utilities existente
   (el que empieza en la línea 118) */
.reveal {
  transition-property: opacity, transform;
  transition-duration: 800ms;
  transition-timing-function: var(--ease-out-quart);
}

/* target — añadir al final de src/index.css, fuera de cualquier @layer */
@media (prefers-reduced-motion: reduce) {
  .reveal {
    transition-property: opacity;
    transition-duration: 300ms;
    transform: none !important;
  }

  html {
    scroll-behavior: auto;
  }
}
```

`scroll-behavior: auto` anula el `scroll-behavior: smooth` de
`src/index.css:93`, que también es movimiento no solicitado.

El `!important` sobre `transform` es deliberado y está acotado a `.reveal`: las
clases `translate-y-*` de Tailwind son utilidades de la misma especificidad y
sin él no se anularían. **No** lo generalices a un selector global tipo
`[class*="translate-y"]`: rompería los centrados (`-translate-y-1/2` en
`src/sections/Hero.tsx:434`, `:462`, `:475`, entre otros), que son maquetación,
no animación.

## Repo conventions to follow

- Las utilidades propias van en el bloque `@layer utilities` de
  `src/index.css` (empieza en la línea 118, junto a `.font-geist`,
  `.text-h1`…). Los `@keyframes` y las reglas sueltas van después del
  `@layer`, a partir de la línea 217.
- Las curvas son variables CSS ya definidas en `src/index.css:78-83`. Usa
  `var(--ease-out-quart)` — es la que emplean hoy los 27 revelados.
- El proyecto comenta en español el *por qué* de las decisiones no obvias
  (ver `src/index.css:97-103`). Añade un comentario breve explicando por qué
  el `!important` está acotado a `.reveal`.

## Steps

1. En `src/index.css`, dentro del `@layer utilities` que empieza en la línea
   118, añade la regla `.reveal` tal cual aparece en «Target».
2. Al final del archivo (después de la línea 410), añade el bloque
   `@media (prefers-reduced-motion: reduce)` tal cual aparece en «Target»,
   con un comentario en español explicando el alcance del `!important`.
3. No cambies ningún `.tsx` en este plan.

## Boundaries

- NO toques `src/sections/Hero.tsx`: ya gestiona movimiento reducido
  correctamente y su rama `sinScrub` está probada.
- NO añadas la regla nuclear
  `*, *::before, *::after { transition-duration: 0.01ms !important }`.
  Movimiento reducido no es ausencia de movimiento: el fundido se queda.
- NO apliques `.reveal` a ningún componente todavía — eso es el plan 004.
- NO borres `.anim-hidden` / `.anim-visible` (`src/index.css:205-214`) aunque
  no tengan uso; su retirada va en otro plan.
- NO añadas dependencias.
- Si el código no coincide con lo citado (deriva desde `313c77f`), PARA y
  repórtalo.

## Verification

- **Mecánica**: `npm run build` en verde. Restaura después
  `dist/LEEME-DESPLIEGUE.md` con `git restore --source=HEAD dist/LEEME-DESPLIEGUE.md`.
- **Feel check**: `npm run dev` (puerto 5340). En DevTools → panel Rendering →
  «Emulate CSS prefers-reduced-motion: reduce», recarga y confirma:
  - el salto a un ancla (`/#portfolio`) es instantáneo, sin desplazamiento
    suave;
  - una vez el plan 004 esté aplicado, las secciones aparecen fundiéndose sin
    subir; **antes** del 004 este segundo punto aún no se cumple y es
    esperado.
  - con la emulación desactivada, todo se comporta exactamente igual que antes.
- **Done when**: `grep -c "prefers-reduced-motion" src/index.css` devuelve `1`
  y existe la clase `.reveal`.
