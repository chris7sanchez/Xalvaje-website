import { useEffect, useRef, useState } from 'react';
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

/* ─────────────── D · PERSIANAS (hover-expand, tipo skiper35) ───────────────
   Cuatro lamas del mismo ancho con el rótulo en vertical. La que señalas se
   abre y las otras tres se estrechan; al abrirse recupera el color y el rótulo
   pasa a horizontal. El reparto va por `flex-grow` desde el estado, no por CSS
   a secas: hace falta que las NO señaladas también reaccionen, y eso con
   :hover suelto no se puede expresar. */
function Persianas() {
  const [activa, setActiva] = useState<number | null>(null);

  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div
        className="flex w-full max-w-5xl h-[52%] sm:h-[62%] gap-1.5 lg:gap-2"
        onMouseLeave={() => setActiva(null)}
      >
        {heroConfig.zones.map((z, i) => {
          const abierta = activa === i;
          return (
            <a
              key={z.href}
              href={z.href}
              onClick={(e) => e.preventDefault()}
              onMouseEnter={() => setActiva(i)}
              onFocus={() => setActiva(i)}
              aria-label={z.label}
              className={cn(
                'relative block overflow-hidden border transition-[flex-grow,border-color] duration-[520ms] ease-out-quart',
                abierta ? 'border-exvia-red' : 'border-white/30'
              )}
              style={{ flexGrow: abierta ? 2.6 : 1, flexBasis: 0 }}
            >
              <video
                src={MUESTRAS[i]}
                autoPlay
                loop
                muted
                playsInline
                aria-hidden
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-[filter] duration-[520ms] ease-out-quart',
                  abierta ? 'grayscale-0' : 'grayscale contrast-[1.15]'
                )}
              />
              <span
                aria-hidden
                className={cn(
                  'absolute inset-0 transition-colors duration-[520ms]',
                  abierta ? 'bg-black/25' : 'bg-black/60'
                )}
              />

              {/* Rótulo en vertical mientras la lama está estrecha. Se lee de
                  abajo arriba, como el PRODUCCIONES del logotipo. */}
              <span
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 bottom-4 font-geist-mono uppercase text-[0.58rem] sm:text-[0.66rem] tracking-[0.22em] text-white whitespace-nowrap',
                  'transition-opacity duration-300',
                  abierta ? 'opacity-0' : 'opacity-100'
                )}
                style={{ writingMode: 'vertical-rl', transform: 'translateX(-50%) rotate(180deg)' }}
              >
                {z.label}
              </span>

              {/* Y en horizontal, grande, cuando se abre */}
              <span
                className={cn(
                  'absolute left-4 lg:left-6 bottom-4 lg:bottom-5 right-4 font-display uppercase leading-[0.95] tracking-[-0.01em]',
                  'text-[clamp(1rem,2.2vw,1.9rem)] transition-opacity duration-300 delay-100',
                  abierta ? 'opacity-100' : 'opacity-0'
                )}
                style={{ color: HUESO }}
              >
                {z.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── E · LETRAS CON METRAJE DENTRO ───────────────
   El vídeo va debajo y encima se pone un SVG que es un rectángulo negro con
   las letras RECORTADAS. Así el metraje solo asoma por dentro de la palabra.

   Se hace con una máscara dentro del propio SVG y no con `mask-image` en CSS
   apuntando al SVG: eso último tiene un soporte irregular entre navegadores.
   Un rect enmascarado es SVG de toda la vida y funciona en todos. */
function LetrasConMetraje() {
  return (
    <div className="absolute inset-0 grid grid-cols-2 gap-2 lg:gap-3 p-4 lg:p-8">
      {heroConfig.zones.map((z, i) => {
        const id = `recorte-${i}`;
        return (
          <a
            key={z.href}
            href={z.href}
            onClick={(e) => e.preventDefault()}
            className="group relative block overflow-hidden bg-black"
          >
            <video
              src={MUESTRAS[i]}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out-quart group-hover:scale-105"
            />

            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 120" aria-hidden>
              <defs>
                <mask id={id}>
                  {/* Blanco = tapa, negro = deja pasar. Las letras van en negro,
                      así que son el único hueco por el que se ve el vídeo. */}
                  <rect width="400" height="120" fill="white" />
                  <text
                    x="200"
                    y="60"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="black"
                    fontFamily="Anton, 'Arial Narrow', sans-serif"
                    fontSize="46"
                    letterSpacing="-0.5"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {z.label.replace(/[¿?]/g, '')}
                  </text>
                </mask>
              </defs>
              <rect width="400" height="120" fill="black" mask={`url(#${id})`} />
            </svg>

            <span
              aria-hidden
              className="absolute inset-0 ring-1 ring-inset ring-white/15 group-hover:ring-exvia-red transition-colors duration-300"
            />
            <span className="sr-only">{z.label}</span>
          </a>
        );
      })}
    </div>
  );
}

/* ─────────────── F · LINTERNA ───────────────
   Dos copias del fotograma: la de abajo apagada y en gris, la de arriba a
   color y recortada por un círculo que sigue al cursor. */
function Linterna() {
  const caja = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      ref={caja}
      className="absolute inset-0 overflow-hidden"
      onMouseMove={(e) => {
        const r = caja.current?.getBoundingClientRect();
        if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseLeave={() => setPos(null)}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center grayscale brightness-[0.35]"
        style={{ backgroundImage: `url(${FOTOGRAMA})` }}
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
        style={{
          backgroundImage: `url(${FOTOGRAMA})`,
          opacity: pos ? 1 : 0,
          // El círculo no tiene el borde duro: se deshilacha, que es como cae
          // la luz de verdad.
          WebkitMaskImage: pos
            ? `radial-gradient(circle 190px at ${pos.x}px ${pos.y}px, #000 45%, transparent 100%)`
            : 'none',
          maskImage: pos
            ? `radial-gradient(circle 190px at ${pos.x}px ${pos.y}px, #000 45%, transparent 100%)`
            : 'none',
        }}
      />

      <div className="absolute inset-0 grid grid-cols-2 place-items-center gap-4 px-8">
        {heroConfig.zones.map((z) => (
          <a
            key={z.href}
            href={z.href}
            onClick={(e) => e.preventDefault()}
            className="font-display uppercase leading-none tracking-[-0.01em] text-[clamp(1rem,2.6vw,2.1rem)] text-[#FBF7F5] [text-shadow:0_2px_16px_rgba(0,0,0,0.95)] hover:text-exvia-red-text transition-colors duration-300"
          >
            {z.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── G · DESCIFRADO ───────────────
   El rótulo se resuelve desde caracteres revueltos, como una cola de arranque
   de laboratorio. Al señalarlo se vuelve a revolver y se recompone. */
const REVOLTIJO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/*';

function Descifrado({ texto, arranque }: { texto: string; arranque: number }) {
  const [salida, setSalida] = useState(texto);
  const reloj = useRef<number | null>(null);

  const revolver = (retraso = 0) => {
    if (reloj.current) window.clearInterval(reloj.current);
    let paso = 0;
    const empezar = () => {
      reloj.current = window.setInterval(() => {
        paso += 1;
        setSalida(
          texto
            .split('')
            .map((c, i) => {
              if (c === ' ') return ' ';
              // Cada letra se fija a su turno: la palabra se revela de
              // izquierda a derecha en vez de aparecer de golpe.
              if (i < paso / 2) return c;
              return REVOLTIJO[Math.floor(Math.random() * REVOLTIJO.length)];
            })
            .join('')
        );
        if (paso / 2 >= texto.length) {
          if (reloj.current) window.clearInterval(reloj.current);
          setSalida(texto);
        }
      }, 45);
    };
    if (retraso) window.setTimeout(empezar, retraso);
    else empezar();
  };

  useEffect(() => {
    revolver(arranque);
    return () => { if (reloj.current) window.clearInterval(reloj.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span onMouseEnter={() => revolver()} className="tabular-nums">
      {salida}
    </span>
  );
}

function Cifrados() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 px-6">
      {heroConfig.zones.map((z, i) => (
        <a
          key={z.href}
          href={z.href}
          onClick={(e) => e.preventDefault()}
          className="group flex items-center gap-4 font-display uppercase leading-[0.95] tracking-[0.02em] text-[clamp(1.1rem,3.4vw,2.6rem)] text-[#FBF7F5] hover:text-exvia-red-text transition-colors duration-200 [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]"
        >
          <span className="font-geist-mono text-[0.55rem] tracking-[0.3em] text-exvia-red-text/70">
            {String(i + 1).padStart(2, '0')}
          </span>
          <Descifrado texto={z.label.replace(/[¿?]/g, '')} arranque={i * 260} />
        </a>
      ))}
    </div>
  );
}

/* ─────────────── H · CARTELES DE PIE ───────────────
   La idea del showcase 3D, pero con transformaciones CSS en vez de Three.js:
   misma sensación de objeto y ni un kilobyte de dependencia nueva. Las láminas
   giran siguiendo al cursor sobre el eje vertical. */
const CARTELES = [
  '/images/pantera-2a.webp',
  '/images/regalo-3a.webp',
  '/images/viaje-1a.webp',
  '/images/anadas-cartel.webp',
];

function CartelesDePie() {
  const [giro, setGiro] = useState(0);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center gap-4 lg:gap-10 px-6"
      style={{ perspective: '1400px' }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setGiro(((e.clientX - r.left) / r.width - 0.5) * 34);
      }}
      onMouseLeave={() => setGiro(0)}
    >
      {heroConfig.zones.map((z, i) => (
        <a
          key={z.href}
          href={z.href}
          onClick={(e) => e.preventDefault()}
          className="group relative block w-[18%] max-w-[9rem] transition-transform duration-500 ease-out-quart hover:-translate-y-2"
          style={{ transformStyle: 'preserve-3d', transform: `rotateY(${giro}deg)` }}
        >
          <div className="relative shadow-[0_28px_50px_-20px_rgba(0,0,0,0.95)]">
            <img
              src={CARTELES[i]}
              alt=""
              aria-hidden
              className="w-full h-auto ring-1 ring-white/20"
            />
            {/* El lomo: una franja lateral que da el grosor de la pieza */}
            <span
              aria-hidden
              className="absolute inset-y-0 -left-[6px] w-[6px] bg-gradient-to-r from-black to-neutral-700"
              style={{ transform: 'rotateY(-90deg)', transformOrigin: 'right center' }}
            />
            <span aria-hidden className="absolute inset-0 bg-black/45 group-hover:bg-black/10 transition-colors duration-500" />
          </div>
          <span className="mt-3 block text-center font-geist-mono uppercase text-[0.5rem] sm:text-[0.58rem] tracking-[0.2em] text-white">
            {z.label}
          </span>
        </a>
      ))}
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
          Ocho formas de entrar
        </h1>
        <p className="mt-4 max-w-[42rem] font-deco font-light text-white/70 leading-[1.8]">
          Las ocho van sobre el último fotograma del hero, que es donde aparecen los accesos
          cuando termina el scroll. Pasa el ratón por encima: lo que cambia entre las
          propuestas es justo eso. Las cuatro primeras salieron de tus referencias; las
          cuatro últimas, de repasar seis catálogos de componentes.
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

        <Escenario
          letra="D"
          titulo="Persianas"
          nota="La idea del skiper35 que me pasaste, traída a nuestro terreno: cuatro lamas del mismo ancho con el rótulo en vertical, y la que señalas se abre en ventana mientras las otras tres se estrechan. Al abrirse recupera el color y el nombre pasa a horizontal en Anton. Es la que más se parece a una cartelera y la única de las cuatro donde el propio gesto de elegir ya enseña trabajo."
        >
          <Persianas />
        </Escenario>

        <Escenario
          letra="E"
          titulo="Letras con metraje dentro"
          nota="El vídeo se reproduce DENTRO de las letras: encima va un rectángulo negro con la palabra recortada, así que el metraje solo asoma por el hueco de los caracteres. Es la máscara de siempre, pero aplicada a la tipografía. Para una productora es casi una declaración: las palabras están hechas de sus películas. Y no necesita ni un archivo nuevo."
        >
          <LetrasConMetraje />
        </Escenario>

        <Escenario
          letra="F"
          titulo="Linterna"
          nota="El fotograma se queda apagado y en gris, y un círculo de luz sigue al cursor destapándolo a color. El borde del círculo se deshilacha en vez de cortar en seco, que es como cae la luz de verdad. Encaja con lo que ya cuenta el hero: una nave, una bombilla y una persiana."
        >
          <Linterna />
        </Escenario>

        <Escenario
          letra="G"
          titulo="Descifrado"
          nota="Los rótulos se resuelven desde caracteres revueltos, de izquierda a derecha, como una cola de arranque de laboratorio o un código de tiempo. Al señalar uno se vuelve a revolver y se recompone. Es la más barata de las ocho: cero archivos, cero dependencias, y muy de sala de montaje."
        >
          <Cifrados />
        </Escenario>

        <Escenario
          letra="H"
          titulo="Carteles de pie"
          nota="Los accesos como piezas físicas con lomo y cara, que se orientan hacia el cursor. Aquí está hecho con transformaciones CSS y no con Three.js: la misma sensación de objeto sin sumar una dependencia de las gordas. Los carteles son de muestra, luego irían los de cada sección."
        >
          <CartelesDePie />
        </Escenario>
      </div>
    </div>
  );
}
