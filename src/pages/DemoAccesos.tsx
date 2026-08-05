import { useState } from 'react';
import { cn } from '@/lib/utils';
import { heroConfig } from '@/config';

/**
 * COMPARADOR de las tres propuestas para los accesos de la portada.
 *
 * Ruta oculta (/demo-accesos): no está en paginasConfig, así que no sale ni en
 * el menú ni en el mapa del sitio. Es una herramienta de decisión, no una
 * página de la web — cuando se elija una, esto se borra.
 *
 * Va sobre el fotograma FINAL del hero de verdad y con las fuentes de verdad:
 * comparar sobre una maqueta con otras letras no sirve para decidir.
 */

const FOTOGRAMA = '/images/hero-scrub/f-060.webp';
const HUESO = '#FBF7F5';

/** Metraje de muestra para la propuesta A. Uno por acceso. */
const MUESTRAS = [
  '/videos/vision-arriba.mp4',
  '/videos/vision-abajo.mp4',
  '/videos/campanas/vivapop-festival-aftermovie-2024.mp4',
  '/videos/campanas/origin-gunn-tazas-2025.mp4',
];

function Escenario({
  letra,
  titulo,
  nota,
  children,
}: {
  letra: string;
  titulo: string;
  nota: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-10 lg:pt-14">
      <div className="container-large px-6 lg:px-12 mb-6">
        <div className="flex items-baseline gap-4">
          <span className="font-geist-mono text-[0.62rem] tracking-[0.34em] text-exvia-red-text">
            {letra}
          </span>
          <h2 className="font-display uppercase text-[clamp(1.3rem,2.6vw,2.2rem)] leading-none" style={{ color: HUESO }}>
            {titulo}
          </h2>
        </div>
        <p className="mt-3 max-w-[46rem] font-deco font-light text-white/60 text-[0.95rem] leading-[1.7]">
          {nota}
        </p>
      </div>

      {/* El encuadre: mismo fotograma final que ve el visitante al terminar el
          scroll de la portada. */}
      <div
        className="relative w-full aspect-[16/9] overflow-hidden bg-black bg-cover bg-center"
        style={{ backgroundImage: `url(${FOTOGRAMA})` }}
      >
        {children}
      </div>
    </section>
  );
}

