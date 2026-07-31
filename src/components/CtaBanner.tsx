import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { portfolioConfig } from '@/config';

/**
 * Banner de contacto que cierra las páginas interiores. Antes vivía dentro de
 * Proyectos, entre los cortometrajes y lo siguiente; ahora es el remate común.
 * La página de Contacto no lo usa: allí va el bloque completo (sección CTA).
 */
export function CtaBanner() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const { cta } = portfolioConfig;

  if (!cta.heading) return null;

  return (
    <section aria-labelledby="cta-banner" className="w-full bg-black pb-16 lg:pb-24">
      <div className="container-large px-6 lg:px-12">
        <div
          ref={ref}
          className={cn(
            'relative overflow-hidden reveal',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <img
            src="/images/cta-bg.webp"
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />

          <div className="relative px-8 py-14 lg:px-16 lg:py-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              {cta.label && (
                <span className="inline-flex items-center gap-3 text-xs font-geist-mono uppercase tracking-[0.25em] text-exvia-red-text">
                  {cta.label}
                  <span aria-hidden className="inline-block w-10 h-px bg-exvia-red" />
                </span>
              )}
              <h3
                id="cta-banner"
                className="mt-3 text-4xl lg:text-6xl font-display text-white uppercase tracking-[-0.02em] leading-[0.95] max-w-2xl"
              >
                {cta.heading}
              </h3>
            </div>

            {cta.linkText && (
              <Link
                to="/contacto"
                className="group inline-flex items-center gap-3 self-start lg:self-auto border border-white/40 hover:border-exvia-red hover:bg-exvia-red px-7 py-4 transition-colors"
              >
                <span className="text-sm font-geist-mono uppercase tracking-[0.2em] text-white">
                  {cta.linkText}
                </span>
                <ArrowUpRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
