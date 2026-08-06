import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { heroConfig } from '@/config';

/**
 * COMPARADOR de propuestas para el MENÚ PRINCIPAL de la portada.
 *
 * Ruta oculta (/demo-menu), fuera de paginasConfig. Se borra al elegir.
 *
 * Lo que se compara aquí NO son cuatro estilos de botón: son cuatro MANERAS DE
 * NAVEGAR distintas. Cada una cambia el gesto que hace el visitante —arrastrar,
 * apuntar, barrer, elegir señal— y por eso hay que probarlas, no mirarlas.
 */

const FOTOGRAMA = '/images/hero-scrub/f-060.webp';
const HUESO = '#FBF7F5';
const Z = heroConfig.zones;

function Escenario({
  letra, titulo, gesto, nota, children,
}: {
  letra: string; titulo: string; gesto: string; nota: string; children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-10 lg:pt-14">
      <div className="container-large px-6 lg:px-12 mb-6">
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="font-geist-mono text-[0.62rem] tracking-[0.34em] text-exvia-red-text">{letra}</span>
          <h2 className="font-display uppercase text-[clamp(1.3rem,2.6vw,2.2rem)] leading-none" style={{ color: HUESO }}>
            {titulo}
          </h2>
          <span className="font-geist-mono uppercase text-[0.55rem] tracking-[0.28em] text-white/40 border border-white/20 px-2 py-1">
            gesto: {gesto}
          </span>
        </div>
        <p className="mt-3 max-w-[46rem] font-deco font-light text-white/60 text-[0.95rem] leading-[1.7]">{nota}</p>
      </div>
      <div
        className="relative w-full aspect-[16/9] overflow-hidden bg-black bg-cover bg-center select-none"
        style={{ backgroundImage: `url(${FOTOGRAMA})` }}
      >
        {children}
      </div>
    </section>
  );
}

/* ═══════════ I · LA MOVIOLA ═══════════
   Una tira de película que se ARRASTRA. En el centro hay una ventanilla fija
   —la de la moviola— y la sección que quede dentro es la que se abre. El
   arrastre lleva inercia y frena solo, y al soltar encaja en el fotograma más
   cercano: una tira de celuloide no se queda a medias entre dos. */
