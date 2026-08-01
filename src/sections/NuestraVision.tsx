import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * NUESTRA VISIÓN — el manifiesto como cartel.
 *
 * No es una sección con un texto dentro: es una composición. Cada frase del
 * manifiesto lleva SU tipografía y SU sitio, y las ventanas de vídeo caen entre
 * medias como si se hubieran dejado ahí. El desorden es aparente: todo se apoya
 * en una retícula de porcentajes y en un ritmo de escenas, así que se lee de
 * arriba abajo sin esfuerzo aunque nada esté alineado con nada.
 *
 * Las cuatro voces tipográficas (a propósito, mezcladas incluso dentro de una
 * misma frase):
 *   · Anton               — el grito. Mayúsculas enormes.
 *   · Cormorant italic    — la voz que confiesa. Minúsculas, cursiva, ligera.
 *   · Jost 200/300        — la voz que explica. Geométrica de trazo fino.
 *   · GeistMono           — las acotaciones, como notas al margen de un guion.
 *
 * LAS VENTANAS: hay UN vídeo por grupo, no uno por ventana. El clip va a lo
 * ancho del grupo entero y se recorta con una máscara de rectángulos, así que
 * cada ventana enseña un TROZO DISTINTO del mismo fotograma — puntos de vista
 * sobre una misma escena, que es justo la idea. Tres grupos = tres elementos
 * <video> y dos descargas (el clip de arriba se usa dos veces).
 *
 * Los grupos se mueven con el scroll a velocidades distintas. Eso es lo que
 * hace que la composición no parezca pegada: al bajar, las ventanas se
 * descolocan unas de otras.
 */

const CLIPS = [
  { video: '/videos/vision-arriba.mp4', poster: '/videos/vision-arriba-poster.jpg' },
  { video: '/videos/vision-abajo.mp4', poster: '/videos/vision-abajo-poster.jpg' },
];

/** Blanco hueso, el mismo del sello. Sobre negro es menos frío que el 255. */
const HUESO = '#FBF7F5';

function menosMovimiento() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Desplazamiento por scroll. Mide en el elemento de fuera y mueve el de dentro:
 * si midiera el mismo que muevo, la medida incluiría el desplazamiento anterior
 * y se realimentaría hasta irse de la pantalla.
 */
function useParalaje(factor: number) {
  const fuera = useRef<HTMLDivElement>(null);
  const dentro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menosMovimiento()) return;
    let pendiente = false;
    const pintar = () => {
      pendiente = false;
      const f = fuera.current, d = dentro.current;
      if (!f || !d) return;
      const r = f.getBoundingClientRect();
      // Distancia del centro del bloque al centro de la pantalla: 0 justo al
      // pasar por el medio, así que ahí ningún bloque está desplazado y la
      // composición se ve tal cual se diseñó.
      const centro = r.top + r.height / 2 - window.innerHeight / 2;
      d.style.transform = `translate3d(0, ${(-centro * factor).toFixed(1)}px, 0)`;
    };
    const alScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
    document.body.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    pintar();
    return () => {
      document.body.removeEventListener('scroll', alScroll);
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alScroll);
    };
  }, [factor]);

  return { fuera, dentro };
}

type Hueco = {
  /** Posición dentro del grupo, en % del propio grupo. Todo en clases Tailwind. */
  sitio: string;
  /** Ancho/alto de la ventana */
  ratio: number;
};

/**
 * Un grupo de ventanas sobre un mismo clip.
 *
 * OJO con el orden: la máscara se mide DESPUÉS de que las ventanas estén
 * colocadas, y el <video> no se monta hasta que hay máscara. Por eso se mide en
 * useLayoutEffect y no dentro de un setTimeout: cada milisegundo de espera aquí
 * retrasa la descarga del clip.
 */
