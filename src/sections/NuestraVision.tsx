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

/** El manifiesto. Va partido en párrafos cortos: es texto para respirar. */
const MANIFIESTO = [
  'En Xalvaje creemos que toda marca tiene un alma. Una historia que existe mucho antes de que alguien la cuente. Nuestro trabajo no consiste en inventarla, sino en descubrirla.',
  'Nos adentramos en su origen, en aquello que la mueve cuando nadie la observa. Despojamos cada proyecto de lo superficial hasta encontrar esa verdad silenciosa que lo hace irrepetible. Porque solo cuando una marca conoce quién es, puede emocionar sin artificios.',
  'Después hacemos lo que mejor sabemos hacer: convertir esa esencia en cine.',
  'Imágenes que respiran. Silencios que hablan. Luz que revela. Historias que no buscan vender, sino permanecer.',
  'Porque las personas olvidan lo que ven. Pero nunca olvidan lo que sienten.',
];

/** Última línea, aparte: es el remate y va con el rojo de marca. */
const CIERRE = 'Y ahí es donde comienza nuestra película.';

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

/**
 * Píxeles de scroll por cada píxel que se mueve la tira. Marca el ritmo de
 * lectura: cuanto más alto, más despacio pasa el manifiesto.
 *
 * De aquí sale el alto de la pista, y no al revés. Con una altura fija en vh
 * (antes eran 240) el texto pasaría volando justo donde más largo se pone —
 * pantallas estrechas, donde el manifiesto ocupa el doble de líneas.
 */
const RITMO = 2.4;

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
  const [menosMovimiento] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  /**
   * Lo que la tira tiene que recorrer: lo que sobresale del marco más el extra
   * de paralaje. Lo usan el pintado y el cálculo del alto de la pista, y tiene
   * que ser EL MISMO número en los dos o el final del texto se queda fuera.
   */
  const sobraDe = (m: HTMLDivElement, t: HTMLDivElement) =>
    Math.max(0, t.offsetHeight - m.clientHeight) + m.clientHeight * PARALAJE;

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
    // Medir YA, sin setTimeout. El <video> no se monta hasta que hay máscara,
    // así que cada milisegundo de espera aquí es un milisegundo que la descarga
    // del clip no ha empezado: con los 150 ms de antes, el navegador no pedía
    // los vídeos hasta pasado casi medio segundo desde que abrías la página.
    // Se puede medir aquí porque las ventanas no dependen de las fuentes: van
    // por porcentaje y aspect-ratio, y en useLayoutEffect ya están colocadas.
    medir();
    // Segunda pasada en el siguiente fotograma, por si algo movió el layout.
    const r = requestAnimationFrame(medir);
    const al = () => medir();
    window.addEventListener('resize', al);
    return () => { cancelAnimationFrame(r); window.removeEventListener('resize', al); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargar]);

  // El alto de la pista sale del contenido, no de un vh fijo: manda el ritmo de
  // lectura del manifiesto, que en pantallas estrechas ocupa el doble de alto.
  useLayoutEffect(() => {
    const ajustar = () => {
      const p = pista.current, m = marco.current, t = tira.current;
      if (!p || !m || !t) return;
      p.style.height = `${Math.round(m.clientHeight + sobraDe(m, t) * RITMO)}px`;
    };
    ajustar();
    // Segunda pasada: las fuentes tardan en llegar y el texto cambia de alto.
    const r = requestAnimationFrame(ajustar);
    document.fonts?.ready.then(ajustar);
    window.addEventListener('resize', ajustar);
    return () => { cancelAnimationFrame(r); window.removeEventListener('resize', ajustar); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargar]);

  useEffect(() => {
    if (menosMovimiento) return;
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

      if (!t) return;
      // El desplazamiento se reparte a partes iguales arriba y abajo: a mitad
      // de recorrido la tira está centrada. Va por estilo directo, sin estado
      // de React: durante el scroll este componente no se vuelve a pintar.
      t.style.transform = `translate3d(0, ${(0.5 - hecho) * sobraDe(m, t)}px, 0)`;
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
      { rootMargin: '1400px 0px' }
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

  /**
   * OJO: esto es una FUNCIÓN que devuelve JSX, no un componente que se escriba
   * como <Fila />. Y tiene que seguir siéndolo.
   *
   * Siendo componente estaba definido aquí dentro, así que en cada render era
   * una función NUEVA: para React eso es otro tipo de componente, tira el
   * anterior y monta uno nuevo. Como `avance` se actualiza en cada fotograma
   * del scroll, el <video> se destruía y se volvía a crear sin parar y no
   * llegaba nunca a arrancar. Medido al cargar: tres peticiones del mismo mp4
   * en 5 ms. Llamándola como función no hay frontera de componente y el vídeo
   * se queda donde está.
   */
  const fila = (f: number, ventanas: typeof ARRIBA, alinear: string) => (
    <div key={f}>
      <div className="container-large px-6 lg:px-12">
        <div ref={(el) => { lienzos.current[f] = el; }} className="relative">
          {/* UN vídeo para toda la fila: cada ventana enseña un trozo distinto */}
          {cargar && mascaras[f] && (
            menosMovimiento ? (
              <img src={CLIPS[f].poster} alt="" aria-hidden
                className="absolute inset-0 w-full h-full object-cover" style={estiloMascara(f)} />
            ) : (
              <video src={CLIPS[f].video} poster={CLIPS[f].poster}
                autoPlay loop muted playsInline preload="auto" aria-hidden
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

            {fila(0, ARRIBA, 'items-end')}

            {/* LA BANDA: una ventana más de la tira, la que lleva el mensaje.
                Sin desvanecidos atados al scroll: es un texto largo, y un
                texto que hay que leer no se pone a media opacidad [L0]. */}
            <div className="relative z-10 py-12 lg:py-20">
              <div className="container-large px-6 lg:px-12">
                <div className="max-w-[46rem]">
                  <span className="block font-deco font-light uppercase text-[0.7rem] sm:text-[0.78rem] tracking-[0.42em] text-white/60 mb-8 lg:mb-12">
                    Nuestra visión
                  </span>

                  <div className="font-deco font-light text-white/90 text-[clamp(1.02rem,1.45vw,1.45rem)] leading-[1.9] tracking-[0.012em] space-y-6 lg:space-y-8">
                    {MANIFIESTO.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>

                  <p className="font-deco font-light text-exvia-red-text mt-10 lg:mt-14 text-[clamp(1.2rem,1.9vw,1.95rem)] leading-[1.5] tracking-[0.02em]">
                    {CIERRE}
                  </p>
                </div>
              </div>
            </div>

            {fila(1, ABAJO, 'items-start')}
          </div>
        </div>
      </div>
    </section>
  );
}
