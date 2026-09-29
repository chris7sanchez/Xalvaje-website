import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useHoverCapaz } from '@/hooks/useHoverCapaz';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

type Fragmento = {
  slug: string;
  alt: string;
  vertical: boolean;
};

// Material suelto de rodaje sin categorizar por proyecto: lo que no encaja
// como cartel de un corto ni como retrato de Fotografía, pero sí cuenta algo
// del proceso. Fuente: carpeta "capturando momentos" que pasó el usuario.
const FRAGMENTOS: Fragmento[] = [
  { slug: 'fragmento-1', alt: 'Fragmento de rodaje XALVAJE', vertical: false },
  { slug: 'fragmento-2', alt: 'Fragmento de rodaje XALVAJE', vertical: false },
  { slug: 'fragmento-3', alt: 'Fragmento de rodaje XALVAJE', vertical: false },
  { slug: 'fragmento-4', alt: 'Fragmento de rodaje XALVAJE', vertical: false },
  { slug: 'fragmento-5', alt: 'Fragmento de rodaje XALVAJE', vertical: false },
  { slug: 'fragmento-6', alt: 'Fragmento de rodaje XALVAJE', vertical: false },
];

export function Fragmentos() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.15 });
  const [hovered, setHovered] = useState<number | null>(null);
  const hoverCapaz = useHoverCapaz();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const go = useCallback((step: number) => {
    setOpenIndex((current) =>
      current === null ? current : (current + step + FRAGMENTOS.length) % FRAGMENTOS.length
    );
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, go]);

  const open = openIndex !== null ? FRAGMENTOS[openIndex] : null;

  if (FRAGMENTOS.length === 0) return null;

  return (
    <section id="fragmentos" className="w-full bg-neutral-900 pt-6 lg:pt-8 pb-20 lg:pb-20">
      <div ref={sectionRef} className="container-large px-6 lg:px-12">
        <div
          className={cn(
            'max-w-2xl mb-8 lg:mb-12 reveal',
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          <h2 className="font-display text-[clamp(2.75rem,12vw,5.5rem)] leading-[0.9] uppercase tracking-[-0.02em] text-white mb-3">
            Fragmentos
          </h2>
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-geist-mono uppercase tracking-[0.25em] text-exvia-red-text">
              Detrás de cámara
            </span>
            <span aria-hidden className="h-px w-12 bg-exvia-red/70" />
          </div>
          <p className="text-lg text-white/70 leading-relaxed max-w-xl">
            Momentos sueltos de rodaje, sin encajar en un proyecto concreto: el proceso, no el resultado.
          </p>
        </div>

        <div
          className="columns-2 lg:columns-3 gap-3 sm:gap-4 lg:gap-5"
          onMouseLeave={() => setHovered(null)}
        >
          {FRAGMENTOS.map((foto, i) => (
            <button
              key={foto.slug}
              type="button"
              onClick={() => setOpenIndex(i)}
              onMouseEnter={() => hoverCapaz && setHovered(i)}
              aria-label={`Ampliar: ${foto.alt}`}
              className={cn(
                'group block w-full mb-3 lg:mb-5 break-inside-avoid overflow-hidden',
                'rounded-sm cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-900',
                'reveal',
                sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                hovered !== null && hovered !== i && 'opacity-40 blur-[2px]'
              )}
              style={{ transitionDelay: sectionVisible ? `${Math.min(i * 70, 700)}ms` : '0ms' }}
            >
              <div className={cn('relative w-full', foto.vertical ? 'aspect-[2/3]' : 'aspect-[3/2]')}>
                <img
                  loading="lazy"
                  decoding="async"
                  src={`/images/fragmentos/${foto.slug}.webp`}
                  alt={foto.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.04]"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(v) => !v && setOpenIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="z-[100] max-w-none w-screen h-screen sm:max-w-none p-0 border-0 bg-black/95 rounded-none flex items-center justify-center"
        >
          <DialogTitle className="sr-only">{open?.alt ?? 'Fragmento'}</DialogTitle>

          {open && (
            <img
              src={`/images/fragmentos/${open.slug}.webp`}
              alt={open.alt}
              className="max-w-[92vw] max-h-[86vh] object-contain"
            />
          )}

          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Cerrar"
            className="absolute top-6 right-6 z-10 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-sm font-geist-mono uppercase tracking-[0.2em] text-white hover:bg-black/90 transition-[background-color,transform] duration-300 active:scale-[0.97] active:duration-160"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Fragmento anterior"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 grid place-items-center rounded-full bg-black/70 backdrop-blur-sm text-3xl leading-none text-white hover:bg-black/90 transition-[background-color,transform] duration-300 active:scale-[0.97] active:duration-160"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Fragmento siguiente"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 grid place-items-center rounded-full bg-black/70 backdrop-blur-sm text-3xl leading-none text-white hover:bg-black/90 transition-[background-color,transform] duration-300 active:scale-[0.97] active:duration-160"
          >
            ›
          </button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-sm font-geist-mono tracking-[0.2em] text-white">
            {(openIndex ?? 0) + 1} / {FRAGMENTOS.length}
          </span>
        </DialogContent>
      </Dialog>
    </section>
  );
}
