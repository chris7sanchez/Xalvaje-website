import { useEffect, useRef, useState } from 'react';

/**
 * NUESTRA VISIÓN — maquetada POR CHRISTIAN en PowerPoint (18/10/2026).
 * Fuente de verdad: recursos/vision-maqueta/MAQUETA-VISION.pptx.
 *
 * SEGUNDA lectura del PPTX, esta vez completa (la primera aplanó su maqueta y
 * no se parecía en nada — con razón se enfadó). Lo que se respeta ahora:
 *
 *  · El ORDEN DE CAPAS de cada diapositiva (el z-order del XML): la foto,
 *    encima los bloques negros que la parten, encima el texto.
 *  · Los PÁRRAFOS con sus saltos y sus sangrías de espacios (white-space
 *    pre-wrap en escritorio): «se cruzaron / con la iNQUIETUD de explicar /
 *        nuestra propia existencia.» es una escalera, no una línea.
 *  · Los RESALTES (highlight de PowerPoint): su contraste es texto claro
 *    sobre banda negra de subrayador, no texto negro — eso fue un error de
 *    mi primera lectura, que tomó el color del resalte por el de la letra.
 *  · Las FORMAS: columna y rendija negras sobre las dunas, banda negra
 *    atravesando la azotea bajo RESPIRAR, banda ROJA al 82 % bajo «nuestra
 *    propia existencia».
 *  · La correlación EXACTA de cuerpos: 1pt del PPTX = 1/9,6 cqw del lienzo
 *    (13,33 pulgadas = 100 %), sin ajustes de mi cosecha.
 *
 * «hereda» en el XML (texto sin color explícito): sobre resalte negro se
 * sirve hueso E8E4E2 (así se ve en su PowerPoint); sobre resalte gris,
 * negro (texto claro sobre gris no se leería).
 *
 * En móvil las cajas fluyen en orden de lectura (las sangrías de espacios se
 * colapsan y las formas decorativas se esconden), con suelo de cuerpo en rem.
 */

type Plano = 'mar' | 'dunas' | 'neon' | 'azotea' | 'pareja';

function menosMovimiento() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const entre01 = (n: number) => Math.max(0, Math.min(1, n));

/* Primero la fuente del Mac de Christian (tal cual la nombra el PPTX);
   detrás, la suplente de Google Fonts cargada en index.html. */
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
  /* Kokonor es tibetana, sin latinas: su PowerPoint la sustituye por una
     serif italica elegante — eso es lo que Christian ve y eligio. */
  kokonor: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  courier: "'Courier New', monospace",
} as const;

type Run = {
  t: string;
  f: keyof typeof FUENTE;
  pt: number;
  /** hex sin almohadilla */
  c: string;
  i?: boolean;
  b?: boolean;
  /** letterspacing en em */
  spc?: number;
  /** resalte de subrayador detrás del texto (hex) */
  res?: string;
};

type Parrafo = { runs: Run[]; sangria?: number };
type Pieza =
  | { tipo: 'video'; plano: Plano; x: number; y: number; w: number; ratio: number }
  | { tipo: 'forma'; x: number; y: number; w: number; h: number; color: string; alpha?: number }
  | { tipo: 'caja'; x: number; y: number; w: number; parrafos: Parrafo[] };

type Lamina = { num: string; nombre: string; tinte: string; piezas: Pieza[] };

/* Coordenadas = pulgadas del PPTX a % del lienzo (x/13,33 · y/7,5).
   El orden de las piezas ES el z-order de su diapositiva. */
