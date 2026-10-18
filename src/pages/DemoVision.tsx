import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * COMPARADOR para ORGANIZAR el manifiesto de Nuestra Visión (/demo-vision,
 * ruta oculta, se borra al elegir).
 *
 * El texto ya enumera los cinco bloques —fuego, tierra, aire, agua y el quinto:
 * por qué contamos—, pero se leen de corrido sin que la estructura se vea.
 * Aquí van tres maneras de DIBUJAR esa división sin romper la unidad: el texto
 * es siempre UNO que fluye; lo que cambia es el acompañante que dice en qué
 * elemento estás. Patrones de 21st.dev: sticky scroll reveal (A y C) y
 * parallax/gradient de texto (B).
 */

const VOZ = {
  grito: 'font-display uppercase text-[1.18em] leading-[0.92] tracking-[-0.01em] text-[#FBF7F5]',
  rojo: 'font-display uppercase text-[1.18em] leading-[0.92] tracking-[-0.01em] text-exvia-red-text',
  confiesa: 'font-display-serif italic font-light text-white',
  explica: 'font-deco font-light text-[max(0.76em,1.05rem)] leading-[1.4] text-white/90',
} as const;

function T({ v, className, children }: { v: keyof typeof VOZ; className?: string; children: ReactNode }) {
  return <span className={cn(VOZ[v], className)}>{children}</span>;
}
const Rojo = ({ children }: { children: ReactNode }) => <span className="text-exvia-red-text">{children}</span>;

/** Foto fija del reel (los .jpg que ya sirven de póster en /nuestra-vision):
 *  aquí la mecánica a juzgar es la del TEXTO, no hacen falta los vídeos. */