function Grupo({
  clip,
  huecos,
  className,
  paralaje,
  aspecto,
}: {
  clip: 0 | 1;
  huecos: Hueco[];
  className?: string;
  paralaje: number;
  /**
   * Ancho/alto del grupo entero.
   *
   * El alto va por PROPORCIÓN y no en vh a propósito. Las ventanas sacan su
   * alto del ancho (llevan aspect-ratio), así que si el grupo midiera en vh los
   * dos crecerían por caminos distintos: en una pantalla baja las ventanas se
   * salían del grupo, y lo que sobresale queda fuera del vídeo — se veía media
   * ventana vacía. Con proporción, grupo y ventanas escalan a la vez y la
   * composición es la misma en cualquier pantalla.
   */
  aspecto: number;
}) {
  const lienzo = useRef<HTMLDivElement>(null);
  const marcos = useRef<(HTMLDivElement | null)[]>([]);
  const [mascara, setMascara] = useState<React.CSSProperties | null>(null);
  const [cargar, setCargar] = useState(false);
  const [quieto] = useState(menosMovimiento);
  const { fuera, dentro } = useParalaje(paralaje);

  const medir = () => {
    const base = lienzo.current;
    if (!base) return;
    const rb = base.getBoundingClientRect();
    const capas: string[] = [], pos: string[] = [], tam: string[] = [];
    for (const m of marcos.current) {
      if (!m) continue;
      const r = m.getBoundingClientRect();
      capas.push('linear-gradient(#000,#000)');
      pos.push(`${Math.round(r.left - rb.left)}px ${Math.round(r.top - rb.top)}px`);
      tam.push(`${Math.round(r.width)}px ${Math.round(r.height)}px`);
    }
    if (!capas.length) return;
    setMascara({
      WebkitMaskImage: capas.join(','), maskImage: capas.join(','),
      WebkitMaskPosition: pos.join(','), maskPosition: pos.join(','),
      WebkitMaskSize: tam.join(','), maskSize: tam.join(','),
      WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
    } as React.CSSProperties);
  };

  useLayoutEffect(() => {
    medir();
    const r = requestAnimationFrame(medir);
    const al = () => medir();
    window.addEventListener('resize', al);
    return () => { cancelAnimationFrame(r); window.removeEventListener('resize', al); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = fuera.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (e) => { if (e.some((x) => x.isIntersecting)) { setCargar(true); obs.disconnect(); } },
      { rootMargin: '1400px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={fuera} className={cn('pointer-events-none', className)} style={{ aspectRatio: String(aspecto) }}>
      {/* h-full en toda la cadena: el alto lo pone la proporción del grupo, y si
          el envoltorio no lo hereda, el lienzo mide 0 y la máscara sale a cero.
          Sin will-change: el translate3d ya promociona la capa cuando hace
          falta, y dejar el aviso puesto para siempre mantiene vivas cuatro
          capas de vídeo que ni siquiera están siempre en pantalla. */}
      <div ref={dentro} className="h-full">
        <div ref={lienzo} className="relative w-full h-full">
          {cargar && mascara && (
            quieto ? (
              <img
                src={CLIPS[clip].poster} alt="" aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                style={mascara}
              />
            ) : (
              <video
                src={CLIPS[clip].video} poster={CLIPS[clip].poster}
                autoPlay loop muted playsInline preload="auto" aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                style={mascara}
              />
            )
          )}

          {/* Los huecos solo dan el filo y sirven de regla para medir */}
          {huecos.map((h, i) => (
            <div
              key={i}
              ref={(el) => { marcos.current[i] = el; }}
              aria-hidden
              className={cn('absolute ring-1 ring-white/15', h.sitio)}
              style={{ aspectRatio: String(h.ratio) }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Cada escena entra sola al asomar. Componente aparte: si viviera dentro de
 *  NuestraVision, React lo daría por un componente nuevo en cada render y
 *  tiraría el <video> de dentro para volver a crearlo. */
function Escena({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (e) => { if (e.some((x) => x.isIntersecting)) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '0px 0px -12% 0px' }
    );
    obs.observe(el);
    // Red de seguridad: una escena más alta que la pantalla puede no disparar.
    const rescate = setTimeout(() => setVisible(true), 1200);
    return () => { clearTimeout(rescate); obs.disconnect(); };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'relative reveal',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className
      )}
    >
      {children}
    </div>
  );
}

export function NuestraVision() {
  return (
    <section
      id="vision"
      className="relative w-full bg-black overflow-x-clip py-16 lg:py-24"
    >
      <div className="container-large px-6 lg:px-12">

        {/* ─────────────── 1. EL ALMA ───────────────
            Titular, entradilla y frase larga comparten columna: tres cuerpos
            de letra distintos apilados sin aire de sobra entre ellos. La
            ventana ocupa la columna de al lado ENTERA, a toda altura. */}
        <Escena className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-10 items-start">
          <div className="lg:col-span-7">
            <span className="block font-geist-mono uppercase text-[0.62rem] tracking-[0.4em] text-white/40">
              Nuestra visión
            </span>

            <p className="mt-8 lg:mt-10 font-deco font-light text-white/70 text-[clamp(1rem,1.5vw,1.35rem)] tracking-[0.02em]">
              En Xalvaje creemos que
            </p>

            <h2
              className="font-display uppercase leading-[0.84] tracking-[-0.015em] text-[clamp(2.5rem,7.4vw,6.6rem)] -ml-[0.06em] mt-[0.06em]"
              style={{ color: HUESO }}
            >
              <span className="block">toda marca</span>
              <span className="block">tiene un</span>
              <span className="block text-exvia-red-text">alma</span>
            </h2>

            <p className="mt-7 lg:mt-9 max-w-[30rem] font-display-serif italic font-light text-white/85 text-[clamp(1.25rem,2.1vw,2.05rem)] leading-[1.35]">
              Una historia que existe mucho antes de que alguien la cuente.
            </p>
          </div>

          <Grupo
            clip={0}
            paralaje={0.05}
            className="lg:col-span-5 w-full"
            aspecto={0.85}
            huecos={[
              { sitio: 'left-0 top-0 w-full', ratio: 1.45 },
              { sitio: 'right-0 bottom-0 w-[60%]', ratio: 1.7 },
            ]}
          />
        </Escena>

        {/* ─────────────── 2. DESCUBRIRLA ───────────────
            Primero las ventanas, a lo ancho y a lo grande. Debajo, dos bloques
            de texto en la MISMA franja: el grito a la izquierda, la letra
            pequeña a la derecha, alineada abajo. */}
        <Escena className="mt-16 lg:mt-28">
          <span className="block font-geist-mono uppercase text-[0.58rem] tracking-[0.34em] text-white/35 lg:ml-[56%] mb-5">
            [ puntos de vista ]
          </span>

          <Grupo
            clip={1}
            paralaje={-0.035}
            className="w-full"
            aspecto={1.55}
            huecos={[
              { sitio: 'left-0 top-0 w-[56%]', ratio: 1.5 },
              { sitio: 'right-0 top-[22%] w-[40%]', ratio: 0.82 },
              { sitio: 'left-[18%] bottom-0 w-[34%]', ratio: 2.1 },
            ]}
          />

          <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8 items-end">
            <div className="lg:col-span-7">
              <p className="max-w-[24rem] font-deco font-light text-white/70 text-[clamp(0.98rem,1.4vw,1.28rem)] leading-[1.7]">
                Nuestro trabajo no consiste en inventarla,
              </p>
              <h3
                className="mt-2 font-display uppercase text-exvia-red-text leading-[0.86] tracking-[-0.02em] text-[clamp(2.1rem,6.6vw,5.8rem)] origin-left"
                style={{ transform: 'rotate(-1.6deg)' }}
              >
                sino en<br />descubrirla
              </h3>
            </div>

            <div className="lg:col-span-5">
              <p className="font-display-serif italic font-light text-white/85 text-[clamp(1.2rem,1.9vw,1.85rem)] leading-[1.4]">
                Nos adentramos en su origen, en aquello que la mueve cuando nadie la observa.
              </p>
              <p className="mt-5 font-deco font-light text-white/70 text-[clamp(0.95rem,1.3vw,1.18rem)] leading-[1.8]">
                Despojamos cada proyecto de lo superficial hasta encontrar esa verdad silenciosa
                que lo hace irrepetible.
              </p>
            </div>
          </div>
        </Escena>

        {/* ─────────────── 3. CINE ───────────────
            La palabra enorme y la letra menuda comparten renglón, alineadas
            por abajo. Es el sitio donde más se nota la diferencia de cuerpo,
            y por eso van juntas y no una encima de otra. */}
        <Escena className="mt-16 lg:mt-28">
          <div className="flex flex-col lg:flex-row lg:items-end gap-x-10 gap-y-6">
            <h3
              /* Los márgenes en em, no en px: con interlínea de 0,78 los trazos
                 de Anton se salen de su caja, y ese desbordamiento crece con el
                 cuerpo de letra. En em la holgura crece con él. */
              className="font-display uppercase leading-[0.78] tracking-[-0.045em] text-[clamp(4.5rem,31vw,20rem)] -ml-[0.055em] mt-[0.14em] shrink-0"
              style={{ color: HUESO }}
            >
              cine
            </h3>

            <div className="lg:pb-[1.6vw] max-w-[26rem]">
              <span className="block font-geist-mono uppercase text-[0.58rem] tracking-[0.34em] text-white/40">
                Después hacemos lo que mejor sabemos hacer
              </span>
              <p className="mt-4 font-deco font-extralight text-white/75 text-[clamp(1.15rem,2vw,2rem)] tracking-[0.06em]">
                convertir esa esencia en
              </p>
              <p className="mt-6 font-display-serif italic font-light text-white/85 text-[clamp(1.1rem,1.65vw,1.6rem)] leading-[1.4]">
                Porque solo cuando una marca conoce quién es, puede emocionar sin artificios.
              </p>
            </div>
          </div>

          <Grupo
            clip={0}
            paralaje={0.06}
            /* mt más generoso en móvil: ahí la columna de texto se apila encima
               en vez de ir al lado, y la última línea quedaba a 3 px de la
               ventana. */
            className="w-full mt-14 lg:mt-20"
            aspecto={2.6}
            huecos={[
              { sitio: 'right-0 top-0 w-[58%]', ratio: 2.1 },
              { sitio: 'left-0 bottom-[8%] w-[30%]', ratio: 1.15 },
            ]}
          />
        </Escena>

        {/* ─────────────── 4. LA LETANÍA Y EL REMATE ───────────────
            Cuatro cuerpos de letra bajando en escalera, y el remate en la misma
            escena: se cierra sin tener que bajar otra pantalla más. */}
        <Escena className="mt-16 lg:mt-28 grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12 items-start">
          <div className="lg:col-span-7">
            <p className="font-display-serif italic font-light text-white text-[clamp(1.55rem,3.9vw,3.4rem)] leading-[1.15]">
              Imágenes que respiran.
            </p>
            <p
              className="ml-[8%] lg:ml-[14%] mt-2 font-display uppercase text-[clamp(1.6rem,4.5vw,3.9rem)] leading-[1] tracking-[-0.01em]"
              style={{ color: HUESO }}
            >
              Silencios que hablan.
            </p>
            <p className="ml-[18%] lg:ml-[30%] mt-4 font-deco font-extralight uppercase text-white/85 text-[clamp(1rem,2.2vw,1.9rem)] tracking-[0.24em]">
              Luz que revela.
            </p>
            <p className="ml-[24%] lg:ml-[40%] mt-5 max-w-[24rem] font-deco font-light text-white/65 text-[clamp(0.92rem,1.3vw,1.18rem)] leading-[1.75]">
              Historias que no buscan vender, sino permanecer.
            </p>
          </div>

          <Grupo
            clip={1}
            paralaje={0.04}
            className="lg:col-span-5 w-full"
            aspecto={1.28}
            huecos={[{ sitio: 'left-0 top-0 w-full', ratio: 1.28 }]}
          />

          <div className="lg:col-span-12">
            <p className="font-deco font-light text-white/60 text-[clamp(0.98rem,1.5vw,1.32rem)] tracking-[0.02em]">
              Porque las personas olvidan lo que ven.
            </p>

            {/* Dos familias dentro de la misma frase: aquí es donde el desorden
                tiene que verse a propósito y no por descuido. */}
            <p className="mt-3 font-display-serif italic font-light text-white text-[clamp(1.65rem,5vw,4.4rem)] leading-[1.1] max-w-[22ch]">
              Pero nunca olvidan lo que{' '}
              <span
                className="font-display not-italic uppercase text-exvia-red-text tracking-[-0.01em]"
                style={{ fontSize: '1.12em' }}
              >
                sienten
              </span>
            </p>

            <p className="mt-12 lg:mt-16 lg:text-right font-geist-mono uppercase text-[0.6rem] sm:text-[0.68rem] tracking-[0.34em] text-white/45">
              Y ahí es donde comienza nuestra película
            </p>
          </div>
        </Escena>

      </div>
    </section>
  );
}
