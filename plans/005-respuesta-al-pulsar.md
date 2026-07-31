# 005 — Dar respuesta al pulsar en los elementos accionables

- **Status**: DONE (aplicado el 01/08/2026)
- **Commit**: 313c77f
- **Severity**: MEDIUM
- **Category**: Física y origen
- **Estimated scope**: 5 archivos, ~8 líneas

## Problem

Ningún elemento pulsable de la web acusa el dedo o el clic. Compruébalo:

```
grep -rn --include='*.tsx' 'active:' src/ | grep -v components/ui   # → sin resultados
```

Cero ocurrencias en todo el proyecto. Todo el repertorio de respuesta táctil
está puesto en el `:hover`, que en móvil no existe (y que, tras el plan 003,
directamente no se dispara ahí). El resultado en un teléfono es una web donde
tocar un botón no produce ninguna señal hasta que la acción termina: se percibe
como que el toque no ha entrado.

Los cinco sitios afectados, con su código actual:

```tsx
// src/components/AnimatedButton.tsx:28-41 — el CTA de toda la web
const baseStyles = cn(
  'relative overflow-hidden font-geist-mono inline-flex items-center justify-center gap-2',
  'transition-all duration-300 ease-out-quad',
  { … }
);
```

```tsx
// src/sections/Hero.tsx:444 — botón redondo de reproducir el reel
<span className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/70 bg-black/55 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/80 group-hover:border-white group-hover:scale-105 …">
```

```tsx
// src/sections/Portfolio.tsx:284 — mismo botón redondo en Proyectos
<span className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/70 bg-black/55 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/80 group-hover:scale-105">
```

```tsx
// src/sections/Photography.tsx:148, 156, 164 — controles del visor de fotos
className="absolute top-6 right-6 z-10 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm … hover:bg-black/90 transition-colors"
```

```tsx
// src/components/Navigation.tsx:77-82 — botón de menú
<button
  onClick={() => setIsMenuOpen(!isMenuOpen)}
  className="relative w-8 h-6 flex flex-col justify-between"
  …
>
```

## Target

Un único gesto para todo: **`scale(0.97)` mientras está pulsado, con
`transform` a 160 ms `ease-out`**. Sutil a propósito — el rango útil va de 0.95
a 0.98; por debajo parece que el botón se hunde y por encima no se percibe.

En clases Tailwind: `active:scale-[0.97]`, con `transform` presente en la lista
de propiedades de la transición.

La respuesta al pulsar **no** se envuelve en `@media (hover: hover)`: el
propósito es justamente cubrir el táctil. La bandera `hoverOnlyWhenSupported`
del plan 003 afecta a `hover:` y `group-hover:`, no a `active:`, así que no hay
conflicto.

```tsx
/* target — AnimatedButton.tsx:30 */
'transition-[background-color,border-color,color,transform] duration-300 ease-out-quad active:scale-[0.97] active:duration-[160ms]'

/* target — botones redondos (Hero.tsx:444 y Portfolio.tsx:284)
   el scale va en el <span> pero se dispara desde el enlace/botón padre,
   que ya lleva la clase `group` */
'… transition-[background-color,border-color,transform] duration-300 group-active:scale-[0.97] group-active:duration-[160ms]'

/* target — controles del visor (Photography.tsx:148, 156, 164) */
'… hover:bg-black/90 transition-[background-color,transform] duration-300 active:scale-[0.97] active:duration-[160ms]'

/* target — botón de menú (Navigation.tsx:79) */
'relative w-8 h-6 flex flex-col justify-between transition-transform duration-[160ms] ease-out-quad active:scale-[0.97]'
```

`active:duration-[160ms]` es lo que produce el **tiempo asimétrico** que hace
que un botón se sienta bien: el hundido responde en 160 ms, y al soltar la
vuelta usa la duración base (300 ms), más relajada. Es deliberado, no una
inconsistencia.

## Repo conventions to follow

- Las duraciones arbitrarias se escriben `duration-[160ms]`. Si el plan 001 ya
  añadió `transitionDuration: { 250: '250ms' }` a `tailwind.config.js`, añade
  también `160: '160ms'` y usa `duration-160` en su lugar, por coherencia.
- Los botones redondos de Hero y Portfolio son visualmente idénticos: el
  contenedor padre ya lleva `group` y todos los efectos se declaran con
  `group-hover:` en el hijo. Sigue ese patrón con `group-active:`, no muevas
  el estado al padre.
- No inventes curvas: `ease-out-quad` (`src/index.css:79`) es la que usan ya
  los botones.

## Steps

1. Si hiciste el plan 001, añade `160: '160ms'` a `theme.extend.transitionDuration`
   en `tailwind.config.js` y usa `duration-160` en todos los pasos siguientes.
   Si no, usa `duration-[160ms]`.
2. `src/components/AnimatedButton.tsx:30`: aplica la línea de «Target».
3. `src/sections/Hero.tsx:444`: añade `group-active:scale-[0.97]` y
   `group-active:duration-[160ms]` al `<span>`, y asegúrate de que `transform`
   está en la lista de propiedades de la transición.
4. `src/sections/Portfolio.tsx:284`: lo mismo.
5. `src/sections/Photography.tsx:148`, `:156` y `:164`: añade
   `active:scale-[0.97]` y `active:duration-[160ms]`, cambiando
   `transition-colors` por `transition-[background-color,transform]`.
6. `src/components/Navigation.tsx:79`: añade la transición y el `active:` al
   `className` del `<button>`.

## Boundaries

- NO añadas respuesta al pulsar a las tarjetas de Proyectos ni a las fotos de
  Retratos: son superficies grandes; un `scale` en una tarjeta a pantalla
  completa se lee como un fallo de maquetación, no como una respuesta.
- NO toques `src/components/ui/**`.
- NO uses valores fuera del rango 0.95–0.98.
- NO envuelvas `active:` en ninguna consulta de medios.
- NO cambies el marcado ni los manejadores de eventos.
- NO añadas dependencias.
- Si el código no coincide con lo citado (deriva desde `313c77f`), PARA y
  repórtalo.

## Verification

- **Mecánica**: `npx tsc --noEmit` sin errores nuevos; `npm run build` en
  verde; `git restore --source=HEAD dist/LEEME-DESPLIEGUE.md`.
- **Feel check**: `npm run dev` (puerto 5340). Con el ratón, mantén pulsado
  cada uno de los cinco elementos y confirma:
  - se hunde ligeramente y vuelve al soltar; el movimiento se nota pero no
    llama la atención;
  - el hundido llega antes que la vuelta (asimetría deliberada);
  - en el botón de menú, el hundido no interfiere con la rotación de las
    líneas en aspa.
  - En emulación táctil (DevTools → icono de móvil), un toque produce la misma
    respuesta: es el objetivo principal de este plan.
  - En DevTools → panel Rendering → «Emulate prefers-reduced-motion: reduce»,
    el hundido sigue estando: es respuesta directa a una acción del usuario,
    no movimiento decorativo, y debe conservarse.
- **Done when**: los cinco elementos responden al pulsar, con ratón y en
  emulación táctil, y `grep -rn 'active:scale' src/ | grep -v components/ui`
  devuelve 8 líneas.
