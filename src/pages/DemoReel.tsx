import { useEffect, useState } from 'react';

/**
 * COMPARADOR de las tres propuestas para el acceso al reel.
 *
 * Ruta oculta (/demo-reel), fuera de paginasConfig: no sale ni en el menú ni
 * en el mapa del sitio. Se borra en cuanto se elija una.
 *
 * Van sobre el fotograma final del hero y con las fuentes de verdad, que es
 * donde el botón vive: comparar sobre fondo liso no dice nada.
 */

const FOTOGRAMA = '/images/hero-scrub/f-060.webp';
const REEL = '/videos/reel-bucle.mp4';
const HUESO = '#FBF7F5';

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
          <span className="font-geist-mono text-[0.62rem] tracking-[0.34em] text-exvia-red-text">{letra}</span>
          <h2 className="font-display uppercase text-[clamp(1.3rem,2.6vw,2.2rem)] leading-none" style={{ color: HUESO }}>
            {titulo}
          </h2>
        </div>
        <p className="mt-3 max-w-[46rem] font-deco font-light text-white/60 text-[0.95rem] leading-[1.7]">{nota}</p>
      </div>

      <div
        className="relative w-full aspect-[16/9] overflow-hidden bg-black bg-cover bg-center"
        style={{ backgroundImage: `url(${FOTOGRAMA})` }}
      >
        {children}
      </div>
    </section>
  );
}

/* ─────────────── A · LA MIRILLA ───────────────
   El botón no es un icono: es un agujero por el que YA se está viendo el reel.
   En reposo, mudo y en blanco y negro; al acercarse crece, recupera el color y
   sube el rótulo. */
function Mirilla() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <button
        type="button"
        className="group relative grid place-items-center focus:outline-none"
        aria-label="Ver el reel completo, 92 segundos"
      >
        <span className="relative block w-28 h-28 sm:w-40 sm:h-40 lg:w-52 lg:h-52 rounded-full overflow-hidden ring-1 ring-white/60 transition-[transform,box-shadow] duration-[600ms] ease-out-quart group-hover:scale-110 group-hover:ring-exvia-red group-hover:shadow-[0_0_60px_-10px_rgba(184,68,42,0.8)]">
          <video
            src={REEL}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.15] brightness-[0.8] transition-[filter] duration-[600ms] ease-out-quart group-hover:grayscale-0 group-hover:brightness-100"
          />
          {/* El triángulo se retira al acercarse: si ya se ve la película
              moviéndose dentro, el icono sobra y solo tapa. */}
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center transition-opacity duration-300 group-hover:opacity-0"
          >
            <span className="ml-1 block w-0 h-0 border-y-[11px] border-y-transparent border-l-[18px] border-l-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" />
          </span>
        </span>

        <span className="mt-5 flex items-center gap-3 font-geist-mono uppercase text-[0.6rem] sm:text-[0.7rem] tracking-[0.3em] text-white/70 transition-[opacity,transform] duration-500 ease-out-quart group-hover:text-white group-hover:-translate-y-1">
          Ver reel completo
          <span className="text-exvia-red-text">92&Prime;</span>
        </span>
      </button>
    </div>
  );
}

/* ─────────────── B · LA COLA DE ARRANQUE ───────────────
   La cuenta atrás de laboratorio: cruz de encuadre, aguja girando y el número
   cambiando. Cero archivos: todo es SVG y un contador. */
