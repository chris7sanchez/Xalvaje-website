# 003 — Que el hover solo se dispare con ratón, no al tocar la pantalla

- **Status**: DONE (aplicado el 01/08/2026)
- **Commit**: 313c77f
- **Severity**: HIGH
- **Category**: Accesibilidad
- **Estimated scope**: 1 archivo de config + 4 componentes

## Problem

En un móvil o tablet, tocar un elemento dispara el `:hover` **y el estado se
queda pegado** hasta que se toca otra cosa. La web no protege ni un solo
hover: `grep -rn "@media (hover" src/` no devuelve nada.

Hay dos familias afectadas.

**(a) Hovers en CSS (Tailwind) — 13 sitios.** Seis con escalado:

```
src/sections/Photography.tsx:118   group-hover:scale-[1.04]
src/sections/Footer.tsx:48         group-hover:scale-105
src/sections/Hero.tsx:444          group-hover:scale-105
src/sections/Hero.tsx:448          group-hover:scale-110
src/sections/Portfolio.tsx:284     group-hover:scale-105
src/components/Navigation.tsx:66   group-hover:scale-105
```

Y siete con desplazamiento:

```
src/sections/About.tsx:72          group-hover:translate-x-1
src/sections/CTA.tsx:99            group-hover:translate-x-1
src/sections/Services.tsx:74       group-hover:translate-x-1
src/components/CtaBanner.tsx:62    group-hover:translate-x-0.5 -translate-y-0.5
src/sections/Footer.tsx:99         group-hover:opacity-100 translate-x-0
src/sections/Portfolio.tsx:204     group-hover:translate-x-0.5
src/sections/Portfolio.tsx:417     group-hover:translate-x-0.5 -translate-y-0.5
```

**(b) Hovers en JavaScript — 4 componentes.** `onMouseEnter` también se
dispara al tocar en navegadores móviles, y `onMouseLeave` puede no llegar
nunca, así que el estado queda encendido para siempre:

```tsx
// src/components/AnimatedButton.tsx:80-81 y 93-94 — actual
onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
```

```
src/sections/Photography.tsx:90    onMouseEnter={() => setHovered(i)}
src/sections/Services.tsx:25       onMouseEnter={() => setIsHovered(true)}
src/sections/Portfolio.tsx:154     onMouseEnter={() => setIsHovered(true)}
```

En Portfolio esto es especialmente visible: al tocar un cartel se cambia a la
imagen alternativa y ya no vuelve.

## Target

**(a)** Una sola línea de configuración. Tailwind 3.4 (instalado: 3.4.19) trae
la bandera `hoverOnlyWhenSupported`, que compila **todas** las variantes
`hover:` y `group-hover:` envueltas en
`@media (hover: hover) and (pointer: fine)`. Resuelve los 13 sitios sin tocar
ningún componente:

```ts
// target — tailwind.config.js, en el nivel superior del objeto exportado
export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  // …resto de la config sin cambios
}
```

**(b)** Los cuatro componentes con estado en JS consultan el mismo medio antes
de encender el hover. Crea un hook junto a los que ya existen:

```ts
// target — src/hooks/useHoverCapaz.ts (archivo nuevo)
import { useEffect, useState } from 'react';

/**
 * `true` solo cuando el dispositivo tiene un puntero fino de verdad (ratón o
 * trackpad). En táctil, `onMouseEnter` se dispara al tocar y `onMouseLeave`
 * puede no llegar nunca: el estado de hover se quedaría encendido para
 * siempre.
 */
export function useHoverCapaz() {
  const [capaz, setCapaz] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const alCambiar = () => setCapaz(mq.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  return capaz;
}
```

Y en cada componente se cortocircuita el encendido:

```tsx
// target — patrón para los cuatro componentes
const hoverCapaz = useHoverCapaz();
// …
onMouseEnter={() => hoverCapaz && setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)}
```

`onMouseLeave` se deja siempre activo: si por lo que sea el estado llegó a
encenderse, tiene que poder apagarse.

## Repo conventions to follow

- Los hooks viven en `src/hooks/`, uno por archivo, exportación nombrada (ver
  `src/hooks/useScrollAnimation.ts`).
- La inicialización de `useState` con `matchMedia` se hace con función
  perezosa y guardia de `typeof window`, exactamente como en
  `src/sections/Hero.tsx:38-40`. Imita ese patrón.
- Los comentarios explicativos van en español y justifican el *por qué*.

## Steps

1. En `tailwind.config.js`, añade el bloque `future: { hoverOnlyWhenSupported: true }`
   en el nivel superior del objeto exportado (hermano de `theme`, `content` y
   `plugins`).
2. Crea `src/hooks/useHoverCapaz.ts` con el contenido de «Target».
3. En `src/components/AnimatedButton.tsx`: importa el hook, llámalo dentro del
   componente y envuelve los dos `onMouseEnter` (líneas 80 y 93) con la
   guardia. Deja los `onMouseLeave` como están.
4. Igual en `src/sections/Portfolio.tsx:154`, `src/sections/Services.tsx:25` y
   `src/sections/Photography.tsx:90`. En Photography la guardia protege
   `setHovered(i)`.

## Boundaries

- NO edites a mano las 13 clases `hover:` / `group-hover:`: la bandera de
  Tailwind ya las cubre. Editarlas además sería trabajo duplicado y ruido en
  el diff.
- NO toques `src/components/ui/**` (shadcn generado).
- NO conviertas los hovers en eventos de `pointer`/`touch` ni añadas estados
  «pulsado» — eso es el plan 005.
- NO añadas dependencias.
- Si el código no coincide con lo citado (deriva desde `313c77f`), PARA y
  repórtalo.

## Verification

- **Mecánica**: `npx tsc --noEmit` sin errores nuevos; `npm run build` en
  verde; después `git restore --source=HEAD dist/LEEME-DESPLIEGUE.md`.
- **Comprobación de la bandera**: tras el build, en el CSS generado dentro de
  `dist/assets/`, buscar `@media (hover: hover)` debe devolver resultados. Si
  no aparece, la bandera no se aplicó.
- **Feel check**: `npm run dev` (puerto 5340). En DevTools, activa la emulación
  de dispositivo móvil (icono de móvil/tablet, arriba a la izquierda del panel)
  y confirma:
  - tocar un cartel de Proyectos **no** deja la imagen alternativa fijada;
  - tocar un botón no deja el texto a media subida;
  - tocar una foto de la sección de Retratos no la deja ampliada al 104 %.
  - Con la emulación desactivada y ratón real, todos los hovers siguen
    funcionando igual que antes.
- **Done when**: la emulación táctil no deja ningún estado de hover pegado en
  Proyectos, Retratos, Servicios ni en los botones.