const LAMINAS: Lamina[] = [
  {
    num: '01', nombre: 'FUEGO', tinte: 'DA5C40',
    piezas: [
      { tipo: 'video', plano: 'neon', x: 3.1, y: 26.0, w: 80.5, ratio: 10.73 / 4.66 },
      { tipo: 'caja', x: 3.1, y: 9.3, w: 72, parrafos: [{ runs: [
        { t: 'X', f: 'anton', pt: 60, c: 'C00000' },
        { t: 'ALVAJE ', f: 'anton', pt: 44, c: 'FBF7F5' },
        { t: 'nace del fuego', f: 'hoefler', pt: 32, c: 'FBF7F5' },
        { t: '.', f: 'anton', pt: 44, c: 'FBF7F5' },
      ]}]},
      /* La banda de typewriter: más ancha que la foto, texto claro sobre
         resalte negro (SU contraste) */
      { tipo: 'caja', x: 1.4, y: 31.2, w: 98.6, parrafos: [{ runs: [
        { t: '...de un principio que, sin saberlo, comenzó hace años', f: 'typew', pt: 20, c: 'E8E4E2', i: true, spc: 0.3, res: '000000' },
        { t: ',', f: 'cormorant', pt: 28, c: 'E8E4E2', i: true, spc: 0.3, res: '000000' },
      ]}]},
      /* Escalonado con párrafos y sangrías de espacios, como en su PPTX */
      { tipo: 'caja', x: 3.1, y: 44.3, w: 79.4, parrafos: [
        { sangria: 2.85, runs: [{ t: '– cuando la pasión por', f: 'typew', pt: 20, c: 'E8E4E2' }] },
        { runs: [] },
        { runs: [{ t: '                            el arte, el cine y todas las formas de expresión', f: 'typew', pt: 20, c: 'E8E4E2' }] },
      ]},
      { tipo: 'caja', x: 55.9, y: 71.9, w: 42, parrafos: [
        { runs: [{ t: 'se cruzaron', f: 'cormorant', pt: 32, c: 'FFFFFF', i: true, spc: -0.05 }] },
        { runs: [
          { t: 'con ', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true, spc: -0.05 },
          { t: 'la ', f: 'cormorant', pt: 32, c: 'FFFFFF', i: true, spc: -0.05 },
          { t: 'i', f: 'engraved', pt: 36, c: 'C00000', i: true, spc: -0.05 },
          { t: 'nquietud ', f: 'arkadelphia', pt: 36, c: 'C00000', i: true, spc: -0.05 },
          { t: 'de ', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true, spc: -0.05 },
          { t: 'explicar', f: 'kokonor', pt: 28, c: 'FFFFFF', i: true, spc: -0.05 },
        ]},
        { runs: [{ t: '                nuestra propia existencia.', f: 'kokonor', pt: 28, c: 'FFFFFF', i: true, spc: -0.05 }] },
      ]},
      /* Su brochazo rojo bajo «nuestra propia existencia» */
      { tipo: 'forma', x: 66.0, y: 91.8, w: 31.5, h: 0.9, color: 'C00000', alpha: 0.9 },
    ],
  },
  {
    num: '02', nombre: 'TIERRA', tinte: 'C9A36B',
    piezas: [
      { tipo: 'video', plano: 'dunas', x: 2.8, y: 19.6, w: 94.4, ratio: 12.58 / 5.03 },
      /* La columna y la rendija negras que parten la foto */
      { tipo: 'forma', x: 24.3, y: 12.7, w: 12.5, h: 86.5, color: '000000' },
      { tipo: 'caja', x: 4.5, y: 14.7, w: 62, parrafos: [{ runs: [{ t: 'NACE DE LA TIERRA.', f: 'anton', pt: 44, c: 'FBF7F5' }] }] },
      { tipo: 'caja', x: 4.5, y: 32.9, w: 62, parrafos: [{ runs: [{ t: 'De la materia que se sedimentó durante millones de años', f: 'jost', pt: 18, c: 'E8E4E2' }] }] },
      { tipo: 'forma', x: 87.7, y: 3.1, w: 2.4, h: 94.8, color: '000000' },
      { tipo: 'caja', x: 36.8, y: 72.4, w: 60, parrafos: [{ runs: [{ t: 'para convertirse en todo lo que hoy conocemos, tocamos y habitamos.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] }] },
    ],
  },
  {
    num: '03', nombre: 'AIRE', tinte: 'FBF7F5',
    piezas: [
      { tipo: 'video', plano: 'azotea', x: 3.8, y: 24.5, w: 84, ratio: 11.2 / 5.2 },
      { tipo: 'caja', x: 4.5, y: 14.7, w: 62, parrafos: [{ runs: [{ t: 'NACE DEL AIRE.', f: 'anton', pt: 44, c: 'FBF7F5' }] }] },
      { tipo: 'caja', x: 5.3, y: 26.7, w: 62, parrafos: [{ runs: [{ t: 'De ese gesto involuntario que nuestro cuerpo repite para sobrevivir.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] }] },
      /* La banda negra que atraviesa la foto a la altura de RESPIRAR */
      { tipo: 'forma', x: 1.8, y: 43.6, w: 89.5, h: 13.5, color: '000000' },
      { tipo: 'caja', x: 3.8, y: 43.2, w: 62, parrafos: [{ runs: [{ t: 'RESPIRAR.', f: 'anton', pt: 44, c: 'DA5C40' }] }] },
      { tipo: 'caja', x: 4.5, y: 52.0, w: 62, parrafos: [{ runs: [{ t: 'SIN PENSARLO. SIN DECIDIRLO.', f: 'jost', pt: 18, c: 'E8E4E2', spc: 0.33 }] }] },
      { tipo: 'caja', x: 35.3, y: 85.9, w: 62, parrafos: [{ runs: [{ t: 'Simplemente porque algo dentro de nosotros sabe que tiene que hacerlo.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] }] },
    ],
  },
  {
    num: '04', nombre: 'AGUA', tinte: '6EA5FF',
    piezas: [
      { tipo: 'video', plano: 'mar', x: 27.5, y: 14.4, w: 72.5, ratio: 10.09 / 4.29 },
      { tipo: 'caja', x: 3.8, y: 11.9, w: 62, parrafos: [{ runs: [{ t: 'NACE DEL AGUA.', f: 'anton', pt: 44, c: 'FBF7F5' }] }] },
      { tipo: 'caja', x: 3.8, y: 20.4, w: 46, parrafos: [{ runs: [{ t: 'De lo que recorre nuestro cuerpo, lo nutre y conecta cada parte con las demás.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] }] },
      { tipo: 'caja', x: 3.8, y: 36.9, w: 46, parrafos: [{ runs: [{ t: 'Lo que fluye, transforma, erosiona y, a veces, CORROE', f: 'jost', pt: 18, c: 'E8E4E2' }] }] },
      { tipo: 'caja', x: 49.7, y: 44.7, w: 46, parrafos: [{ runs: [{ t: 'todo lo que encuentra a su paso.', f: 'jost', pt: 18, c: 'E8E4E2' }] }] },
      /* Resalte gris de subrayador; el punto final lo resaltó en negro
         (desaparece a propósito o por accidente: se respeta) */
      { tipo: 'caja', x: 49.7, y: 59.1, w: 46, parrafos: [{ runs: [
        { t: 'LA SEGURIDAD, LA CALMA', f: 'jost', pt: 20, c: '000000', b: true, spc: 0.3, res: 'C0C0C0' },
        { t: '.', f: 'jost', pt: 20, c: '000000', b: true, res: '000000' },
      ]}]},
      { tipo: 'caja', x: 3.0, y: 67.1, w: 70, parrafos: [{ runs: [
        { t: 'aquel cruce ', f: 'amtypew', pt: 28, c: 'C00000', i: true, res: '000000' },
        { t: 'LO INCENDIÓ TODO:', f: 'anton', pt: 32, c: 'FBF7F5', res: '000000' },
      ]}]},
      { tipo: 'caja', x: 6.4, y: 77.3, w: 62, parrafos: [{ runs: [{ t: 'Y nos dejó una sola salida:', f: 'script', pt: 28, c: 'FFFFFF', i: true }] }] },
      { tipo: 'caja', x: 39.5, y: 86.8, w: 25, parrafos: [{ runs: [{ t: 'CONTAR', f: 'anton', pt: 28, c: 'C00000' }] }] },
      { tipo: 'caja', x: 47.8, y: 88.9, w: 50, parrafos: [{ runs: [{ t: ', Y CAMBIAR LAS REGLAS DEL JUEGO.', f: 'anton', pt: 32, c: 'FBF7F5' }] }] },
    ],
  },
  {
    num: '05', nombre: '', tinte: 'DA5C40',
    piezas: [
      { tipo: 'video', plano: 'pareja', x: 68.3, y: 17.3, w: 28.5, ratio: 3.8 / 1.58 },
      { tipo: 'caja', x: 3.4, y: 8.0, w: 62, parrafos: [{ runs: [{ t: 'XALVAJE viene a contar esas historias.', f: 'jost', pt: 20, c: 'FFFFFF' }] }] },
      { tipo: 'caja', x: 3.4, y: 16.7, w: 62, parrafos: [{ runs: [{ t: 'LAS QUE NOS ATRAVIESAN.', f: 'anton', pt: 30, c: 'FBF7F5' }] }] },
      { tipo: 'caja', x: 7.2, y: 23.5, w: 62, parrafos: [{ runs: [{ t: 'LAS QUE NOS INCOMODAN.', f: 'anton', pt: 36, c: 'FBF7F5' }] }] },
      { tipo: 'caja', x: 12.0, y: 32.4, w: 62, parrafos: [{ runs: [{ t: 'LAS QUE NOS TRANSFORMAN.', f: 'anton', pt: 42, c: 'FBF7F5' }] }] },
      /* El color va DENTRO de la frase: NO y ATREVEMOS en su rojo */
      { tipo: 'caja', x: 18.0, y: 44.0, w: 53, parrafos: [{ runs: [
        { t: 'LAS QUE ', f: 'anton', pt: 48, c: 'FBF7F5' },
        { t: 'NO', f: 'anton', pt: 48, c: 'C00000' },
        { t: ' NOS ', f: 'anton', pt: 48, c: 'FBF7F5' },
        { t: 'ATREVEMOS', f: 'anton', pt: 48, c: 'C00000' },
        { t: ' A CONTAR.', f: 'anton', pt: 48, c: 'FBF7F5' },
      ]}]},
      /* El hueco grande antes de las dos ultimas frases es parte del diseno */
      { tipo: 'caja', x: 3.4, y: 78.0, w: 70, parrafos: [{ runs: [{ t: 'Porque hay historias que NO VIENEN A ENTRETENERNOS.', f: 'cormorant', pt: 28, c: 'FFFFFF', i: true }] }] },
      { tipo: 'caja', x: 12.4, y: 87.5, w: 86, parrafos: [{ runs: [
        { t: 'VIENEN A ', f: 'anton', pt: 40, c: 'FBF7F5' },
        { t: 'RECORDARNOS QUIÉNES SOMOS.', f: 'typew', pt: 30, c: '000000', spc: 0.2, res: 'C00000' },
      ]}]},
    ],
  },
];

/** Equivalencia EXACTA con su PPTX: el lienzo mide 13,33 pulgadas = 959,76pt,
 *  asi que 1pt = anchoLamina/959,76 px. La escala la mide un ResizeObserver y
 *  vive en --ptpx en cada lamina (cqw fallaba en Safari y todo caia al suelo
 *  en rem: se veia a la mitad, 18/10/2026). El suelo en rem solo manda en
 *  movil. */
const cuerpo = (pt: number) => `max(calc(${pt} * var(--ptpx, 0.125rem)), ${(pt * 0.05).toFixed(2)}rem)`;

function CajaTexto({ pieza }: { pieza: Extract<Pieza, { tipo: 'caja' }> }) {
  return (
    <div
      className="relative lg:absolute mb-5 lg:mb-0 lg:w-[var(--w)] lg:left-[var(--x)] lg:top-[var(--y)]"
      style={{ ['--x' as string]: `${pieza.x}%`, ['--y' as string]: `${pieza.y}%`, ['--w' as string]: `${pieza.w}%` }}
    >
      {pieza.parrafos.map((p, pi) =>
        p.runs.length === 0 ? (
          <p key={pi} aria-hidden className="m-0 hidden lg:block" style={{ height: '0.5em' }} />
        ) : (
          <p
            key={pi}
            className="m-0 leading-[1.12] whitespace-normal lg:whitespace-pre-wrap"
            style={{ paddingLeft: p.sangria ? `${p.sangria}%` : undefined }}
          >
            {p.runs.map((r, i) => (
              <span
                key={i}
                style={{
                  fontFamily: FUENTE[r.f],
                  fontSize: cuerpo(r.pt),
                  color: `#${r.c}`,
                  fontStyle: r.i ? 'italic' : 'normal',
                  fontWeight: r.b ? 700 : r.f === 'jost' ? 300 : r.f === 'kokonor' ? 500 : 400,
                  letterSpacing: r.spc ? `${r.spc}em` : undefined,
                  ...(r.res
                    ? {
                        backgroundColor: `#${r.res}`,
                        padding: '0.08em 0.22em',
                        boxDecorationBreak: 'clone' as const,
                        WebkitBoxDecorationBreak: 'clone' as const,
                      }
                    : {
                        /* Seguro mínimo de lectura sobre el vídeo; donde él
                           quiso contraste de verdad ya están sus resaltes */
                        textShadow: '0 1px 8px rgba(0,0,0,0.55)',
                      }),
                }}
              >
                {r.t}
              </span>
            ))}
          </p>
        )
      )}
    </div>
  );
}

export function NuestraVision() {
  const seccion = useRef<HTMLElement>(null);
  const [quieto] = useState(menosMovimiento);

  /* La escala tipografica de cada lamina: px por punto del PPTX. */
  useEffect(() => {
    const s = seccion.current;
    if (!s) return;
    const laminas = Array.from(s.querySelectorAll<HTMLElement>('[data-lamina]'));
    const medir = () => {
      for (const l of laminas) l.style.setProperty('--ptpx', `${(l.clientWidth / 959.76).toFixed(4)}px`);
    };
    medir();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    laminas.forEach((l) => ro?.observe(l));
    window.addEventListener('resize', medir);
    return () => { ro?.disconnect(); window.removeEventListener('resize', medir); };
  }, []);

  /* Las ventanas: abrirse al entrar, paralaje dentro, reproducir lo cercano. */
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
            data-lamina
            className="relative mt-14 lg:mt-20 lg:aspect-[16/9] lg:overflow-hidden"
          >
            {l.nombre && (
              <span
                aria-hidden
                className="block lg:absolute lg:left-[4.5%] lg:top-[4.7%] mb-4 lg:mb-0 font-geist-mono uppercase text-[0.72rem] tracking-[0.55em]"
                style={{ color: `#${l.tinte}` }}
              >
                {l.num} · {l.nombre}
              </span>
            )}

            {/* El orden de las piezas es el z-order de su diapositiva */}
            {l.piezas.map((p, i) => {
              if (p.tipo === 'video') {
                return (
                  <span
                    key={i}
                    data-ventana
                    aria-hidden
                    className="relative lg:absolute block my-5 lg:my-0 w-full lg:w-[var(--w)] lg:left-[var(--x)] lg:top-[var(--y)] ring-1 ring-inset ring-white/15"
                    style={{ ['--x' as string]: `${p.x}%`, ['--y' as string]: `${p.y}%`, ['--w' as string]: `${p.w}%`, aspectRatio: String(p.ratio) }}
                  >
                    <span data-abre className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(50% 0 50% 0)' }}>
                      <video
                        src={`/videos/vision/${p.plano}.mp4`}
                        poster={`/videos/vision/${p.plano}.jpg`}
                        loop muted playsInline preload="none"
                        className="absolute left-0 top-[-8%] w-full h-[116%] object-cover"
                      />
                    </span>
                  </span>
                );
              }
              if (p.tipo === 'forma') {
                return (
                  <span
                    key={i}
                    aria-hidden
                    className="hidden lg:block absolute"
                    style={{
                      left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%`,
                      backgroundColor: `#${p.color}`, opacity: p.alpha ?? 1,
                    }}
                  />
                );
              }
              return <CajaTexto key={i} pieza={p} />;
            })}
          </article>
        ))}
      </div>
    </section>
  );
}
