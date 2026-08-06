# Instrucciones para Claude — proyecto XALVAJE

## Regla número uno: no deducir, comprobar

NO afirmar nada que no se haya verificado directamente. Prohibido encadenar
suposiciones y presentarlas como diagnóstico.

Si algo no se puede comprobar con las herramientas disponibles, decir
"no lo sé" y preguntar. Nunca rellenar el hueco con una inferencia
presentada como hecho.

Ejemplo real de lo que NO hay que hacer (ocurrió en este proyecto):
se dedujo que la web publicada estaba en blanco porque al descargar el HTML
no aparecía contenido. Falso: es una SPA de React, y el HTML vacío es
exactamente lo que devuelve cualquier SPA que funciona perfectamente cuando
se consulta sin ejecutar JavaScript. La comprobación correcta habría sido
cargar la página en un navegador real o preguntar al usuario.

Etiquetar el nivel de confianza: [Seguro] solo con prueba directa,
[Probable] con inferencia fuerte, [Suposición] cuando se rellena información
que falta. Si la mayor parte de una respuesta es suposición, decirlo al principio.

## Regla número dos: aplicar la lógica y mirar atrás ANTES de investigar

Antes de lanzarse a diagnosticar un problema, revisar lo que ya se sabe en
la propia conversación y en el propio proyecto. La respuesta suele estar ya
ahí. Y aplicar el sentido común: si el usuario lleva meses trabajando en algo
y lo estaba tocando hace dos minutos, la hipótesis "esto no funciona" es
casi siempre falsa. Antes de aceptarla hacen falta pruebas muy sólidas.

Ejemplo real de este proyecto: se concluyó que la web publicada estaba rota
y que el dominio no estaba conectado a Vercel. Falso en ambos casos. La
prueba de lo contrario ya estaba en la sesión desde el primer minuto: la
carpeta compilada que el usuario había conectado, y el hecho de que la
primera compilación del proyecto generó el MISMO nombre de archivo
(`index-ccU3vExr.js`) que sirve el dominio en producción. Se ignoró ese dato
y se construyó una teoría equivocada encima.

Coste de ese error: casi una hora del usuario, un paquete de entrega que no
hacía falta y una alarma falsa sobre su web. Antes de dar una alarma,
comprobarla. Y ante la duda, preguntar: cuesta una frase.

## Cómo se despliega esta web (verificado)

- Repositorio: github.com/chris7sanchez/Xalvaje-website, rama `main`.
- Vercel, proyecto `xalvaje-website` en el equipo `christians-projects-d0c27375`,
  conectado a esa rama. Un `git push` a `main` dispara el despliegue automático.
- Dominio en producción: www.xalvajeproducciones.com
- Vercel conserva los despliegues anteriores: se puede revertir al instante
  desde el panel (Deployments -> ... -> Promote to Production).

## Estructura del proyecto

- React 19 + TypeScript + Vite 7 + Tailwind 3 + shadcn/ui.
- Todo el contenido editable está en `src/config.ts`.
- Las secciones están en `src/sections/`.
- Imágenes servidas: `public/images/*.webp`. Los originales sin optimizar
  están fuera de `public/` a propósito, para que no engorden el despliegue.
- `npm run build` genera `dist/`.

## Cosas que romper con cuidado

- El hero depende de `/videos/logo_xalvaje.mp4`. Tiene imagen de respaldo y
  un tiempo máximo de espera para no quedarse en negro: no quitar esa lógica.
- Las secciones se enlazan por ancla: el CTA de contacto es `id="contact"`.
- No importar `* as LucideIcons`: mete toda la librería de iconos en el bundle
  (fueron 578 KB de más). Importar cada icono por su nombre.

## Pendiente

- El email `info@xalvaje.com` no coincide con el dominio. Confirmar si existe.
- Los testimonios de la home son inventados.
- El formulario de newsletter no envía a ningún sitio.
- El botón "Ver Todos los Proyectos" no hace nada.
- El token de GitHub estuvo en texto plano en `.git/config`. Revisar que se
  haya rotado y que el remoto no lo lleve incrustado en la URL.

## Vídeos: el audio se pierde solo si no lo mapeas

