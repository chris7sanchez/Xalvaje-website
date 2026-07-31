# 004 — Sustituir los 47 `transition-all` por propiedades explícitas

- **Status**: DONE (aplicado el 01/08/2026)
- **Commit**: 313c77f
- **Severity**: HIGH
- **Category**: Rendimiento
- **Depende de**: plan 002 (crea la utilidad `.reveal`)
- **Estimated scope**: 11 archivos, ~47 líneas

## Problem

`transition-all` anima **todas** las propiedades que cambien, no solo las que
uno tenía en mente. Cuando entre los cambios hay `background-image`,
`backdrop-filter` o `box-shadow`, el navegador sale de la vía rápida de la GPU
y pasa por recálculo de estilo y repintado en cada fotograma.

Hay 47 usos fuera de `src/components/ui/`. El peor, con diferencia:

```tsx
// src/components/Navigation.tsx:36-46 — actual
className={cn(
  'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out-circ',
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
  isScrolled
    ? 'bg-white/90 backdrop-blur-md shadow-sm'
    : 'bg-gradient-to-b from-black/60 via-black/25 to-transparent'
)}
```

Aquí el `transition-all` intenta interpolar a la vez `opacity`, `transform`,
`background-image` (un degradado que pasa a no existir), `backdrop-filter` y
`box-shadow`. Además `background-image` **no es interpolable**: el degradado no
se funde, salta — así que se paga el coste sin obtener la transición.

Los 47 usos se reparten en dos grupos.

**Grupo A — 27 revelados por scroll**, todos con la misma forma
`transition-all duration-{700|800} ease-out-quart`:

```
6  src/sections/Portfolio.tsx      2  src/sections/Testimonials.tsx
4  src/sections/Footer.tsx         2  src/sections/Photography.tsx
4  src/sections/CTA.tsx            2  src/sections/About.tsx
3  src/sections/Services.tsx       2  src/components/Navigation.tsx
1  src/sections/Stills.tsx         1  src/components/CtaBanner.tsx
```

Localízalos con:

```
grep -rn --include='*.tsx' 'transition-all duration-[0-9]* ease-out-quart' src/ | grep -v components/ui
```

**Grupo B — 20 usos que no son revelados**:

```
src/sections/Hero.tsx:393, 414, 434, 444, 462, 475, 497
src/sections/Footer.tsx:67, 99
src/sections/Portfolio.tsx:108, 163, 174, 284
src/components/PageNav.tsx:42
src/components/AnimatedButton.tsx:30
src/components/Navigation.tsx:37, 85, 92, 99, 114
```

## Target

**Grupo A** → la utilidad `.reveal` que crea el plan 002. Una sola clase que
declara qué se anima, con qué curva y qué pasa con movimiento reducido:

```tsx
/* actual */  'lg:col-span-4 space-y-6 transition-all duration-800 ease-out-quart'
/* target  */ 'lg:col-span-4 space-y-6 reveal'
```

Los `duration-700` del grupo A pasan a los 800 ms de `.reveal`: unificar la
duración de los revelados es deseable (hoy conviven 700 y 800 sin criterio).
Los `style={{ transitionDelay: … }}` en línea **se quedan como están** —
`.reveal` no toca el retardo.

**Grupo B** → transición explícita, propiedad a propiedad. Equivalencias
exactas:

```tsx
/* Navigation.tsx:37 */
'fixed top-0 left-0 right-0 z-50 transition-[opacity,transform] duration-500 ease-out-circ'

/* Navigation.tsx:85, 92, 99 — si ya hiciste el plan 001, ya están hechas */
'w-full h-0.5 transition-[transform,opacity,background-color] duration-250 ease-out-quad origin-center'

/* Navigation.tsx:114 (overlay del menú) */
'fixed inset-0 z-40 bg-white transition-opacity duration-500 ease-out-cubic'

/* Portfolio.tsx:163 y :174 (los dos carteles que se cruzan) */
'absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out-cubic'

/* Portfolio.tsx:108 (punto del carrusel) */
'w-1.5 h-1.5 rounded-full transition-[background-color,transform]'

/* Portfolio.tsx:284 y Hero.tsx:444 (botón redondo de reproducción) */
'… transition-[background-color,border-color,transform] duration-300 …'

/* Hero.tsx:393, 434 */
'… transition-[opacity,transform] duration-700 ease-out'

/* Hero.tsx:462, 475 (flechas de navegación) */
'… transition-[opacity,transform] duration-200 ease-out'

/* Hero.tsx:414 */
'… transition-[opacity,transform] duration-300 px-2'

/* Hero.tsx:497 (titular con disipación) */
'text-center transition-[opacity,transform,filter] ease-out'

/* Footer.tsx:67 */
'… hover:bg-white hover:text-exvia-black transition-[background-color,color] duration-300'

/* Footer.tsx:99 */
'… transition-[opacity,transform] duration-200'

/* PageNav.tsx:42 */
'absolute left-0 -bottom-0.5 h-px bg-exvia-red transition-[width,opacity] duration-300'

/* AnimatedButton.tsx:30 */
'transition-[background-color,border-color,color,transform] duration-300 ease-out-quad'
```

