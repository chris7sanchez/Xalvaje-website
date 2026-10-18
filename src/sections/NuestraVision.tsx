import { useEffect, useRef, useState } from 'react';

/**
 * NUESTRA VISIÓN — maquetada POR CHRISTIAN (18/10/2026).
 *
 * La composición no sale de un diseño mío: sale de su PPTX
 * (recursos/vision-maqueta/MAQUETA-VISION.pptx, editado por él en PowerPoint).
 * Cada lámina reproduce su diapositiva: mismas posiciones (en % del lienzo
 * 13,33x7,5), mismos cuerpos (1pt del PPTX = 1/9,6 cqw del lienzo), mismos
 * colores (incluido su rojo C00000, que NO es el rojo Exvia) y sus MEZCLAS de
 * fuente dentro de la frase. Reestructuró el relato: el pasaje «aquel cruce lo
 * incendió todo… CONTAR» ya no cierra el fuego, cierra el AGUA, de puente
 * hacia el quinto elemento.
 *
 * FUENTES: varias son del Mac de Christian y van nombradas PRIMERO en el
 * font-family (en su equipo se ven las originales); detrás, una suplente de
 * Google Fonts cargada en index.html para el resto del mundo.
 *
 * En escritorio (lg+) cada lámina es un lienzo 16:9 con cajas absolutas; en
 * móvil las mismas cajas fluyen en orden de lectura, con un suelo de tamaño
 * en rem para que nada baje de legible.
 *
 * Las ventanas siguen siendo VÍDEO (los planos del reel), en los rectángulos
 * donde él puso las fotos: se abren al entrar en pantalla y solo se reproduce
 * lo que está cerca, como antes.
 */

type Plano = 'mar' | 'dunas' | 'neon' | 'azotea' | 'pareja';

function menosMovimiento() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const entre01 = (n: number) => Math.max(0, Math.min(1, n));

/* ── Las fuentes de la maqueta. Primero la del Mac de Christian, después la
      suplente web. Los nombres vienen tal cual del XML del PPTX. ── */
const FUENTE = {
  anton: "Anton, 'Arial Narrow', sans-serif",
  cormorant: "'Cormorant Garamond', Georgia, serif",
  jost: "Jost, Arial, sans-serif",
  hoefler: "'Hoefler Text', 'Playfair Display', Georgia, serif",
  typew: "'Albertsthal Typewriter', 'American Typewriter', 'Special Elite', 'Courier New', monospace",
  amtypew: "'American Typewriter', 'Special Elite', 'Courier New', monospace",
  script: "'Christiangraphy Font', Christiangraphy, 'Great Vibes', cursive",
  engraved: "'Academy Engraved LET', 'Cinzel Decorative', serif",
  arkadelphia: "'Arkadelphia Demo', 'Cinzel Decorative', serif",
  kokonor: "Kokonor, Comforter, cursive",
} as const;

type Run = {
  t: string;
  f: keyof typeof FUENTE;
  /** cuerpo en puntos del PPTX */
  pt: number;
  /** color hex SIN almohadilla, como en el XML */
  c: string;
  i?: boolean;
  b?: boolean;
  /** letterspacing en em (spc del PPTX / 100 / pt) */
  spc?: number;
};

type Caja = { x: number; y: number; w: number; runs: Run[] };
type VentanaDef = { plano: Plano; x: number; y: number; w: number; ratio: number };
type Lamina = { num: string; nombre: string; tinte: string; ventana: VentanaDef; cajas: Caja[] };

