import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * NUESTRA VISIÓN — página propia (/nuestra-vision).
 *
 * Dos filas de ventanas, una arriba y otra abajo, y entre ellas una BANDA
 * horizontal con el mensaje. Las tres piezas NO se separan: la banda es una
 * ventana más de la misma tira, y la tira entera sube o baja según el scroll.
 * Lo que se mueve es la tira dentro de un marco fijo, como quien pasa una
 * pieza de película por delante de una ventanilla.
 *
 * (Antes las filas se abrían en direcciones opuestas para descubrir el texto.
 * Se cambió a propósito: la separación rompía la tira en dos objetos sueltos,
 * y la gracia es que se lea como UNA sola cosa que se desplaza.)
 *
 * CLAVE: hay UN vídeo por fila, no uno por ventana. Va a lo ancho de la fila
 * entera y se recorta con una máscara de tres rectángulos, así que cada
 * ventana enseña un TROZO DISTINTO del mismo fotograma. No es el mismo clip
 * repetido seis veces: es una imagen cortada.
 *
 * La máscara se calcula una vez por medida y no en cada fotograma: las
 * ventanas nunca se mueven unas respecto a otras, se mueve la tira completa.
 *
 * Los anchos y proporciones salen de medir purecinema.tv, y las dos filas son
 * distintas entre sí a propósito: la simetría es lo que delata una plantilla.
 */

/** Texto provisional — pendiente del definitivo. */
const LINEAS = ['Contamos lo que otros', 'no se atreven a mirar'];

/** Fila de arriba (sube). Medidas de la referencia: 41 / 27 / 27 %. */
const ARRIBA = [
  { ancho: '41%', ratio: 2.06 },
  { ancho: '27%', ratio: 1.55 },
  { ancho: '27%', ratio: 1.15 },
];

/**
 * Un clip DISTINTO por fila. Antes las dos filas tiraban del mismo archivo y,
 * aunque cada ventana enseñaba un trozo distinto del fotograma, se veía que
 * arriba y abajo pasaba lo mismo a la vez.
 *
 * Son 20 s cada uno, sacados de tramos separados del máster
 * (~/Mirror/CHRISS_REEL.mov): 24,5-44,5 s el de arriba y 72-92 s el de abajo.
 * Los cortes no son a ojo: se eligieron midiendo el brillo medio segundo a
 * segundo y arrancando en un corte de plano detectado, para que no empiecen en
 * un tramo oscuro ni a mitad de un movimiento.
 *
 * El de abajo va recortado a 1280x640: en el máster ese tramo lleva bandas
 * negras de cine, y aquí las ventanas son la única imagen — una franja negra
 * dentro de una ventana parece un fallo de carga.
 */
const CLIPS = [
  { video: '/videos/vision-arriba.mp4', poster: '/videos/vision-arriba-poster.jpg' },
  { video: '/videos/vision-abajo.mp4', poster: '/videos/vision-abajo-poster.jpg' },
];

/** Fila de abajo (baja). Otra proporción distinta: 24 / 48 / 24 %. */
const ABAJO = [
  { ancho: '24%', ratio: 0.6 },
  { ancho: '48%', ratio: 2.0 },
  { ancho: '24%', ratio: 0.6 },
];

/**
 * Recorrido EXTRA de la tira, además de lo que ya sobresale del marco.
 * En px de alto de marco: 0.14 = un 14 % de la ventana.
 *
 * Sin este extra, una tira que cupiera justa en el marco no se movería nada y
 * la sección parecería estropeada. Con él siempre hay desplazamiento, y cuando
 * la tira es más alta que el marco (lo normal) se suma a lo que ya hay que
 * recorrer para enseñarla entera.
 */
const PARALAJE = 0.14;

/** Alto de la barra fija de las páginas interiores (main lleva pt-[4.5rem]) */
const BARRA = '4.5rem';