function Foto({ plano, ratio, className }: { plano: string; ratio: number; className?: string }) {
  return (
    <span aria-hidden className={cn('relative block my-[0.4em] ring-1 ring-inset ring-white/15 overflow-hidden', className)} style={{ aspectRatio: String(ratio) }}>
      <img src={`/videos/vision/${plano}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
    </span>
  );
}

type Bloque = {
  num: string;
  /** Cómo se llama en el índice */
  elemento: string;
  /** Tinte del elemento: fuego rojo, tierra ámbar, aire hueso, agua azul, el quinto rojo */
  tinte: string;
  texto: ReactNode;
};

const BLOQUES: Bloque[] = [
  {
    num: '01', elemento: 'Fuego', tinte: '#DA5C40',
    texto: (
      <>
        <T v="grito" className="text-[1.5em]">XALVAJE nace del <Rojo>fuego.</Rojo></T>{' '}
        <T v="confiesa">De un principio que, sin saberlo, comenzó hace años,</T>{' '}
        <T v="explica">cuando la pasión por el arte, el cine y todas las formas de expresión</T>{' '}
        <T v="confiesa">se cruzó con la inquietud de explicar nuestra propia existencia.</T>{' '}
        <T v="grito">Aquel cruce lo incendió todo:</T>{' '}
        <T v="explica" className="uppercase tracking-[0.22em]">la seguridad, la calma.</T>{' '}
        <T v="confiesa">Y nos dejó una sola salida:</T>{' '}
        <T v="grito">contar, y cambiar las reglas del juego.</T>
        <Foto plano="neon" ratio={2.3} className="sm:w-[72%]" />
      </>
    ),
  },
  {
    num: '02', elemento: 'Tierra', tinte: '#C9A36B',
    texto: (
      <>
        <T v="grito" className="text-[1.5em]">Nace de la tierra.</T>{' '}
        <T v="explica">De la materia que se sedimentó durante millones de años</T>
        <Foto plano="dunas" ratio={2.5} />
        <T v="confiesa">para convertirse en todo lo que hoy conocemos, tocamos y habitamos.</T>
      </>
    ),
  },
  {
    num: '03', elemento: 'Aire', tinte: '#FBF7F5',
    texto: (
      <>
        <T v="grito" className="text-[1.5em]">Nace del aire.</T>{' '}
        <T v="confiesa">De ese gesto involuntario que nuestro cuerpo repite para sobrevivir.</T>{' '}
        <T v="rojo" className="text-[1.5em]">Respirar.</T>{' '}
        <T v="explica" className="uppercase tracking-[0.22em]">Sin pensarlo. Sin decidirlo.</T>{' '}
        <T v="confiesa">Simplemente porque algo dentro de nosotros sabe que tiene que hacerlo.</T>
        <Foto plano="azotea" ratio={2.2} className="sm:w-[64%] sm:ml-auto" />
      </>
    ),
  },
  {
    num: '04', elemento: 'Agua', tinte: '#6EA5FF',
    texto: (
      <>
        <T v="grito" className="text-[1.5em]">Nace del agua.</T>{' '}
        <T v="confiesa">De lo que recorre nuestro cuerpo, lo nutre y conecta cada parte con las demás.</T>
        <Foto plano="mar" ratio={2.35} className="sm:w-[84%] sm:ml-auto" />
        <T v="explica">Lo que fluye, transforma, erosiona y, a veces,</T>{' '}
        <T v="rojo">corroe</T>{' '}
        <T v="explica">todo lo que encuentra a su paso.</T>
      </>
    ),
  },
  {
    num: '05', elemento: 'El quinto: contar', tinte: '#DA5C40',
    texto: (
      <>
        <T v="explica" className="text-[1em] text-white">XALVAJE viene a contar esas historias.</T>
        <span className="block mt-[0.3em]"><T v="grito">Las que nos atraviesan.</T></span>
        <span className="block ml-[4%] lg:ml-[7%]"><T v="grito" className="text-[1.35em]">Las que nos incomodan.</T></span>
        <span className="block ml-[8%] lg:ml-[14%]"><T v="grito" className="text-[1.55em]">Las que nos transforman.</T></span>
        <span className="block ml-[12%] lg:ml-[21%]">
          <T v="rojo" className="text-[1.75em]">Las que <span className="text-[#FBF7F5]">no</span> nos atrevemos a contar.</T>
        </span>
        <Foto plano="pareja" ratio={2.4} className="sm:w-[76%] mt-[0.5em]" />
        <span className="block mt-[0.5em]">
          <T v="confiesa" className="text-[1.15em]">Porque hay historias que</T>{' '}
          <T v="grito" className="text-[1.3em]">no vienen a entretenernos.</T>{' '}
          <T v="grito" className="text-[1.6em]">Vienen a recordarnos <Rojo>quiénes somos.</Rojo></T>
        </span>
      </>
    ),
  },
];

/** Qué bloque está "en lectura": el último cuyo arranque ya cruzó el 45 % de
 *  la pantalla. Lo usan el índice (A) y el hilo (C). */
function useBloqueActivo(refs: React.MutableRefObject<(HTMLElement | null)[]>) {
  const [activo, setActivo] = useState(0);
  useEffect(() => {
    let pendiente = false;
    const medir = () => {
      pendiente = false;
      const centro = window.innerHeight * 0.45;
      let a = 0;
      refs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < centro) a = i;
      });
      setActivo(a);
    };
    const alScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } };
    medir();
    // El scroll de esta web vive en el body, no en window; se escuchan los dos.
    document.body.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    return () => {
      document.body.removeEventListener('scroll', alScroll);
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alScroll);
    };
  }, [refs]);
  return activo;
}

/* ═══════════ A · EL ÍNDICE QUE RESPIRA ═══════════
   Un índice FIJO a la izquierda acompaña toda la lectura: los cinco elementos
   unidos por una línea (esa línea es la unidad). El que se está leyendo se
   enciende con su tinte; los demás esperan apagados. El texto, a la derecha,
   sigue siendo uno solo y se puede saltar a un elemento pulsándolo. */
function IndiceQueRespira() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const activo = useBloqueActivo(refs);

  const irA = (i: number) => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="container-large px-6 lg:px-12 grid lg:grid-cols-[16rem_1fr] gap-x-14">
      <aside className="hidden lg:block" aria-hidden>
        <div className="sticky" style={{ top: 'calc(var(--alto-barra) + 3rem)' }}>
          {BLOQUES.map((b, i) => (
            <button
              key={b.num}
              type="button"
              onClick={() => irA(i)}
              className="group relative flex items-center gap-4 py-4 pl-6 text-left w-full"
            >
              {/* La línea que los une: el tramo recorrido se tiñe */}
              <span className={cn('absolute left-0 top-0 bottom-0 w-px transition-colors duration-500', i <= activo ? 'bg-exvia-red' : 'bg-white/15')} />
              <span
                className={cn(
                  'font-geist-mono text-[0.6rem] tracking-[0.3em] transition-colors duration-300',
                  i === activo ? 'text-exvia-red-text' : 'text-white/35 group-hover:text-white/60'
                )}
              >
                {b.num}
              </span>
              <span
                className={cn(
                  'font-display uppercase leading-none text-[1.5rem] transition-[color,transform,opacity] duration-500 origin-left',
                  i === activo ? 'scale-110' : 'opacity-45 group-hover:opacity-80'
                )}
                style={{ color: i === activo ? b.tinte : '#FBF7F5' }}
              >
                {b.elemento}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* En móvil, el índice es una regleta pegada bajo la barra */}
      <div
        className="lg:hidden sticky z-30 -mx-6 px-6 py-3 bg-black/85 backdrop-blur-sm border-b border-white/10 flex gap-4 overflow-x-auto"
        style={{ top: 'var(--alto-barra)' }}
        aria-hidden
      >
        {BLOQUES.map((b, i) => (
          <button
            key={b.num}
            type="button"
            onClick={() => irA(i)}
            className={cn('shrink-0 font-geist-mono uppercase text-[0.6rem] tracking-[0.22em] transition-colors', i === activo ? '' : 'text-white/40')}
            style={i === activo ? { color: b.tinte } : undefined}
          >
            {b.num} {b.elemento}
          </button>
        ))}
      </div>

      <div className="text-[clamp(1.4rem,3.6vw,3.6rem)] leading-[1.14] [text-wrap:pretty]">
        {BLOQUES.map((b, i) => (
          <div key={b.num} ref={(el) => { refs.current[i] = el; }} className="pt-[1em] scroll-mt-[calc(var(--alto-barra)+4rem)]">
            {b.texto}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ B · LA MAREA ═══════════
   Nada fijo: detrás del texto, el NOMBRE del elemento pasa gigante como marca
   de agua, con una luz de su tinte que baña su tramo. El lector no ve un
   índice: siente que la página cambia de temperatura al cambiar de elemento.
   Es la opción más cinematográfica y la que menos interrumpe la lectura. */
function LaMarea() {
  return (
    <div>
      {BLOQUES.map((b) => (
        <div key={b.num} className="relative">
          {/* La marca de agua: sticky dentro de su tramo, se queda mientras
              el texto del elemento pasa por delante */}
          <span aria-hidden className="pointer-events-none select-none absolute inset-0 overflow-hidden">
            <span
              className="sticky top-[22vh] block text-right pr-[4vw] font-display uppercase leading-none"
              style={{ fontSize: 'clamp(5rem,19vw,17rem)', color: b.tinte, opacity: 0.13 }}
            >
              {b.elemento.replace('El quinto: ', '')}
            </span>
          </span>
          {/* La luz del tinte, muy baja, para que el tramo cambie de temperatura */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse 80% 55% at 70% 40%, ${b.tinte}14, transparent 75%)` }}
          />
          <div className="relative container-large px-6 lg:px-12 text-[clamp(1.5rem,4.2vw,4.6rem)] leading-[1.14] [text-wrap:pretty]">
            <span className="block pt-[0.9em] font-geist-mono text-[0.62rem] tracking-[0.34em]" style={{ color: b.tinte }} aria-hidden>
              {b.num}
            </span>
            {b.texto}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ C · EL HILO ═══════════
   Una sola línea vertical recorre TODO el manifiesto —esa línea es la unidad—
   y se va tiñendo de rojo con la lectura. Cada elemento es un nudo en el hilo,
   y abajo a la izquierda una claqueta fija dice siempre en qué elemento estás,
   cruzando al siguiente al pasar cada nudo. */
function ElHilo() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const contenedor = useRef<HTMLDivElement>(null);
  const linea = useRef<HTMLSpanElement>(null);
  const activo = useBloqueActivo(refs);

  useEffect(() => {
    let pendiente = false;
    const pintar = () => {
      pendiente = false;
      const c = contenedor.current; const l = linea.current;
      if (!c || !l) return;
      const r = c.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (window.innerHeight * 0.45 - r.top) / r.height));
      l.style.height = `${(p * 100).toFixed(2)}%`;
    };
    const alScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
    pintar();
    document.body.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    return () => {
      document.body.removeEventListener('scroll', alScroll);
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alScroll);
    };
  }, []);

  return (
    <div className="container-large px-6 lg:px-12">
      <div ref={contenedor} className="relative pl-8 sm:pl-12 lg:pl-20">
        {/* El hilo: gris de fondo, rojo lo ya leído */}
        <span aria-hidden className="absolute left-1.5 sm:left-3 lg:left-6 top-0 bottom-0 w-px bg-white/12" />
        <span ref={linea} aria-hidden className="absolute left-1.5 sm:left-3 lg:left-6 top-0 w-px bg-exvia-red transition-[height] duration-150 ease-linear" />

        <div className="text-[clamp(1.4rem,3.8vw,4rem)] leading-[1.14] [text-wrap:pretty]">
          {BLOQUES.map((b, i) => (
            <div key={b.num} ref={(el) => { refs.current[i] = el; }} className="relative pt-[1em]">
              {/* El nudo del elemento, sobre el hilo: a la altura del hilo
                  (el padding del contenedor) y centrado sobre la línea */}
              <span
                aria-hidden
                className="absolute top-[1.35em] -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-4 ring-black transition-colors duration-500 left-[calc(-2rem+0.0625rem+0.3125rem)] sm:left-[calc(-3rem+0.75rem+0.03125rem)] lg:left-[calc(-5rem+1.5rem+0.03125rem)]"
                style={{ backgroundColor: i <= activo ? b.tinte : 'rgba(255,255,255,0.18)' }}
              />
              <span className="block mb-[0.25em] font-geist-mono uppercase text-[0.62rem] tracking-[0.34em]" style={{ color: b.tinte }} aria-hidden>
                {b.num} · {b.elemento}
              </span>
              {b.texto}
            </div>
          ))}
        </div>
      </div>

      {/* La claqueta fija: siempre dice en qué elemento estás */}
      <div aria-hidden className="fixed bottom-5 left-5 z-30 px-4 py-2.5 bg-black/80 backdrop-blur-sm ring-1 ring-white/15">
        <span className="block font-geist-mono text-[0.55rem] tracking-[0.3em] text-white/45 uppercase">Elemento</span>
        <span key={activo} className="block font-display uppercase text-[1.3rem] leading-none animate-[encender_500ms_ease-out]" style={{ color: BLOQUES[activo].tinte }}>
          {BLOQUES[activo].num} {BLOQUES[activo].elemento}
        </span>
      </div>
    </div>
  );
}