Dos cambios de duración van incluidos y son deliberados:
`Hero.tsx:462` y `:475` pasan de `duration-1000` a `duration-200`. Son flechas
de navegación, es decir controles interactivos: el presupuesto de una
transición de interfaz es 300 ms como techo, y un segundo entero se percibe
como que la web no responde.

`Hero.tsx:497` conserva `filter` en la lista: la aparición del titular es una
disipación de desenfoque (`blur-[14px]` → `blur-0`) y sin `filter` en la
transición dejaría de funcionar.

## Repo conventions to follow

- La sintaxis de propiedades arbitrarias de Tailwind es
  `transition-[prop1,prop2]`, **sin espacios** tras las comas (con espacios,
  Tailwind no genera la clase).
- Cuando solo se anima opacidad hay clase propia: `transition-opacity`.
  Úsala en vez de `transition-[opacity]`. Igual con `transition-transform` y
  `transition-colors`.
- Ya hay ejemplos correctos en el repo que puedes imitar:
  `src/sections/Photography.tsx:118` (`transition-transform`),
  `src/sections/Photography.tsx:148` (`transition-colors`),
  `src/components/AnimatedButton.tsx:48` (`transition-transform`).

## Steps

1. Aplica primero el plan 002 (necesitas la clase `.reveal`). Si `.reveal` no
   existe en `src/index.css`, PARA.
2. Grupo A, archivo por archivo: sustituye cada
   `transition-all duration-700 ease-out-quart` y
   `transition-all duration-800 ease-out-quart` por `reveal`. Son 27
   ocurrencias en 10 archivos. No toques nada más de esas líneas: ni las
   clases de maquetación, ni los ternarios de `opacity`/`translate`, ni los
   `transitionDelay` en línea.
3. Grupo B: aplica una por una las 20 sustituciones de «Target», respetando
   las duraciones indicadas.
4. Comprueba que no queda ninguna:
   `grep -rn --include='*.tsx' 'transition-all' src/ | grep -v components/ui`
   debe devolver 0 líneas.

## Boundaries

- NO toques `src/components/ui/**`: es shadcn generado y se regenera.
- NO cambies ninguna curva (`ease-out-quart`, `ease-out-circ`, `ease-out-cubic`,
  `ease-out-quad`) salvo donde «Target» lo indique explícitamente.
- NO cambies ninguna duración salvo las tres indicadas (Hero:462, Hero:475 y
  la unificación 700→800 del grupo A).
- NO toques la lógica de scroll del Hero (`handleScroll`, `lockedRef`,
  `unlockedRef`, la precarga de fotogramas): es delicada y no es de este plan.
- NO reordenes clases ni «limpies» código alrededor.
- NO añadas dependencias.
- Si una línea no coincide con lo citado (deriva desde `313c77f`), PARA y
  repórtalo en vez de improvisar el equivalente.

## Verification

- **Mecánica**: `npx tsc --noEmit` sin errores nuevos; `npm run build` en
  verde; `git restore --source=HEAD dist/LEEME-DESPLIEGUE.md`.
  `grep -rn --include='*.tsx' 'transition-all' src/ | grep -v components/ui`
  devuelve 0 líneas.
- **Feel check**: `npm run dev` (puerto 5340). Con DevTools → Performance
  grabando, baja por la portada hasta Proyectos y confirma:
  - la barra superior cambia de degradado a blanco sin tirones;
  - los revelados de sección siguen apareciendo igual que antes (fundido +
    subida), ninguno se queda invisible;
  - las flechas del hero responden de inmediato, no en un segundo;
  - el titular del hero sigue apareciendo con el desenfoque disipándose, no
    con un fundido plano.
  - En el panel Rendering, activa «Paint flashing»: al cruzar el umbral de
    scroll de la barra debe repintarse la barra, no la página entera.
- **Done when**: cero `transition-all` fuera de `src/components/ui/`, y ningún
  revelado de sección se queda en `opacity: 0` al recorrer las cinco páginas
  (Portada, Proyectos, Qué ofrecemos, Quiénes somos, Contacto).
