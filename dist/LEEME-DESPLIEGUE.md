# XALVAJE Producciones — instrucciones de despliegue

Dominio: https://www.xalvajeproducciones.com
Fecha de este build: 27 de julio de 2026

## Qué hay que publicar

El contenido de esta carpeta. Es un sitio estático: no necesita Node, ni PHP,
ni base de datos. Basta con servir estos archivos.

`index.html` tiene que quedar en la raíz del dominio. Estructura correcta
en el servidor:

    /index.html
    /favicon.ico
    /favicon.png
    /apple-touch-icon.png
    /og-image.jpg
    /assets/...
    /images/...
    /videos/...

## Configuración del servidor

Es una single-page application (React). Si el hosting devuelve 404 en rutas
que no sean la raíz, hay que redirigir todo a `index.html`.

- Netlify: archivo `_redirects` con la línea `/*  /index.html  200`
- Vercel: se detecta solo, no hace falta nada
- Apache: `.htaccess` con `FallbackResource /index.html`
- Nginx: `try_files $uri $uri/ /index.html;`

Recomendado: cachear `/assets/` de forma agresiva (los nombres llevan hash)
y servir `index.html` sin caché, para que los cambios se vean al instante.

Importante: el dominio está escrito en las etiquetas canonical y Open Graph
como `https://www.xalvajeproducciones.com`. Si el sitio se sirve sin `www`,
conviene configurar una redirección de una versión a la otra para no tener
el contenido duplicado en dos direcciones.

## Qué se ha cambiado en este build

Rendimiento
- Imágenes convertidas a WebP: de ~125 MB a 1,7 MB (-98%).
- Bundle JavaScript: de 862 KB a 284 KB (-67%), eliminando la importación
  completa de la librería de iconos.
- `loading="lazy"` en todas las imágenes salvo la del hero.

Correcciones
- El hero ya no se queda en negro si el vídeo de fondo tarda o falla:
  tiene imagen de respaldo y un tiempo máximo de espera de 2,5 s.
- El botón "Contacto" no funcionaba: apuntaba a `#cta` y la sección es
  `#contact`. Corregido en el menú, en el footer y en la tarjeta del portfolio.
- `lang="en"` cambiado a `lang="es"`.

Marca
- Logo integrado: la X del logotipo como imagen + "ALVAJE" como texto.
- Favicons (antes no había ninguno) e imagen Open Graph para compartir.
- Color de marca `#B8442A`, muestreado de la X del logo.
- Meta description y title orientados a búsqueda.

## Pendiente (no incluido en este build)

- El email de contacto configurado es `info@xalvaje.com`, que no coincide con
  el dominio `xalvajeproducciones.com`. CONFIRMAR que ese buzón existe y se
  lee: es la dirección del botón "Enviar Mensaje" y del footer.
- Los testimonios de la home son de relleno, con nombres inventados.
- El formulario de newsletter del footer no envía a ningún sitio.
- El botón "Ver Todos los Proyectos" no hace nada.
- Los enlaces de "Política de Privacidad" y "Términos de Uso" apuntan a `#`.

## Código fuente

El proyecto es React + Vite + TypeScript + Tailwind.
Para regenerar este build:

    npm install
    npm run build