function Moviola() {
  const pista = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dentro, setDentro] = useState(0);
  const arrastre = useRef<{ activo: boolean; x0: number; base: number; v: number; t: number } | null>(null);
  const ANCHO = 300; // ancho de cada fotograma + separación

  const encajar = (px: number) => {
    const i = Math.max(0, Math.min(Z.length - 1, Math.round(-px / ANCHO)));
    setDentro(i);
    setX(-i * ANCHO);
  };

  useEffect(() => {
    const mover = (e: PointerEvent) => {
      const a = arrastre.current;
      if (!a?.activo) return;
      const ahora = performance.now();
      const nuevo = a.base + (e.clientX - a.x0);
      a.v = (nuevo - x) / Math.max(1, ahora - a.t);
      a.t = ahora;
      setX(nuevo);
      setDentro(Math.max(0, Math.min(Z.length - 1, Math.round(-nuevo / ANCHO))));
    };
    const soltar = () => {
      const a = arrastre.current;
      if (!a?.activo) return;
      a.activo = false;
      // Inercia: se deja correr lo que llevaba y se encaja donde caiga.
      encajar(x + a.v * 180);
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    return () => { window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', soltar); };
  }, [x]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* La ventanilla: lo único que no se mueve */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="w-[264px] h-[152px] sm:w-[280px] sm:h-[160px] ring-2 ring-exvia-red" />
        <span className="absolute -top-7 left-0 font-geist-mono uppercase text-[0.5rem] tracking-[0.3em] text-exvia-red-text">
          ventanilla
        </span>
      </div>

      <div
        ref={pista}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          arrastre.current = { activo: true, x0: e.clientX, base: x, v: 0, t: performance.now() };
        }}
        className="absolute inset-0 flex items-center cursor-grab active:cursor-grabbing"
      >
        {/* El centrado va con `left-1/2` sobre el contenedor y NO con un 50 %
            dentro del translate: en un transform, los porcentajes se miden
            sobre el PROPIO elemento, y como la tira mide cuatro fotogramas de
            ancho, ese 50 % la desplazaba 54 px fuera de la ventanilla. */}
        <div
          className="absolute left-1/2 flex items-center gap-[36px] transition-transform duration-[420ms] ease-out-quart"
          style={{ transform: `translateX(${x - 132}px)`, transitionDuration: arrastre.current?.activo ? '0ms' : undefined }}
        >
          {Z.map((z, i) => (
            <div key={z.href} className="relative shrink-0 w-[264px]">
              {/* Perforaciones: es lo que la hace película y no un carrusel */}
              <div className="flex justify-between px-1 mb-1">
                {Array.from({ length: 8 }, (_, k) => (
                  <span key={k} className="block w-4 h-2.5 bg-black/70 ring-1 ring-white/25 rounded-[2px]" />
                ))}
              </div>
              <div
                className={cn(
                  'relative h-[152px] overflow-hidden transition-[filter,opacity] duration-500',
                  dentro === i ? 'opacity-100' : 'opacity-45 grayscale'
                )}
              >
                <img src={z.poster} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute left-3 bottom-2 font-display uppercase text-[1.1rem] leading-none" style={{ color: HUESO }}>
                  {z.label}
                </span>
              </div>
              <div className="flex justify-between px-1 mt-1">
                {Array.from({ length: 8 }, (_, k) => (
                  <span key={k} className="block w-4 h-2.5 bg-black/70 ring-1 ring-white/25 rounded-[2px]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-geist-mono uppercase text-[0.55rem] tracking-[0.3em] text-white/60">
        arrastra la tira · {Z[dentro].label}
      </span>
    </div>
  );
}

/* ═══════════ II · LA X ES EL MAPA ═══════════
   El logotipo hace de menú. Cuatro brazos, cuatro secciones: al apuntar uno se
   ilumina SU cuadrante del fotograma y el resto de la nave se apaga. La marca
   deja de ser un adorno en una esquina y pasa a ser el mando. */
const CUADRANTES = [
  { clip: 'polygon(50% 50%, 0% 0%, 50% 0%)', pos: 'left-[18%] top-[16%]' },
  { clip: 'polygon(50% 50%, 50% 0%, 100% 0%)', pos: 'right-[18%] top-[16%]' },
  { clip: 'polygon(50% 50%, 0% 100%, 50% 100%)', pos: 'left-[18%] bottom-[16%]' },
  { clip: 'polygon(50% 50%, 50% 100%, 100% 100%)', pos: 'right-[18%] bottom-[16%]' },
];

function LaXEsElMapa() {
  const [activo, setActivo] = useState<number | null>(null);

  return (
    <div className="absolute inset-0" onMouseLeave={() => setActivo(null)}>
      {/* La nave se apaga entera y solo se enciende el cuadrante señalado */}
      <span
        aria-hidden
        className={cn('absolute inset-0 transition-colors duration-500', activo === null ? 'bg-black/45' : 'bg-black/80')}
      />
      {activo !== null && (
        <span
          aria-hidden
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url(${FOTOGRAMA})`, clipPath: CUADRANTES[activo].clip }}
        />
      )}

      {/* Los cuatro brazos de la X */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
        {[
          'M50 50 L14 8', 'M50 50 L86 8', 'M50 50 L14 92', 'M50 50 L86 92',
        ].map((d, i) => (
          <path
            key={d}
            d={d}
            stroke={activo === i ? '#DA5C40' : HUESO}
            strokeWidth={activo === i ? 1.1 : 0.5}
            opacity={activo === null || activo === i ? 0.95 : 0.25}
            vectorEffect="non-scaling-stroke"
            className="transition-[stroke,stroke-width,opacity] duration-300"
          />
        ))}
      </svg>

      {Z.map((z, i) => (
        <button
          key={z.href}
          type="button"
          onMouseEnter={() => setActivo(i)}
          onFocus={() => setActivo(i)}
          className={cn(
            'absolute font-display uppercase leading-none tracking-[-0.01em] transition-[color,transform] duration-300',
            'text-[clamp(0.85rem,2.1vw,1.9rem)]',
            CUADRANTES[i].pos,
            activo === i ? 'text-exvia-red-text scale-110' : 'text-[#FBF7F5]'
          )}
          style={{ textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}
        >
          {z.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════ III · EL VIDEO VILLAGE ═══════════
   Cuatro monitores de rodaje. Todos con nieve; el que señalas TOMA SEÑAL: la
   nieve se va, entra la imagen y arranca su código de tiempo. Los otros tres se
   degradan. No es un menú: es elegir a qué cámara mirar. */
function VideoVillage() {
  const [señal, setSeñal] = useState<number | null>(null);
  const [tc, setTc] = useState(0);

  useEffect(() => {
    if (señal === null) return;
    setTc(0);
    const t = window.setInterval(() => setTc((v) => v + 1), 40);
    return () => window.clearInterval(t);
  }, [señal]);

  const codigo = (f: number) =>
    `${String(Math.floor(f / 1500) % 24).padStart(2, '0')}:${String(Math.floor(f / 25) % 60).padStart(2, '0')}:${String(f % 25).padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 grid grid-cols-2 gap-3 lg:gap-5 p-5 lg:p-10" onMouseLeave={() => setSeñal(null)}>
      {Z.map((z, i) => {
        const vivo = señal === i;
        return (
          <button
            key={z.href}
            type="button"
            onMouseEnter={() => setSeñal(i)}
            onFocus={() => setSeñal(i)}
            className={cn(
              'group relative overflow-hidden bg-black transition-[border-color,transform] duration-300',
              'border-2', vivo ? 'border-exvia-red scale-[1.015]' : 'border-white/25'
            )}
          >
            <img
              src={z.poster}
              alt=""
              aria-hidden
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-[filter,opacity] duration-500',
                vivo ? 'opacity-100' : 'opacity-35 grayscale contrast-[1.4]'
              )}
            />
            {/* Nieve: se retira solo del monitor que toma señal */}
            <span
              aria-hidden
              className={cn('absolute inset-0 transition-opacity duration-500 mix-blend-screen', vivo ? 'opacity-0' : 'opacity-60')}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
              }}
            />
            {/* Líneas de barrido, siempre */}
            <span
              aria-hidden
              className="absolute inset-0 opacity-25"
              style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0 1px, transparent 1px 3px)' }}
            />

            <span className="absolute top-2 left-2 flex items-center gap-2 font-geist-mono uppercase text-[0.5rem] sm:text-[0.55rem] tracking-[0.2em]">
              <span className={cn('block w-1.5 h-1.5 rounded-full transition-colors', vivo ? 'bg-exvia-red-text animate-pulse' : 'bg-white/30')} />
              <span className={vivo ? 'text-exvia-red-text' : 'text-white/45'}>{vivo ? 'REC' : 'STBY'}</span>
            </span>
            <span className="absolute top-2 right-2 font-geist-mono text-[0.5rem] sm:text-[0.55rem] tracking-[0.12em] text-white/70 tabular-nums">
              {vivo ? codigo(tc) : '--:--:--'}
            </span>
            <span
              className={cn(
                'absolute left-3 bottom-2 font-display uppercase leading-none transition-colors duration-300',
                'text-[clamp(0.8rem,1.9vw,1.5rem)]',
                vivo ? 'text-exvia-red-text' : 'text-[#FBF7F5]'
              )}
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
            >
              CAM {i + 1} · {z.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════ IV · LA MESA DE LUZ ═══════════
   Los cuatro accesos en NEGATIVO sobre la mesa, y una lupa que sigue al cursor
   revelando el positivo. Se navega barriendo, como quien busca el fotograma
   bueno en una tira de negativos. */
function MesaDeLuz() {
  const caja = useRef<HTMLDivElement>(null);
  const [p, setP] = useState<{ x: number; y: number } | null>(null);
  const [bajo, setBajo] = useState<number | null>(null);

  return (
    <div
      ref={caja}
      className="absolute inset-0 bg-[#0d0d0d]"
      onMouseMove={(e) => {
        const r = caja.current?.getBoundingClientRect();
        if (!r) return;
        setP({ x: e.clientX - r.left, y: e.clientY - r.top });
        setBajo(Math.min(Z.length - 1, Math.floor(((e.clientX - r.left) / r.width) * Z.length)));
      }}
      onMouseLeave={() => { setP(null); setBajo(null); }}
    >
      {/* La tira, en negativo */}
      <div className="absolute inset-0 flex">
        {Z.map((z) => (
          <div key={z.href} className="relative flex-1 border-x border-white/10">
            <img src={z.poster} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover invert brightness-[0.85] contrast-[0.9]" />
          </div>
        ))}
      </div>

      {/* La lupa: la misma tira SIN invertir, recortada por un círculo */}
      {p && (
        <div
          aria-hidden
          className="absolute inset-0 flex"
          style={{
            WebkitMaskImage: `radial-gradient(circle 130px at ${p.x}px ${p.y}px, #000 78%, transparent 100%)`,
            maskImage: `radial-gradient(circle 130px at ${p.x}px ${p.y}px, #000 78%, transparent 100%)`,
          }}
        >
          {Z.map((z) => (
            <div key={z.href} className="relative flex-1">
              <img src={z.poster} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Aro de la lupa */}
      {p && (
        <span
          aria-hidden
          className="absolute rounded-full ring-2 ring-exvia-red/80 pointer-events-none"
          style={{ width: 260, height: 260, left: p.x - 130, top: p.y - 130 }}
        />
      )}

      <div className="absolute inset-0 flex pointer-events-none">
        {Z.map((z, i) => (
          <div key={z.href} className="flex-1 grid place-items-end pb-5">
            <span
              className={cn(
                'font-display uppercase leading-none transition-colors duration-200 text-[clamp(0.75rem,1.7vw,1.35rem)]',
                bajo === i ? 'text-exvia-red-text' : 'text-black/70'
              )}
              style={bajo === i ? { textShadow: '0 2px 12px rgba(0,0,0,0.9)' } : undefined}
            >
              {z.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ═══════════ V · EL PLATÓ A OSCURAS ═══════════
   Cada zona enciende su foco del plató, recortado sobre el propio fotograma,
   con parpadeo de tungsteno y un gel de color POR SECCIÓN: ámbar, blanco,
   rojo y azul. El resto se apaga casi del todo: la luz solo vale si lo demás
   está a oscuras.

   Se selecciona de dos maneras: por el rótulo de la esquina o pasando por
   ENCIMA de la propia zona (la cámara selecciona Quiénes Somos). Y abajo a la
   derecha hay un MEDIDOR con la posición del cursor en %, para que Christian
   pueda dictar las zonas exactas: "centro en tanto/tanto, llega hasta...".

   Los radios van como ELIPSE (rx ry), no como circle: un porcentaje de radio
   en circle es CSS inválido y el navegador tira la declaración entera. */
const HUMO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='h'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23h)' opacity='0.55'/%3E%3C/svg%3E\")";

const FOCOS = [
  // Mismo orden que heroConfig.zones. hot = zona sensible al ratón, en % del encuadre.
  { cx: '13%', cy: '55%', rx: '20%', ry: '34%', tinte: 'rgba(255,170,80,0.42)',  pos: 'left-[6%] top-[14%]',    hot: { left: '2%',  top: '32%', width: '22%', height: '46%' } },   // Proyectos · ÁMBAR
  { cx: '56%', cy: '14%', rx: '30%', ry: '24%', tinte: 'rgba(255,255,255,0.32)', pos: 'right-[6%] top-[14%]',   hot: { left: '34%', top: '2%',  width: '44%', height: '24%' } },   // Qué ofrecemos · BLANCO
  { cx: '24%', cy: '72%', rx: '17%', ry: '24%', tinte: 'rgba(235,85,55,0.45)',   pos: 'left-[6%] bottom-[12%]', hot: { left: '9%',  top: '56%', width: '27%', height: '36%' } },   // Quiénes somos · ROJO, desde la cámara
  { cx: '78%', cy: '62%', rx: '17%', ry: '27%', tinte: 'rgba(110,165,255,0.5)',  pos: 'right-[6%] bottom-[12%]', hot: { left: '63%', top: '40%', width: '31%', height: '48%' } },  // Nuestra visión · AZUL
];

function PlatoAOscuras() {
  const caja = useRef<HTMLDivElement>(null);
  const [foco, setFoco] = useState<number | null>(null);
  const [cerca, setCerca] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      ref={caja}
      className="absolute inset-0"
      onMouseMove={(e) => {
        const r = caja.current?.getBoundingClientRect();
        if (!r) return;
        setCursor({ x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) });
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.34);
        setCerca(Math.hypot(dx * 1.6, dy) < r.height * 0.34);
      }}
      onMouseLeave={() => { setFoco(null); setCerca(false); setCursor(null); }}
    >
      {/* La oscuridad: casi negro cuando algo está elegido. Sin este casi-negro
          el recorte no funciona — la luz solo vale si lo demás se apaga. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 transition-colors duration-700',
          foco !== null || cerca ? 'bg-black/[0.93]' : 'bg-black/55'
        )}
      />

      {/* Un foco por sección: imagen recortada + humo dentro del haz + gel */}
      {FOCOS.map((f, i) => {
        const mascara = `radial-gradient(ellipse ${f.rx} ${f.ry} at ${f.cx} ${f.cy}, #000 30%, transparent 96%)`;
        return (
          <span key={i} aria-hidden className={cn(foco === i ? 'opacity-100' : 'opacity-0', 'absolute inset-0 transition-opacity duration-200 pointer-events-none')}>
            <span
              className={cn('absolute inset-0 bg-cover bg-center', foco === i && 'animate-[encender_700ms_ease-out]')}
              style={{ backgroundImage: `url(${FOTOGRAMA})`, WebkitMaskImage: mascara, maskImage: mascara }}
            />
            {/* Humo: textura de turbulencia solo DENTRO del haz */}
            <span
              className="absolute inset-0 opacity-[0.14]"
              style={{ backgroundImage: HUMO, mixBlendMode: 'screen', WebkitMaskImage: mascara, maskImage: mascara }}
            />
            <span
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse ${f.rx} ${f.ry} at ${f.cx} ${f.cy}, ${f.tinte}, transparent 78%)`, mixBlendMode: 'screen' }}
            />
          </span>
        );
      })}

      {/* VER REEL: la CENITAL. Del foco de arriba al centro de la X: la imagen
          se revela a lo largo del haz y un cono volumétrico difuminado le da
          el cuerpo de luz con humo. */}
      <span aria-hidden className={cn(cerca ? 'opacity-100' : 'opacity-0', 'absolute inset-0 transition-opacity duration-300 pointer-events-none')}>
        <span
          className={cn('absolute inset-0 bg-cover bg-center', cerca && 'animate-[encender_700ms_ease-out]')}
          style={{
            backgroundImage: `url(${FOTOGRAMA})`,
            WebkitMaskImage: 'radial-gradient(ellipse 10% 30% at 50% 26%, #000 35%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 10% 30% at 50% 26%, #000 35%, transparent 100%)',
          }}
        />
        <span
          className={cn('absolute inset-0', cerca && 'animate-[encender_700ms_ease-out]')}
          style={{
            background: 'linear-gradient(to bottom, rgba(255,238,205,0.5), rgba(255,238,205,0.14) 68%, transparent 100%)',
            clipPath: 'polygon(47.4% 4%, 52.6% 4%, 60% 54%, 40% 54%)',
            filter: 'blur(14px)',
            mixBlendMode: 'screen',
          }}
        />
        <span
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: HUMO, mixBlendMode: 'screen',
            WebkitMaskImage: 'radial-gradient(ellipse 11% 32% at 50% 27%, #000 40%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 11% 32% at 50% 27%, #000 40%, transparent 100%)',
          }}
        />
      </span>

      {/* Zonas sensibles: pasar por ENCIMA de la zona ya la selecciona */}
      {FOCOS.map((f, i) => (
        <span
          key={`hot-${i}`}
          aria-hidden
          onMouseEnter={() => setFoco(i)}
          onMouseLeave={() => setFoco((v) => (v === i ? null : v))}
          className="absolute cursor-pointer"
          style={f.hot}
        />
      ))}

      {/* Las cuatro esquinas */}
      {Z.map((z, i) => (
        <button
          key={z.href}
          type="button"
          onMouseEnter={() => setFoco(i)}
          onFocus={() => setFoco(i)}
          className={cn(
            'absolute font-display uppercase leading-none tracking-[-0.01em] transition-[color,transform,opacity] duration-300',
            'text-[clamp(0.85rem,2vw,1.8rem)]',
            FOCOS[i].pos,
            foco === i ? 'text-exvia-red-text scale-110' : foco === null ? 'text-[#FBF7F5]' : 'text-[#FBF7F5]/30'
          )}
          style={{ textShadow: '0 2px 14px rgba(0,0,0,0.92)' }}
        >
          {z.label}
        </button>
      ))}

      {/* VER REEL, dentro del haz */}
      <button
        type="button"
        aria-label="Ver el reel completo"
        className={cn(
          'absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2',
          'font-display uppercase leading-none tracking-[0.02em] text-[clamp(1.5rem,4vw,3.4rem)]',
          'transition-[opacity,filter,transform] duration-500 ease-out-quart',
          cerca ? 'opacity-100 blur-0 scale-100 text-[#FBF7F5]' : 'opacity-0 blur-[10px] scale-95 pointer-events-none text-white'
        )}
        style={{ textShadow: '0 0 30px rgba(255,235,200,0.9), 0 0 70px rgba(255,220,160,0.5), 0 2px 10px rgba(0,0,0,0.8)' }}
      >
        Ver reel
      </button>

      {/* EL MEDIDOR: posición del cursor en % del encuadre, para dictar zonas */}
      {cursor && (
        <span className="absolute bottom-3 right-3 font-geist-mono text-[0.6rem] tracking-[0.2em] text-white/70 bg-black/60 px-2 py-1 tabular-nums pointer-events-none">
          {cursor.x}% · {cursor.y}%
        </span>
      )}
    </div>
  );
}

export function DemoMenu() {
  return (
    <div className="bg-black pb-24">
      <div className="container-large px-6 lg:px-12 pt-10 pb-8">
        <span className="block font-geist-mono uppercase text-[0.6rem] tracking-[0.34em] text-white/40">
          Página de trabajo — no está enlazada en la web
        </span>
        <h1 className="mt-4 font-display uppercase leading-[0.9] text-[clamp(1.8rem,5vw,3.6rem)]" style={{ color: HUESO }}>
          Cuatro maneras de navegar
        </h1>
        <p className="mt-4 max-w-[44rem] font-deco font-light text-white/70 leading-[1.8]">
          Esto no son cuatro estilos de botón: son cuatro <strong className="font-normal text-white">gestos</strong>
          {' '}distintos. Lo que cambia no es cómo se ve el menú, sino qué hace tu mano. Pruébalas —
          mirarlas no sirve.
        </p>
      </div>

      <div className="flex flex-col gap-16 lg:gap-24">
        <Escenario
          letra="V"
          titulo="El plató a oscuras"
          gesto="encender focos"
          nota="Cada zona enciende su foco con parpadeo de tungsteno, y ahora con gel POR SECCIÓN: Proyectos ÁMBAR, Qué Ofrecemos BLANCO, Quiénes Somos ROJO desde la cámara, Nuestra Visión AZUL. El resto del plató se apaga casi del todo. Se selecciona por la esquina o pasando por encima de la propia zona. VER REEL es una CENITAL: el haz baja del foco de arriba al centro de la X, con cono difuminado y humo dentro de la luz. Abajo a la derecha hay un medidor con la posición del cursor en %: muévete por la imagen y díctame las zonas exactas."
        >
          <PlatoAOscuras />
        </Escenario>

        <Escenario
          letra="I"
          titulo="La moviola"
          gesto="arrastrar"
          nota="Una tira de película con perforaciones que se arrastra con el dedo o el ratón. En el centro hay una ventanilla fija —la de la moviola— y la sección que queda dentro es la que se abre. El arrastre lleva inercia y al soltar ENCAJA en el fotograma más cercano: una tira de celuloide no se queda a medias entre dos. Es el único menú de los doce donde el visitante manipula un objeto en vez de apuntar a un sitio."
        >
          <Moviola />
        </Escenario>

        <Escenario
          letra="II"
          titulo="La X es el mapa"
          gesto="apuntar"
          nota="El logotipo hace de menú. Cuatro brazos, cuatro secciones: al apuntar uno se ilumina SU cuadrante de la nave y el resto se apaga. La marca deja de ser un adorno en una esquina y pasa a ser el mando. Es la propuesta que ninguna otra productora podría copiar sin cambiar su logo."
        >
          <LaXEsElMapa />
        </Escenario>

        <Escenario
          letra="III"
          titulo="El video village"
          gesto="elegir señal"
          nota="Cuatro monitores de rodaje. Todos con nieve y en espera; el que señalas TOMA SEÑAL: la nieve se va, entra la imagen, el piloto pasa a REC y arranca su código de tiempo real, a 25 fotogramas. Los otros tres se degradan. No estás eligiendo una sección: estás eligiendo a qué cámara mirar."
        >
          <VideoVillage />
        </Escenario>

        <Escenario
          letra="IV"
          titulo="La mesa de luz"
          gesto="barrer"
          nota="Los cuatro accesos en NEGATIVO sobre la mesa, y una lupa que sigue al cursor revelando el positivo por donde pasa. Se navega barriendo, como quien busca el fotograma bueno en una tira de negativos. El menú entero está a la vista desde el principio, pero solo se ve de verdad lo que estás mirando."
        >
          <MesaDeLuz />
        </Escenario>
      </div>
    </div>
  );
}
