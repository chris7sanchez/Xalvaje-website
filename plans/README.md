# Planes de animación — XALVAJE

Generados por la skill `improve-animations` sobre el commit `313c77f`
(1 de agosto de 2026), a partir de una auditoría de las ocho categorías del
catálogo. Cada plan es autocontenido: se puede ejecutar sin haber leído la
conversación que lo originó, y sin criterio propio de diseño.

**Los cinco están aplicados** (01/08/2026): `npx tsc --noEmit` limpio,
`npm run build` en verde, cero errores de consola y verificación en el
navegador sobre el CSS generado. Detalles de la ejecución al final.

## Planes

| # | Título | Severidad | Categoría | Archivos | Estado |
|---|--------|-----------|-----------|----------|--------|
| [001](001-hamburguesa-sin-scale-cero.md) | Quitar el `scale(0)` de la línea central de la hamburguesa | ALTA | Física y origen | 2 | DONE |
| [002](002-respetar-movimiento-reducido.md) | Respetar `prefers-reduced-motion` en toda la web | ALTA | Accesibilidad | 1 | DONE |
| [003](003-hover-solo-con-raton.md) | Que el hover solo se dispare con ratón, no al tocar | ALTA | Accesibilidad | 6 | DONE |
| [004](004-quitar-transition-all.md) | Sustituir los 47 `transition-all` por propiedades explícitas | ALTA | Rendimiento | 11 | DONE |
| [005](005-respuesta-al-pulsar.md) | Dar respuesta al pulsar en los elementos accionables | MEDIA | Física y origen | 5 | DONE |

## Orden recomendado

```
001  →  002  →  003  →  004  →  005
```

- **001** es independiente y son dos líneas. Va primero porque además introduce
  el token `duration-250` en `tailwind.config.js` que reutilizan 004 y 005.
- **002** solo toca `src/index.css` y no rompe nada por sí mismo. Tiene que ir
  antes que 004 porque **crea la utilidad `.reveal` que 004 consume**. Es la
  única dependencia dura del lote.
- **003** es independiente del resto (config de Tailwind + 4 componentes). Va
  antes que 005 para que quede claro que la bandera `hoverOnlyWhenSupported`
  afecta a `hover:`/`group-hover:` pero **no** a `active:`.
- **004** es el más largo y el que más archivos toca. Va después de 002.
- **005** va al final porque sus clases se apoyan en las listas de propiedades
  de transición que deja 004. Si se ejecuta antes, hay que añadir `transform`
  a mano en cada sitio.

## Dependencias

| Plan | Depende de | Motivo |
|---|---|---|
| 004 | 002 | Necesita la clase `.reveal` definida en `src/index.css` |
| 004, 005 | 001 | Reutilizan los tokens de `transitionDuration` de `tailwind.config.js` (blando: funcionan con valores arbitrarios si 001 no se hizo) |
| 005 | 004 | Las listas `transition-[…]` ya incluyen `transform` (blando) |

## Avisos de este repositorio

- `dist/LEEME-DESPLIEGUE.md` **ya no existe** en `HEAD` (comprobado el
  01/08/2026): la advertencia de restaurarlo tras cada `npm run build` está
  obsoleta y no hay que hacer nada.
- El repo versiona `dist/` a propósito: hay que construir antes de commitear.
- La config de Tailwind es `tailwind.config.js` (CommonJS), no `.ts`.
- ESLint arrastra 20 errores previos (hooks condicionales en Footer y
  Testimonials, componente creado en render en Services) **ajenos a estos
  planes**. No los arregles aquí y no los cuentes como regresión.
- El scroll del documento está en `document.body`, no en `window`.
  `window.scrollTo` no hace nada.

## Hallazgos auditados que NO tienen plan

Se detectaron y se dejaron fuera de este lote a propósito:

- **MEDIA** — El menú de navegación tarda ~900 ms en completarse (500 ms +
  100 ms por ítem + 400 ms de retardo en el botón), en
  `src/components/Navigation.tsx:112-151`. Objetivo: 250 ms con escalonado de
  60 ms.
- **BAJA** — Doble exposición en el cruce de carteles de Proyectos
  (`src/sections/Portfolio.tsx:163-176`): a mitad de transición se ven las dos
  imágenes al 50 %. Se enmascara con `filter: blur(2px)` durante el cruce.
