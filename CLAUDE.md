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