export function NuestraVision() {
  const pista = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const tira = useRef<HTMLDivElement>(null);
  const lienzos = useRef<(HTMLDivElement | null)[]>([]);
  const huecos = useRef<(HTMLDivElement | null)[][]>([[], []]);
  const [mascaras, setMascaras] = useState<{ image: string; position: string; size: string }[]>([]);
  const [cargar, setCargar] = useState(false);
  const [avance, setAvance] = useState(0);
  const [menosMovimiento] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const medir = () => {
    const nuevas = [0, 1].map((f) => {
      const base = lienzos.current[f];
      if (!base) return { image: '', position: '', size: '' };
      const rb = base.getBoundingClientRect();
      const capas: string[] = [], pos: string[] = [], tam: string[] = [];
      for (const h of huecos.current[f] || []) {
        if (!h) continue;
        const r = h.getBoundingClientRect();
        capas.push('linear-gradient(#000,#000)');
        pos.push(`${Math.round(r.left - rb.left)}px ${Math.round(r.top - rb.top)}px`);
        tam.push(`${Math.round(r.width)}px ${Math.round(r.height)}px`);
      }
      return { image: capas.join(','), position: pos.join(','), size: tam.join(',') };
    });
    setMascaras(nuevas);
  };

  useLayoutEffect(() => {
    const t = setTimeout(medir, 150);
    const al = () => medir();
    window.addEventListener('resize', al);
    return () => { clearTimeout(t); window.removeEventListener('resize', al); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargar]);

  useEffect(() => {
    if (menosMovimiento) { setAvance(1); return; }
    let pendiente = false;
    const pintar = () => {
      pendiente = false;
      const p = pista.current;
      const m = marco.current;
      const t = tira.current;
      if (!p || !m) return;

      // Cuánto se ha recorrido de la pista, de 0 a 1. La pista es más alta que
      // el marco a propósito: esa diferencia es todo el scroll disponible
      // mientras el marco está pegado arriba.
      const recorrido = p.offsetHeight - m.clientHeight;
      const hecho = recorrido > 0 ? Math.min(1, Math.max(0, -p.getBoundingClientRect().top / recorrido)) : 0;
      setAvance(hecho);

      if (!t) return;
      // Lo que sobresale de la tira por fuera del marco, más el extra de
      // paralaje. Se reparte a partes iguales arriba y abajo: a mitad de
      // recorrido la tira está centrada.
      const sobra = Math.max(0, t.offsetHeight - m.clientHeight) + m.clientHeight * PARALAJE;
      t.style.transform = `translate3d(0, ${(0.5 - hecho) * sobra}px, 0)`;
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
  }, [menosMovimiento]);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (e) => { if (e.some((x) => x.isIntersecting)) { setCargar(true); obs.disconnect(); } },
      { rootMargin: '800px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const estiloMascara = (f: number) => {
    const m = mascaras[f];
    if (!m) return {};
    return {
      WebkitMaskImage: m.image, maskImage: m.image,
      WebkitMaskPosition: m.position, maskPosition: m.position,
      WebkitMaskSize: m.size, maskSize: m.size,
      WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
    } as React.CSSProperties;
  };

  const Fila = ({ f, ventanas, alinear }: { f: number; ventanas: typeof ARRIBA; alinear: string }) => (
    <div>
      <div className="container-large px-6 lg:px-12">
        <div ref={(el) => { lienzos.current[f] = el; }} className="relative">
          {/* UN vídeo para toda la fila: cada ventana enseña un trozo distinto */}
          {cargar && mascaras[f] && (
            menosMovimiento ? (
              <img src={CLIPS[f].poster} alt="" aria-hidden
                className="absolute inset-0 w-full h-full object-cover" style={estiloMascara(f)} />
            ) : (
              <video src={CLIPS[f].video} poster={CLIPS[f].poster}
                autoPlay loop muted playsInline aria-hidden
                className="absolute inset-0 w-full h-full object-cover" style={estiloMascara(f)} />
            )
          )}

          {/* Los huecos solo dan el filo y sirven para medir */}
          <div className={`relative flex ${alinear} justify-between gap-[2.5%]`}>
            {ventanas.map((v, i) => (
              <div
                key={i}
                ref={(el) => { huecos.current[f][i] = el; }}
                aria-hidden
                className="ring-1 ring-white/15 shrink-0"
                style={{ width: v.ancho, aspectRatio: String(v.ratio) }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="vision" className="w-full bg-black">
      <div ref={pista} style={{ height: '240vh' }} className="relative">
        {/* EL MARCO: se queda quieto pegado bajo la barra mientras dura la
            pista. Su alto descuenta la barra fija, si no la tira pasaría por
            debajo del blanco y el mensaje se perdería ahí. */}
        <div
          ref={marco}
          className="sticky overflow-hidden flex flex-col justify-center"
          style={{ top: BARRA, height: `calc(100vh - ${BARRA})` }}
        >
          {/* LA TIRA: las dos filas y la banda como un solo bloque. Es esto lo
              único que se mueve, y en una sola pieza. */}
          <div ref={tira} className="will-change-transform">

            <Fila f={0} ventanas={ARRIBA} alinear="items-end" />

            {/* LA BANDA: una ventana más de la tira, la que lleva el mensaje */}
            <div className="relative z-10 py-7 lg:py-12">
              <div className="container-large px-6 lg:px-12">
                <span
                  className="block text-[0.7rem] font-geist-mono uppercase tracking-[0.3em] text-white/50 mb-3"
                  style={{ opacity: Math.min(1, avance * 4) }}
                >
                  Nuestra visión
                </span>
                <h2 className="font-display uppercase text-white leading-[0.9] tracking-[-0.01em] text-[clamp(1.75rem,4.6vw,4.5rem)]">
                  {LINEAS.map((l, i) => {
                    const v = Math.min(1, Math.max(0, (avance - i * 0.14) * 3.5));
                    return (
                      <span key={l} className="block" style={{ opacity: v, transform: `translateY(${(1 - v) * 14}px)` }}>
                        {i === LINEAS.length - 1 ? <span className="text-exvia-red-text">{l}</span> : l}
                      </span>
                    );
                  })}
                </h2>
              </div>
            </div>

            <Fila f={1} ventanas={ABAJO} alinear="items-start" />
          </div>
        </div>
      </div>
    </section>
  );
}
