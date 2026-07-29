import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

type Photo = {
  slug: string;
  alt: string;
  vertical: boolean;
};

const PHOTOS: Photo[] = [
  { slug: 'momentos-01', alt: 'Retrato masculino en clave oscura, manos sobre el rostro', vertical: false },
  { slug: 'amanda-01', alt: 'Retrato femenino con pieles sobre fondo oscuro', vertical: true },
  { slug: 'denisse-01', alt: 'Retrato femenino en estudio con luz cálida', vertical: true },
  { slug: 'eva-01', alt: 'Retrato infantil sobre fondo oscuro', vertical: false },
  { slug: 'jesus-01', alt: 'Retrato masculino con luz roja lateral', vertical: true },
  { slug: 'mama-01', alt: 'Retrato de mujer de pelo blanco en luz natural', vertical: false },
  { slug: 'amanda-02', alt: 'Retrato femenino en localización industrial', vertical: true },
  { slug: 'momentos-02', alt: 'Retrato femenino a contraluz con el pelo en movimiento', vertical: false },
  { slug: 'mamatita-01', alt: 'Retrato doble de dos mujeres en tonos tierra', vertical: true },
  { slug: 'amanda-03', alt: 'Retrato femenino tumbado en clave baja', vertical: false },
  { slug: 'amanda-04', alt: 'Retrato femenino sentado sobre pieles', vertical: true },
];

export function Photography() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.15 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const go = useCallback((step: number) => {
    setOpenIndex((current) =>
      current === null ? current : (current + step + PHOTOS.length) % PHOTOS.length
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

  const open = openIndex !== null ? PHOTOS[openIndex] : null;

  return (
    <section id="photography" className="w-full bg-neutral-900 py-24 lg:py-32">
      {/* Mismo contenedor que Proyectos, Nosotros y Servicios: sin esto la
          rejilla se iba a 1304 px y las fotos salían un 10 % más grandes que
          las tarjetas de Proyectos, y las dos secciones no cuadraban. */}
      <div ref={sectionRef} className="container-large px-6 lg:px-12">
        {/* Encabezado */}
        <div
          className={cn(
            'max-w-2xl mb-14 lg:mb-20 transition-all duration-800 ease-out-quart',
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          <span className="text-sm font-geist-mono uppercase tracking-[0.25em] text-white/60 mb-4 block">
            Retratos
          </span>
          <h2 className="font-display text-5xl lg:text-7xl uppercase tracking-[-0.01em] text-white mb-4">
            Fotografía
          </h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-xl">
            Retrato de autor: luz trabajada, dirección de mirada y una historia por cara.
            Estudio y localización.
          </p>
        </div>

        {/* Rejilla — respeta la proporción real de cada foto */}
        <div
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 lg:gap-6"
          onMouseLeave={() => setHovered(null)}
        >
          {PHOTOS.map((photo, i) => (
            <button
              key={photo.slug}
              type="button"
              onClick={() => setOpenIndex(i)}
              onMouseEnter={() => setHovered(i)}
              aria-label={`Ampliar: ${photo.alt}`}
              className={cn(
                'group block w-full mb-4 lg:mb-6 break-inside-avoid overflow-hidden',
                'rounded-sm cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-900',
                'transition-all duration-700 ease-out-quart',
                sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                // Las hermanas se apartan; la señalada se queda nítida
                hovered !== null && hovered !== i && 'opacity-40 blur-[2px]'
              )}
              style={{ transitionDelay: sectionVisible ? `${Math.min(i * 70, 700)}ms` : '0ms' }}
            >
              <div className={cn('relative w-full', photo.vertical ? 'aspect-[2/3]' : 'aspect-[3/2]')}>
                <img
                  loading="lazy"
                  decoding="async"
                  src={`/images/fotografia/${photo.slug}.webp`}
                  alt={photo.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.04]"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Visor a pantalla completa */}
      <Dialog open={openIndex !== null} onOpenChange={(v) => !v && setOpenIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="z-[100] max-w-none w-screen h-screen sm:max-w-none p-0 border-0 bg-black/95 rounded-none flex items-center justify-center"
        >
          <DialogTitle className="sr-only">{open?.alt ?? 'Fotografía'}</DialogTitle>

          {open && (
            <img
              src={`/images/fotografia/${open.slug}-full.webp`}
              alt={open.alt}
              className="max-w-[92vw] max-h-[86vh] object-contain"
            />
          )}

          {/* Controles — cada uno con su propio fondo: legibles caiga detrás la foto o el negro */}
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Cerrar"
            className="absolute top-6 right-6 z-10 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-sm font-geist-mono uppercase tracking-[0.2em] text-white hover:bg-black/90 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Foto anterior"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 grid place-items-center rounded-full bg-black/70 backdrop-blur-sm text-3xl leading-none text-white hover:bg-black/90 transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Foto siguiente"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 grid place-items-center rounded-full bg-black/70 backdrop-blur-sm text-3xl leading-none text-white hover:bg-black/90 transition-colors"
          >
            ›
          </button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-sm font-geist-mono tracking-[0.2em] text-white">
            {(openIndex ?? 0) + 1} / {PHOTOS.length}
          </span>
        </DialogContent>
      </Dialog>
    </section>
  );
}