`public/videos/reel.mp4` se ha quedado MUDO dos veces (la última, en `c762afc`).
Siempre por lo mismo: alguien reencoda el vídeo para mejorar la imagen y el
comando no mapea la pista de audio, así que sale un mp4 sin sonido y nadie lo
mira antes de commitear.

El máster está en `~/Mirror/CHRISS_REEL.mov` (1920x1080, 92,21 s) y trae **dos
pistas mono** de PCM 24 bits — la L y la R por separado, como las saca Resolve.
Coger solo `0:a:0` deja medio sonido; hay que unirlas:

```bash
ffmpeg -i entrada.mp4 -i ~/Mirror/CHRISS_REEL.mov \
  -filter_complex "[1:a:0][1:a:1]join=inputs=2:channel_layout=stereo[a]" \
  -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart salida.mp4
```

Y comprobar SIEMPRE antes de commitear cualquier vídeo:

```bash
ffprobe -v error -show_entries stream=codec_type,channels -of csv=p=0 public/videos/reel.mp4
```

Tiene que salir una línea `audio` con 2 canales. Si solo sale `video`, está mudo.

## La portada de MÓVIL va con fotogramas VERTICALES. No se toca.

El recorrido de la portada en móvil se hace con **60 fotogramas verticales**
apuntados desde `heroConfig.scrubFramePathPrefixSmall`. Desde el 06/08/2026 son
los de `public/images/hero-scrub2-vert/` (864×1536), generados del arte nuevo
de la nave vista desde la calle. Los antiguos (`hero-scrub-vert`, 720×1280,
rodados en vertical) siguen en el repo por si hay que volver.

**Nunca sustituir ese recorrido por un vídeo, una imagen fija ni los fotogramas
de escritorio.** En concreto:

- `heroConfig.portadaMovil` y `heroConfig.portadaMovilVideo` tienen que quedarse
  **vacíos**. Existe `public/videos/portada-movil.mp4`, pero está ahí de una
  versión anterior y no debe activarse.
- La trampa: poner `portadaMovilVideo` parece inofensivo y no lo es. El hero
  pinta el vídeo **en lugar de** los fotogramas, pero `sinScrub` no depende de
  ese campo sino de `portadaMovil`, así que la sección sigue midiendo 3,5
  pantallas. El visitante baja tres pantallas y media y la imagen no cambia,
  porque lo que ve es un bucle. Los 60 verticales no se ven nunca.
  Pasó el 05/08/2026.

Si alguien pide "el vídeo vertical de la app", preguntar antes de tocar: casi
seguro se refiere a que el recorrido se vea **en vertical**, y eso ya lo hacen
los fotogramas. Comprobarlo midiendo — `sips -g pixelWidth -g pixelHeight` sobre
`public/images/hero-scrub-vert/f-001.webp` — antes de cambiar nada.


## hero-scrub2: cómo se generó y cómo regenerarlo

Los 120 fotogramas de `hero-scrub2{,-vert}` NO salen de un vídeo: se compusieron
el 06/08/2026 desde dos renders de Christian (los .tif de la raíz, sin
versionar) porque se quedó sin créditos para renderizar el vídeo de apertura.
La persiana cerrada se disuelve hacia arriba sobre el interior con
`xfade=transition=smoothup`. Son PROVISIONALES: máster de 1024 px de ancho.

```bash
# horizontal (1024x576, recorte y=435 que deja fuera el menú quemado del mockup)
ffmpeg -loop 1 -t 3 -r 25 -i cerrada.png -loop 1 -t 3 -r 25 -i reposo.png \
  -filter_complex "[0:v][1:v]xfade=transition=smoothup:duration=2.32:offset=0.04" \
  -frames:v 60 f-%03d.png
```

Cuando lleguen los másters grandes (≥1920 de ancho por estado) y/o el vídeo real
de apertura, regenerar y subir la calidad. Los estados del MENÚ DE LUCES viven
en `public/images/menu-estados/` y en `src/components/MenuLuces.tsx`; siguen
pendientes de re-export los de Qué Ofrecemos y Nuestra Visión (llegaron
duplicado y cambiado; llevan luz CSS provisional).