function ColaDeArranque() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const t = window.setInterval(() => setN((v) => (v === 1 ? 3 : v - 1)), 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 grid place-items-center">
      <button type="button" className="group relative grid place-items-center focus:outline-none" aria-label="Ver el reel completo">
        <span className="relative block w-28 h-28 sm:w-40 sm:h-40 lg:w-52 lg:h-52">
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" aria-hidden>
            <circle cx="100" cy="100" r="96" fill="rgba(0,0,0,0.55)" stroke={HUESO} strokeWidth="1.5" />
            <circle cx="100" cy="100" r="62" fill="none" stroke={HUESO} strokeWidth="1" opacity="0.45" />
            {/* Cruz de encuadre: los cuatro brazos, no un aspa entera */}
            <path d="M100 4 V44 M100 156 V196 M4 100 H44 M156 100 H196" stroke={HUESO} strokeWidth="1.5" opacity="0.8" />
            {/* La aguja, girando como en la cola de arranque */}
            <g className="origin-center animate-[aguja_1s_linear_infinite]" style={{ transformOrigin: '100px 100px' }}>
              <path d="M100 100 L100 8 A92 92 0 0 1 152 24 Z" fill={HUESO} opacity="0.16" />
              <line x1="100" y1="100" x2="100" y2="8" stroke={HUESO} strokeWidth="2" />
            </g>
            <text
              x="100"
              y="100"
              textAnchor="middle"
              dominantBaseline="central"
              fill={HUESO}
              fontFamily="Anton, 'Arial Narrow', sans-serif"
              fontSize="86"
              className="transition-[fill] duration-300 group-hover:fill-[#DA5C40]"
            >
              {n}
            </text>
          </svg>
        </span>

        <span className="mt-5 font-geist-mono uppercase text-[0.6rem] sm:text-[0.7rem] tracking-[0.3em] text-white/70 group-hover:text-white transition-colors">
          Ver reel
        </span>
      </button>
    </div>
  );
}

/* ─────────────── C · LETRAS CON METRAJE ───────────────
   El reel corriendo por dentro de las letras. Rectángulo negro con la palabra
   recortada por una máscara SVG; el vídeo solo asoma por el hueco. */
function LetrasReel() {
  return (
    <div className="absolute inset-0 grid place-items-center px-6">
      <button type="button" className="group relative block w-full max-w-3xl focus:outline-none" aria-label="Ver el reel completo">
        <span className="relative block w-full aspect-[400/110] overflow-hidden">
          <video
            src={REEL}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out-quart group-hover:scale-105"
          />
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 110" aria-hidden>
            <defs>
              <mask id="recorte-reel">
                <rect width="400" height="110" fill="white" />
                <text
                  x="200"
                  y="55"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="black"
                  fontFamily="Anton, 'Arial Narrow', sans-serif"
                  fontSize="72"
                  letterSpacing="-1"
                >
                  VER REEL
                </text>
              </mask>
            </defs>
            <rect width="400" height="110" fill="black" mask="url(#recorte-reel)" />
          </svg>
        </span>
        <span className="mt-4 block font-geist-mono uppercase text-[0.6rem] tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">
          92 segundos
        </span>
      </button>
    </div>
  );
}

export function DemoReel() {
  return (
    <div className="bg-black pb-24">
      <div className="container-large px-6 lg:px-12 pt-10 pb-8">
        <span className="block font-geist-mono uppercase text-[0.6rem] tracking-[0.34em] text-white/40">
          Página de trabajo — no está enlazada en la web
        </span>
        <h1 className="mt-4 font-display uppercase leading-[0.9] text-[clamp(1.8rem,5vw,3.6rem)]" style={{ color: HUESO }}>
          Tres formas de entrar al reel
        </h1>
        <p className="mt-4 max-w-[42rem] font-deco font-light text-white/70 leading-[1.8]">
          Las tres van sobre el fotograma final del hero, que es donde vive el botón. Pasa el
          ratón por encima.
        </p>
      </div>

      <div className="flex flex-col gap-16 lg:gap-24">
        <Escenario
          letra="A"
          titulo="La mirilla"
          nota="El botón deja de ser un icono y pasa a ser un agujero por el que YA se está viendo el reel, mudo y en blanco y negro. Al acercarte crece, recupera el color y el triángulo se retira: si la película ya se mueve dentro, el icono solo tapa. Reutiliza reel-bucle.mp4, que está huérfano desde que cambiamos Nuestra Visión, y habla el idioma de ventanas del resto de la web."
        >
          <Mirilla />
        </Escenario>

        <Escenario
          letra="B"
          titulo="La cola de arranque"
          nota="La cuenta atrás de laboratorio: cruz de encuadre, aguja girando y el número cambiando. Cero archivos y cero peso, todo es SVG. Muy de sala de proyección, pero es un guiño de gremio: lo reconoces tú, no necesariamente un cliente."
        >
          <ColaDeArranque />
        </Escenario>

        <Escenario
          letra="C"
          titulo="Letras con metraje"
          nota="El reel corriendo por dentro de las letras. Muy potente, pero ahí arriba compite con el titular y con las persianas por la misma atención."
        >
          <LetrasReel />
        </Escenario>
      </div>
    </div>
  );
}