/* Posiciones = pulgadas del PPTX pasadas a % del lienzo (x/13,33 · y/7,5). */
const LAMINAS: Lamina[] = [
  {
    num: '01', nombre: 'FUEGO', tinte: 'DA5C40',
    ventana: { plano: 'neon', x: 3.1, y: 26.0, w: 80.5, ratio: 10.73 / 4.66 },
    cajas: [
      { x: 3.1, y: 9.3, w: 72, runs: [
        { t: 'X', f: 'anton', pt: 60, c: 'C00000' },
        { t: 'ALVAJE ', f: 'anton', pt: 44, c: 'FBF7F5' },
        { t: 'nace del fuego', f: 'hoefler', pt: 32, c: 'FBF7F5' },
        { t: '.', f: 'anton', pt: 44, c: 'FBF7F5' },
      ]},
      { x: 1.4, y: 31.2, w: 97, runs: [
        { t: '...de un principio que, sin saberlo, comenzó hace años', f: 'typew', pt: 20, c: '000000', i: true, spc: 0.3 },
        { t: ',', f: 'cormorant', pt: 28, c: '000000', i: true },
      ]},
      { x: 3.1, y: 44.3, w: 79, runs: [
        { t: 'cuando la pasión por el arte, el cine y todas las formas de expresión', f: 'typew', pt: 20, c: 'E8E4E2' },
      ]},
      { x: 55.9, y: 71.9, w: 41, runs: [
        { t: 'se cruzaron con la ', f: 'cormorant', pt: 32, c: 'FFFFFF', i: true, spc: -0.05 },
        { t: 'i', f: 'engraved', pt: 36, c: 'C00000', i: true },
        { t: 'nquietud ', f: 'arkadelphia', pt: 36, c: 'C00000', i: true },
        { t: 'de ', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true },
        { t: 'explicar nuestra propia existencia.', f: 'kokonor', pt: 28, c: 'FFFFFF', i: true },
      ]},
    ],
  },
  {
    num: '02', nombre: 'TIERRA', tinte: 'C9A36B',
    ventana: { plano: 'dunas', x: 2.8, y: 19.6, w: 94.4, ratio: 12.58 / 5.03 },
    cajas: [
      { x: 4.5, y: 14.7, w: 62, runs: [{ t: 'NACE DE LA TIERRA.', f: 'anton', pt: 44, c: 'FBF7F5' }] },
      { x: 4.5, y: 32.9, w: 62, runs: [{ t: 'De la materia que se sedimentó durante millones de años', f: 'jost', pt: 18, c: 'E8E4E2' }] },
      { x: 36.8, y: 72.4, w: 60, runs: [{ t: 'para convertirse en todo lo que hoy conocemos, tocamos y habitamos.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] },
    ],
  },
  {
    num: '03', nombre: 'AIRE', tinte: 'FBF7F5',
    ventana: { plano: 'azotea', x: 3.8, y: 24.5, w: 84, ratio: 11.2 / 5.2 },
    cajas: [
      { x: 4.5, y: 14.7, w: 62, runs: [{ t: 'NACE DEL AIRE.', f: 'anton', pt: 44, c: 'FBF7F5' }] },
      { x: 5.3, y: 26.7, w: 62, runs: [{ t: 'De ese gesto involuntario que nuestro cuerpo repite para sobrevivir.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] },
      { x: 3.8, y: 43.2, w: 62, runs: [{ t: 'RESPIRAR.', f: 'anton', pt: 44, c: 'DA5C40' }] },
      { x: 4.5, y: 52.0, w: 62, runs: [{ t: 'SIN PENSARLO. SIN DECIDIRLO.', f: 'jost', pt: 18, c: 'E8E4E2', spc: 0.33 }] },
      { x: 35.3, y: 85.9, w: 62, runs: [{ t: 'Simplemente porque algo dentro de nosotros sabe que tiene que hacerlo.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] },
    ],
  },
  {
    num: '04', nombre: 'AGUA', tinte: '6EA5FF',
    ventana: { plano: 'mar', x: 27.5, y: 14.4, w: 72.5, ratio: 10.09 / 4.29 },
    cajas: [
      { x: 3.8, y: 11.9, w: 62, runs: [{ t: 'NACE DEL AGUA.', f: 'anton', pt: 44, c: 'FBF7F5' }] },
      { x: 3.8, y: 20.4, w: 46, runs: [{ t: 'De lo que recorre nuestro cuerpo, lo nutre y conecta cada parte con las demás.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] },
      { x: 3.8, y: 36.9, w: 46, runs: [{ t: 'Lo que fluye, transforma, erosiona y, a veces, CORROE', f: 'jost', pt: 18, c: 'E8E4E2' }] },
      { x: 49.7, y: 44.7, w: 46, runs: [{ t: 'todo lo que encuentra a su paso.', f: 'jost', pt: 18, c: 'E8E4E2' }] },
      { x: 49.7, y: 59.1, w: 46, runs: [
        { t: 'LA SEGURIDAD, LA CALMA', f: 'jost', pt: 20, c: 'C0C0C0', b: true, spc: 0.3 },
        /* El punto final venía en #000000 en su PPTX (invisible sobre negro);
           se respeta el gris del resto para que la frase cierre. */
        { t: '.', f: 'jost', pt: 20, c: 'C0C0C0', b: true },
      ]},
      { x: 3.0, y: 67.1, w: 70, runs: [
        { t: 'aquel cruce ', f: 'amtypew', pt: 28, c: 'C00000', i: true },
        { t: 'LO INCENDIÓ TODO:', f: 'anton', pt: 32, c: 'FBF7F5' },
      ]},
      { x: 6.4, y: 77.3, w: 62, runs: [{ t: 'Y nos dejó una sola salida:', f: 'script', pt: 28, c: 'FFFFFF', i: true }] },
      { x: 39.5, y: 86.8, w: 20, runs: [{ t: 'CONTAR', f: 'anton', pt: 28, c: 'C00000' }] },
      { x: 47.8, y: 88.9, w: 50, runs: [{ t: ', Y CAMBIAR LAS REGLAS DEL JUEGO.', f: 'anton', pt: 32, c: 'FBF7F5' }] },
    ],
  },
  {
    num: '05', nombre: 'EL QUINTO: CONTAR', tinte: 'DA5C40',
    ventana: { plano: 'pareja', x: 68.3, y: 17.3, w: 28.5, ratio: 3.8 / 1.58 },
    cajas: [
      { x: 4.5, y: 14.7, w: 62, runs: [{ t: 'XALVAJE viene a contar esas historias.', f: 'jost', pt: 20, c: 'FFFFFF' }] },
      { x: 4.5, y: 24.3, w: 62, runs: [{ t: 'LAS QUE NOS ATRAVIESAN.', f: 'anton', pt: 30, c: 'FBF7F5' }] },
      { x: 8.3, y: 33.9, w: 62, runs: [{ t: 'LAS QUE NOS INCOMODAN.', f: 'anton', pt: 36, c: 'FBF7F5' }] },
      { x: 12.0, y: 43.5, w: 62, runs: [{ t: 'LAS QUE NOS TRANSFORMAN.', f: 'anton', pt: 42, c: 'FBF7F5' }] },
      { x: 15.8, y: 54.4, w: 70, runs: [{ t: 'LAS QUE NO NOS ATREVEMOS A CONTAR.', f: 'anton', pt: 48, c: 'DA5C40' }] },
      { x: 20.5, y: 74.0, w: 62, runs: [{ t: 'Porque hay historias que NO VIENEN A ENTRETENERNOS.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] },
      { x: 46.5, y: 80.9, w: 51, runs: [{ t: 'VIENEN A RECORDARNOS QUIÉNES SOMOS.', f: 'anton', pt: 40, c: 'FBF7F5' }] },
    ],
  },
];

/** Cuerpo de letra: en escritorio, proporcional al lienzo (1pt = 1/9,6 cqw,
 *  que es la equivalencia exacta con el PPTX de 13,33 pulgadas); en móvil el
 *  lienzo es estrecho y manda el suelo en rem para no bajar de legible. */
const cuerpo = (pt: number) => `max(${(pt * 0.045).toFixed(2)}rem, ${(pt / 9.6).toFixed(2)}cqw)`;

function TextoCaja({ caja }: { caja: Caja }) {
  return (
    <div
      className="lg:absolute mb-5 lg:mb-0 lg:w-[var(--w)]"
      style={{ left: `${caja.x}%`, top: `${caja.y}%`, ['--w' as string]: `${caja.w}%` }}
    >
      <p className="m-0 leading-[1.08] [text-wrap:pretty]">
        {caja.runs.map((r, i) => (
          <span
            key={i}
            /* El negro de Christian vive SOBRE la foto brillante (escritorio).
               En movil las cajas fluyen sobre fondo negro y ese texto
               desapareceria [L0]: alli se sirve en hueso. */
            className="text-[var(--cm)] lg:text-[var(--c)]"
            style={{
              fontFamily: FUENTE[r.f],
              fontSize: cuerpo(r.pt),
              ['--c' as string]: `#${r.c}`,
              ['--cm' as string]: r.c === '000000' ? '#E8E4E2' : `#${r.c}`,
              fontStyle: r.i ? 'italic' : 'normal',
              fontWeight: r.b ? 700 : r.f === 'jost' ? 300 : 400,
              letterSpacing: r.spc ? `${r.spc}em` : undefined,
            }}
          >
            {r.t}
          </span>
        ))}
      </p>
    </div>
  );
}

export function NuestraVision() {
  const seccion = useRef<HTMLElement>(null);
  const [quieto] = useState(menosMovimiento);

  /* Las ventanas: misma mecánica de siempre (abrirse al entrar, paralaje
     dentro, reproducir solo lo cercano). */
  useEffect(() => {
    const s = seccion.current;
    if (!s) return;
    const ventanas = Array.from(s.querySelectorAll<HTMLElement>('[data-ventana]')).map((el) => ({
      el,
      abre: el.querySelector<HTMLElement>('[data-abre]'),
      v: el.querySelector('video'),
    }));
    let pendiente = false;

    const pintar = () => {
      pendiente = false;
      const vh = window.innerHeight;
      for (const { el, abre, v } of ventanas) {
        const r = el.getBoundingClientRect();
        const a = quieto ? 1 : suave(entre01((vh * 0.97 - r.top) / (vh * 0.26)));
        const c = ((1 - a) * 50).toFixed(2);
        if (abre) abre.style.clipPath = `inset(${c}% 0 ${c}% 0)`;
        if (!v || quieto) continue;
        const centro = (r.top + r.height / 2 - vh / 2) / vh;
        v.style.transform = `translate3d(0, ${(-centro * 7).toFixed(2)}%, 0)`;
        const cerca = r.bottom > -vh * 0.3 && r.top < vh * 1.3;
        if (cerca && v.paused) { v.preload = 'auto'; v.play().catch(() => {}); }
        else if (!cerca && !v.paused) v.pause();
      }
    };

    const alScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
    document.body.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(alScroll) : null;
    ro?.observe(s);
    pintar();
    return () => {
      document.body.removeEventListener('scroll', alScroll);
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alScroll);
      ro?.disconnect();
    };
  }, [quieto]);

  return (
    <section ref={seccion} id="vision" className="relative w-full bg-black overflow-x-clip">
      <div className="relative container-large px-6 lg:px-12 py-16 lg:py-24">
        <h1 className="flex items-baseline gap-[0.9em] font-deco font-light uppercase text-[clamp(1.05rem,1.7vw,1.7rem)] tracking-[0.32em] text-white mb-10 lg:mb-14">
          <span className="font-geist-mono text-[0.6em] tracking-[0.2em] text-exvia-red-text">04</span>
          Nuestra visión
        </h1>

        {LAMINAS.map((l) => (
          <article
            key={l.num}
            className="relative mt-14 lg:mt-20 lg:aspect-[16/9]"
            style={{ containerType: 'inline-size' }}
          >
            {/* El rótulo del elemento, como en su maqueta */}
            <span
              aria-hidden
              className="block lg:absolute lg:left-[4.5%] lg:top-[4.7%] mb-4 lg:mb-0 font-geist-mono uppercase text-[0.72rem] tracking-[0.55em]"
              style={{ color: `#${l.tinte}` }}
            >
              {l.num} · {l.nombre}
            </span>

            {/* LA VENTANA: vídeo en el rectángulo donde él puso la foto */}
            <span
              data-ventana
              aria-hidden
              className="relative lg:absolute block my-5 lg:my-0 w-full lg:w-[var(--w)] ring-1 ring-inset ring-white/15"
              style={{
                left: `${l.ventana.x}%`,
                top: `${l.ventana.y}%`,
                ['--w' as string]: `${l.ventana.w}%`,
                aspectRatio: String(l.ventana.ratio),
              }}
            >
              <span data-abre className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(50% 0 50% 0)' }}>
                <video
                  src={`/videos/vision/${l.ventana.plano}.mp4`}
                  poster={`/videos/vision/${l.ventana.plano}.jpg`}
                  loop muted playsInline preload="none"
                  className="absolute left-0 top-[-8%] w-full h-[116%] object-cover"
                />
              </span>
            </span>

            {l.cajas.map((c, i) => <TextoCaja key={i} caja={c} />)}
          </article>
        ))}
      </div>
    </section>
  );
}
