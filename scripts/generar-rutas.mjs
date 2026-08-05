// Tras el build, deja una copia de index.html en una carpeta por ruta.
// Así, entrar directo a /proyectos funciona en CUALQUIER hosting estático, sin
// depender de que se apliquen los rewrites: en Vercel no se estaban aplicando y
// las tres rutas devolvían 404, ni con la regex ni con la forma documentada.
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const RUTAS = ['proyectos', 'que-ofrecemos', 'quienes-somos', 'nuestra-vision', 'contacto', 'demo-reel'];
const dist = 'dist';
const indice = join(dist, 'index.html');

if (!existsSync(indice)) {
  console.error('No existe dist/index.html: ¿se ha hecho el build?');
  process.exit(1);
}

for (const ruta of RUTAS) {
  const carpeta = join(dist, ruta);
  mkdirSync(carpeta, { recursive: true });
  copyFileSync(indice, join(carpeta, 'index.html'));
  console.log(`  /${ruta}/index.html`);
}
console.log(`${RUTAS.length} rutas generadas`);