const ESCENARIOS = [
  { letra: 'A', titulo: 'El índice que respira', nota: 'Un índice fijo acompaña la lectura: los cinco elementos unidos por una línea, y el que lees se enciende con su color. Se puede saltar a cualquiera pulsándolo.', Comp: IndiceQueRespira },
  { letra: 'B', titulo: 'La marea', nota: 'Sin índice: el nombre del elemento pasa gigante detrás del texto y su tinte baña el tramo. La división se siente como un cambio de temperatura, no como capítulos.', Comp: LaMarea },
  { letra: 'C', titulo: 'El hilo', nota: 'Una sola línea recorre todo el manifiesto y se tiñe de rojo con la lectura; cada elemento es un nudo. Una claqueta fija dice siempre dónde estás.', Comp: ElHilo },
] as const;

export function DemoVision() {
  const [cual, setCual] = useState(0);
  const { letra, nota, Comp } = ESCENARIOS[cual];

  return (
    <main className="bg-black min-h-screen pb-24">
      {/* El selector: pegado bajo la barra para poder cambiar desde cualquier
          punto del scroll. Al cambiar se vuelve arriba: cada mecánica se juzga
          desde el principio. */}
      <div
        className="sticky z-40 bg-black/90 backdrop-blur-md border-b border-white/10"
        style={{ top: 'var(--alto-barra)' }}
      >
        <div className="container-large px-6 lg:px-12 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-geist-mono uppercase text-[0.58rem] tracking-[0.3em] text-white/40">
            Nuestra visión · 3 maneras de dividir sin separar
          </span>
          <div className="flex gap-2">
            {ESCENARIOS.map((e, i) => (
              <button
                key={e.letra}
                type="button"
                onClick={() => { setCual(i); window.scrollTo({ top: 0 }); document.body.scrollTo({ top: 0 }); }}
                className={cn(
                  'px-4 py-1.5 font-geist-mono uppercase text-[0.62rem] tracking-[0.22em] ring-1 transition-colors',
                  i === cual ? 'bg-[#FBF7F5] text-black ring-transparent' : 'text-white/70 ring-white/25 hover:text-white hover:ring-white/50'
                )}
              >
                {e.letra} · {e.titulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-large px-6 lg:px-12 pt-8 pb-4">
        <p className="max-w-[46rem] font-deco font-light text-white/60 text-[0.95rem] leading-[1.7]">
          <span className="font-geist-mono text-exvia-red-text mr-3">{letra}</span>
          {nota}
        </p>
      </div>

      <Comp key={letra} />
    </main>
  );
}
