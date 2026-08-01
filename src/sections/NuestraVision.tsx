import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * NUESTRA VISIÓN — sección de cierre de Proyectos.
 *
 * Dos filas de ventanas, una arriba y otra abajo, y entre ellas una BANDA
 * horizontal con el texto. Al bajar, la de arriba sube y la de abajo baja: la
 * banda se abre y el texto se descubre por arriba y por abajo.
 *
 * CLAVE: hay UN vídeo por fila, no uno por ventana. Va a lo ancho de la fila
 * entera y se recorta con una máscara de tres rectángulos, así que cada
 * ventana enseña un TROZO DISTINTO del mismo fotograma. No es el mismo clip
 * repetido seis veces: es una imagen cortada.
 *
 * La máscara se calcula una vez por medida y no en cada fotograma: dentro de
 * su fila las ventanas no se mueven, se mueve la fila entera.
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

/** Fila de abajo (baja). Otra proporción distinta: 24 / 48 / 24 %. */
const ABAJO = [
  { ancho: '24%', ratio: 0.6 },
  { ancho: '48%', ratio: 2.0 },
  { ancho: '24%', ratio: 0.6 },
];

/** Cuánto se separa cada fila, en % del alto de pantalla */
const APERTURA = 20;

export function NuestraVision() {
  const pista = useRef<HTMLDivElement>(null);
  const filas = useRef<(HTMLDivElement | null)[]>([]);
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
      if (!p) return;
      const r = p.getBoundingClientRect();
      const recorrido = p.offsetHeight - window.innerHeight;
      const hecho = recorrido > 0 ? Math.min(1, Math.max(0, -r.top / recorrido)) : 0;
      setAvance(hecho);
      if (filas.current[0]) filas.current[0].style.transform = `translate3d(0, ${-hecho * APERTURA}vh, 0)`;
      if (filas.current[1]) filas.current[1].style.transform = `translate3d(0, ${hecho * APERTURA}vh, 0)`;
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
    <div ref={(el) => { filas.current[f] = el; }} className="will-change-transform">
      <div className="container-large px-6 lg:px-12">
        <div ref={(el) => { lienzos.current[f] = el; }} className="relative">
          {/* UN vídeo para toda la fila: cada ventana enseña un trozo distinto */}
          {cargar && mascaras[f] && (
            menosMovimiento ? (
              <img src="/videos/reel-bucle-poster.jpg" alt="" aria-hidden
                className="absolute inset-0 w-full h-full object-cover" style={estiloMascara(f)} />
            ) : (
              <video src="/videos/reel-bucle.mp4" poster="/videos/reel-bucle-poster.jpg"
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
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">

          <Fila f={0} ventanas={ARRIBA} alinear="items-end" />

          {/* LA BANDA: el texto que corta entre las dos filas */}
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
    </section>
  );
}
