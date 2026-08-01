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
}: {
  clip: 0 | 1;
  huecos: Hueco[];
  className?: string;
  paralaje: number;
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
    <div ref={fuera} className={cn('pointer-events-none', className)}>
      {/* h-full en toda la cadena: el alto lo pone la clase del grupo, y si el
          envoltorio no lo hereda el lienzo mide 0 y la máscara sale a cero. */}
      <div ref={dentro} className="will-change-transform h-full">
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
      className="relative w-full bg-black overflow-x-clip py-24 lg:py-40"
    >
      <div className="container-large px-6 lg:px-12">

        {/* ─────────────── 1. EL ALMA ─────────────── */}
        <Escena className="min-h-[92vh]">
          <span className="block font-geist-mono uppercase text-[0.62rem] tracking-[0.4em] text-white/40">
            Nuestra visión
          </span>

          <p className="mt-14 lg:mt-24 font-deco font-light text-white/70 text-[clamp(1rem,1.6vw,1.4rem)] tracking-[0.02em]">
            En Xalvaje creemos que
          </p>

          {/* El grito. Sale un poco por la izquierda: el bloque pesa tanto que
              alineado con el resto parecía centrado sin querer. */}
          <h2
            className="font-display uppercase leading-[0.84] tracking-[-0.015em] text-[clamp(2.6rem,9.4vw,8.6rem)] -ml-[0.06em] mt-2"
            style={{ color: HUESO }}
          >
            <span className="block">toda marca</span>
            <span className="block">tiene un</span>
            <span className="block text-exvia-red-text">alma</span>
          </h2>

          {/* Ventanas a la derecha, pisando el aire que deja el titular */}
          <Grupo
            clip={0}
            paralaje={0.05}
            className="relative lg:absolute lg:right-0 lg:top-[24%] w-full lg:w-[40%] h-[42vh] lg:h-[62vh] mt-10 lg:mt-0"
            huecos={[
              { sitio: 'left-0 top-0 w-[62%]', ratio: 1.6 },
              { sitio: 'right-0 top-[34%] w-[34%]', ratio: 0.72 },
            ]}
          />

          <p className="mt-12 lg:mt-20 lg:ml-[38%] max-w-[30rem] font-display-serif italic font-light text-white/85 text-[clamp(1.35rem,2.6vw,2.5rem)] leading-[1.35]">
            Una historia que existe mucho antes de que alguien la cuente.
          </p>
        </Escena>

        {/* ─────────────── 2. DESCUBRIRLA ─────────────── */}
        <Escena className="mt-28 lg:mt-56">
          <p className="lg:ml-[46%] max-w-[26rem] font-deco font-light text-white/70 text-[clamp(1rem,1.5vw,1.35rem)] leading-[1.7]">
            Nuestro trabajo no consiste en inventarla,
          </p>

          {/* Ladeada y saliéndose por la derecha: es la frase que rompe */}
          <h3
            className="mt-4 font-display uppercase text-exvia-red-text leading-[0.86] tracking-[-0.02em] text-[clamp(2.2rem,9vw,8rem)] origin-left"
            style={{ transform: 'rotate(-1.6deg)' }}
          >
            sino en<br />descubrirla
          </h3>

          <p className="mt-16 lg:mt-24 max-w-[34rem] font-display-serif italic font-light text-white/85 text-[clamp(1.2rem,2.2vw,2.1rem)] leading-[1.4]">
            Nos adentramos en su origen, en aquello que la mueve cuando nadie la observa.
          </p>
        </Escena>

        {/* ─────────────── 3. LOS PUNTOS DE VISTA ─────────────── */}
        <Escena className="mt-20 lg:mt-32">
          <span className="block font-geist-mono uppercase text-[0.58rem] tracking-[0.34em] text-white/35 lg:ml-[52%]">
            [ puntos de vista ]
          </span>

          <Grupo
            clip={1}
            paralaje={-0.035}
            className="mt-6 w-full h-[58vh] lg:h-[82vh]"
            huecos={[
              { sitio: 'left-0 top-[6%] w-[27%]', ratio: 0.66 },
              { sitio: 'left-[31%] top-0 w-[31%]', ratio: 1.9 },
              { sitio: 'right-[2%] top-[22%] w-[36%]', ratio: 1.35 },
              { sitio: 'left-[24%] bottom-0 w-[22%]', ratio: 1.1 },
            ]}
          />

          <p className="mt-24 lg:mt-32 lg:ml-[8%] max-w-[38rem] font-deco font-light text-white/80 text-[clamp(1rem,1.55vw,1.42rem)] leading-[1.85] tracking-[0.012em]">
            Despojamos cada proyecto de lo superficial hasta encontrar esa verdad silenciosa
            que lo hace irrepetible.
          </p>

          <p className="mt-12 lg:mt-16 lg:ml-[34%] max-w-[32rem] font-display-serif italic font-light text-white/85 text-[clamp(1.25rem,2.3vw,2.2rem)] leading-[1.4]">
            Porque solo cuando una marca conoce quién es, puede emocionar sin artificios.
          </p>
        </Escena>

        {/* ─────────────── 4. CINE ─────────────── */}
        <Escena className="mt-28 lg:mt-52">
          <span className="block font-geist-mono uppercase text-[0.58rem] tracking-[0.34em] text-white/40">
            Después hacemos lo que mejor sabemos hacer
          </span>

          <p className="mt-8 font-deco font-extralight text-white/75 text-[clamp(1.2rem,2.4vw,2.3rem)] tracking-[0.06em]">
            convertir esa esencia en
          </p>

          {/* La palabra ocupa el ancho entero. Es el centro del cartel. */}
          <h3
            /* Los márgenes van en em, no en px: con una interlínea de 0,75 los
               trazos de Anton se salen de su caja por arriba y por abajo, y ese
               desbordamiento crece con el cuerpo de letra. En em, la holgura
               crece con él y la palabra no se come lo que tiene al lado en
               ninguna pantalla. */
            className="font-display uppercase leading-[0.75] tracking-[-0.045em] text-[clamp(4rem,62vw,46rem)] -ml-[0.055em] mt-[0.17em] mb-[0.07em]"
            style={{ color: HUESO }}
          >
            cine
          </h3>

          <Grupo
            clip={0}
            paralaje={0.06}
            className="w-full h-[34vh] lg:h-[46vh] mt-10 lg:mt-14"
            huecos={[
              { sitio: 'right-[6%] top-0 w-[44%]', ratio: 2.3 },
              { sitio: 'left-[8%] top-[16%] w-[19%]', ratio: 0.85 },
            ]}
          />
        </Escena>

        {/* ─────────────── 5. LA LETANÍA ─────────────── */}
        <Escena className="mt-24 lg:mt-40">
          <p className="font-display-serif italic font-light text-white text-[clamp(1.6rem,4.6vw,4rem)] leading-[1.15]">
            Imágenes que respiran.
          </p>
          <p
            className="ml-[10%] lg:ml-[18%] mt-3 font-display uppercase text-[clamp(1.7rem,5.4vw,4.6rem)] leading-[1] tracking-[-0.01em]"
            style={{ color: HUESO }}
          >
            Silencios que hablan.
          </p>
          <p className="ml-[22%] lg:ml-[38%] mt-5 font-deco font-extralight uppercase text-white/85 text-[clamp(1.05rem,2.6vw,2.2rem)] tracking-[0.24em]">
            Luz que revela.
          </p>
          <p className="ml-[30%] lg:ml-[52%] mt-8 max-w-[26rem] font-deco font-light text-white/65 text-[clamp(0.95rem,1.4vw,1.25rem)] leading-[1.8]">
            Historias que no buscan vender, sino permanecer.
          </p>
        </Escena>

        {/* ─────────────── 6. EL REMATE ─────────────── */}
        <Escena className="mt-28 lg:mt-48">
          <p className="font-deco font-light text-white/60 text-[clamp(1rem,1.6vw,1.4rem)] tracking-[0.02em]">
            Porque las personas olvidan lo que ven.
          </p>

          {/* Dos familias dentro de la misma frase: aquí es donde el desorden
              tiene que verse a propósito y no por descuido. */}
          <p className="mt-4 font-display-serif italic font-light text-white text-[clamp(1.7rem,5.6vw,5rem)] leading-[1.1] max-w-[22ch]">
            Pero nunca olvidan lo que{' '}
            <span
              className="font-display not-italic uppercase text-exvia-red-text tracking-[-0.01em]"
              style={{ fontSize: '1.12em' }}
            >
              sienten
            </span>
          </p>

          <p className="mt-20 lg:mt-32 lg:text-right font-geist-mono uppercase text-[0.6rem] sm:text-[0.68rem] tracking-[0.34em] text-white/45">
            Y ahí es donde comienza nuestra película
          </p>
        </Escena>

      </div>
    </section>
  );
}