/* ─────────────── A · VENTANAS AL MATERIAL ─────────────── */
function VentanasAlMaterial() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="group/lista grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5 w-fit">
        {heroConfig.zones.map((z, i) => (
          <a
            key={z.href}
            href={z.href}
            onClick={(e) => e.preventDefault()}
            className={cn(
              'relative block overflow-hidden border border-white/40',
              'w-[8rem] h-24 sm:w-44 sm:h-28 lg:w-56 lg:h-36',
              'transition-[opacity,border-color] duration-500 ease-out-quart',
              // Al señalar una, las demás se apagan. La señalada manda sobre la
              // regla del grupo, por eso el !opacity-100.
              'group-hover/lista:opacity-35 hover:!opacity-100 hover:border-exvia-red'
            )}
          >
            <video
              src={MUESTRAS[i]}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.1] transition-[filter,transform] duration-700 ease-out-quart hover:grayscale-0 hover:scale-[1.04]"
            />
            <span aria-hidden className="absolute inset-0 bg-black/45" />
            <span className="absolute left-3 bottom-3 right-3 font-geist-mono uppercase text-[0.58rem] sm:text-[0.68rem] tracking-[0.18em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
              {z.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── B · MARQUESINA EN NEGATIVO ─────────────── */
function MarquesinaEnNegativo() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5 w-fit">
        {heroConfig.zones.map((z, i) => (
          <a
            key={z.href}
            href={z.href}
            onClick={(e) => e.preventDefault()}
            className="group relative flex flex-col justify-end overflow-hidden border border-white/45 bg-black/65 backdrop-blur-[2px] w-[8rem] h-24 sm:w-44 sm:h-28 lg:w-56 lg:h-36 p-3 lg:p-4"
          >
            {/* El barrido sube desde abajo, como una persiana */}
            <span
              aria-hidden
              className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[420ms] ease-out-quart group-hover:scale-y-100"
              style={{ backgroundColor: HUESO }}
            />
            <span className="relative font-geist-mono text-[0.55rem] tracking-[0.28em] text-exvia-red-text transition-colors duration-300 group-hover:text-exvia-red">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'relative font-display uppercase leading-[0.95] tracking-[-0.01em] mt-1',
                'text-[clamp(0.95rem,1.9vw,1.5rem)] text-[#FBF7F5]',
                'transition-colors duration-300 group-hover:text-black'
              )}
            >
              {z.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── C · CLAQUETA ─────────────── */
function Claqueta() {
  return (
    <div className="group/lista absolute inset-0 flex items-center justify-center px-6">
      {/* La escena se apaga en cuanto el cursor entra en la lista */}
      <span
        aria-hidden
        className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover/lista:bg-black/75"
      />

      <div className="relative flex flex-col items-start gap-1 sm:gap-2">
        {heroConfig.zones.map((z) => (
          <a
            key={z.href}
            href={z.href}
            onClick={(e) => e.preventDefault()}
            className={cn(
              'group/uno relative flex items-center gap-4 font-display uppercase leading-[0.92] tracking-[-0.015em]',
              'text-[clamp(1.4rem,4.4vw,3.4rem)]',
              'text-[#FBF7F5] transition-[opacity,color] duration-300',
              'group-hover/lista:opacity-30 hover:!opacity-100 hover:!text-[#FBF7F5]'
            )}
          >
            {/* La raya roja solo sale en el que señalas */}
            <span
              aria-hidden
              className="h-px w-0 bg-exvia-red-text transition-[width] duration-300 ease-out-quart group-hover/uno:w-10 lg:group-hover/uno:w-16"
            />
            <span className="[text-shadow:0_2px_14px_rgba(0,0,0,0.85)]">{z.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function DemoAccesos() {
  const [reducido, setReducido] = useState(false);

  return (
    <div className={cn('bg-black pb-24', reducido && 'text-sm')}>
      <div className="container-large px-6 lg:px-12 pt-10 pb-8">
        <span className="block font-geist-mono uppercase text-[0.6rem] tracking-[0.34em] text-white/40">
          Página de trabajo — no está enlazada en la web
        </span>
        <h1 className="mt-4 font-display uppercase leading-[0.9] text-[clamp(1.8rem,5vw,3.6rem)]" style={{ color: HUESO }}>
          Tres formas de entrar
        </h1>
        <p className="mt-4 max-w-[42rem] font-deco font-light text-white/70 leading-[1.8]">
          Los tres van sobre el último fotograma del hero, que es donde aparecen los accesos
          cuando termina el scroll. Pasa el ratón por encima: lo que cambia entre las
          propuestas es justo eso.
        </p>
        <button
          type="button"
          onClick={() => setReducido((v) => !v)}
          className="mt-6 font-geist-mono uppercase text-[0.6rem] tracking-[0.24em] text-white/50 hover:text-white transition-colors border border-white/20 px-4 py-2"
        >
          {reducido ? 'Volver al tamaño normal' : 'Ver más pequeño'}
        </button>
      </div>

      <div className="flex flex-col gap-16 lg:gap-24">
        <Escenario
          letra="A"
          titulo="Ventanas al material"
          nota="Cada acceso enseña metraje de su sección, en blanco y negro. Al señalar uno recupera el color y los otros tres se apagan. Es la misma técnica de las ventanas de Nuestra Visión, así que portada y manifiesto hablarían el mismo idioma. Pide un clip corto por sección; aquí van cuatro de muestra."
        >
          <VentanasAlMaterial />
        </Escenario>

        <Escenario
          letra="B"
          titulo="Marquesina en negativo"
          nota="El mismo gesto que las filas del menú lateral: la caja se llena de hueso y el rótulo se vuelve negro. Aquí el barrido sube desde abajo, como una persiana. Es lo más barato de mantener y lo que más unifica: el mismo movimiento en el menú y en la portada."
        >
          <MarquesinaEnNegativo />
        </Escenario>

        <Escenario
          letra="C"
          titulo="Claqueta"
          nota="Sin cajas. Los rótulos en grande directamente sobre el fotograma; al entrar el cursor la escena se apaga y solo queda encendido el que señalas, con una raya roja que se abre a su izquierda. El más cinematográfico y el más delicado de contraste."
        >
          <Claqueta />
        </Escenario>
      </div>
    </div>
  );
}