- **BAJA** — Diez `@keyframes` sin ningún uso en `src/index.css:217-319`
  (`fadeIn`, `slideUp`, `scaleIn`, `heroContainerScale`, `textSlideOut`,
  `textSlideIn`, `slideActive`, `slideInactive`, `menuLineFirst`,
  `menuLineThird`), más las clases muertas `.anim-hidden` / `.anim-visible`
  (`:205-214`). `heroContainerScale` además anima `width`/`height`, que fuerza
  recálculo de maquetación. Aparcar en `_PARKING/`, no borrar.
- El escalonado por defecto de `useStaggerAnimation`
  (`src/hooks/useScrollAnimation.ts:65`) es de 100 ms, por encima de la banda
  útil de 30–80 ms. Fotografía ya usa 70 ms y se percibe mejor.

## Lo que ya estaba bien

No lo toques al ejecutar los planes:

- El tratamiento de `prefers-reduced-motion` del Hero
  (`src/sections/Hero.tsx:38-65`, rama `sinScrub` completa), que además cubre
  el ahorro de datos y las pantallas pequeñas.
- El escalonado de 70 ms de la rejilla de Retratos
  (`src/sections/Photography.tsx:101`).
- El visor de fotos, que usa el Dialog de Radix con `zoom-in-95` a 200 ms:
  escala desde 0.95, no desde 0.
- Que las flechas ← → cambien de foto **sin animación**
  (`src/sections/Photography.tsx:40-44`). Es una acción de teclado que se
  repite decenas de veces: animarla sería un error.

## Ejecución — 1 de agosto de 2026

Aplicados los cinco de una vez. Evidencia:

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | ✓ 1797 módulos, 2,27 s, 4 rutas generadas |
| Errores de consola en el navegador | ninguno |
| `transition-all` fuera de `components/ui/` | 0 (eran 47) |
| `@media(hover:hover)and (pointer:fine)` en el CSS de producción | 5 bloques |
| `prefers-reduced-motion` en el CSS de producción | 1 bloque |
| `active:scale-[0.97]` + `group-active:scale-[0.97]` | generados |
| Línea central de la hamburguesa, abierta | `matrix(0.9, 0, 0, 1, 0, 0)` = `scaleX(0.9)`, ya no `scale(0)` |
| Las tres líneas de la hamburguesa | 0,25 s las tres (antes 500/300/500 ms) |
| Barra de navegación | `transition-property: opacity, transform` (antes `all`) |
| Revelados en `/proyectos` | 29 con `.reveal`, `opacity, transform` / 0,8 s; ninguno atascado invisible en pantalla al bajar |

### Correcciones sobre lo planificado

1. **La config es `tailwind.config.js`, no `.ts`.** Los planes decían `.ts`.
   Corregido en los cinco archivos.
2. **`dist/LEEME-DESPLIEGUE.md` ya no está en `HEAD`.** El aviso heredado de
   restaurarlo tras cada build está obsoleto: `git restore` falla con
   «pathspec did not match». Retirado del README.
3. **Los revelados eran 25, no 27.** Los otros dos (`Navigation.tsx:127` y
   `:143`, los ítems del menú) van a `duration-500`, no a 700/800: no son
   revelados por scroll sino la entrada del menú. Se les puso
   `transition-[opacity,transform]` conservando su duración, porque el tiempo
   del menú es el hallazgo 6, que sigue sin plan.
4. **El `<nav>` de `PageNav` da `transition-property: all` al inspeccionarlo.**
   No es un `transition-all` superviviente: es el valor por defecto de CSS
   cuando no hay ninguna transición declarada. No hay nada que arreglar ahí.
5. **Riesgo real detectado al ejecutar:** insertar el import de
   `useHoverCapaz` buscando la línea exacta
   `import { useScrollAnimation } from '@/hooks/useScrollAnimation';` falla en
   `Portfolio.tsx`, que importa dos hooks en esa línea
   (`useScrollAnimation, useStaggerAnimation`). El resultado fue
   `<ProjectCard>` reventando y la página en blanco. Un plan futuro que añada
   imports debe buscar por módulo, no por línea completa.

### Sin verificar

- El comportamiento con `prefers-reduced-motion: reduce` se comprobó a nivel de
  CSS (la regla existe y está bien formada en el bundle de producción), **no**
  con la emulación del navegador activada. Queda pendiente mirarlo con el
  ajuste real del sistema.
