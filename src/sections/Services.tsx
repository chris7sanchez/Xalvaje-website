import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { servicesConfig, type ServiceItem } from '@/config';

function ServiceRow({ service }: { service: ServiceItem }) {
  const [showBrands, setShowBrands] = useState(false);
  // Desplegable de la fila (solo actua en movil)
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();

  const goTo = (href: string) => {
    // Ahora son páginas: los antiguos anclas se traducen a su ruta.
    navigate(href);
  };

  return (
    <div className="relative border-t border-white/10 transition-colors duration-300 hover:bg-white/[0.03]">
      <div className="px-1 py-6 lg:py-12">
        <div className="flex flex-row items-baseline gap-3 lg:gap-10">
          {/* Sin numeracion: se quito de las fichas de Nosotros y de los
              encabezados de categoria de Proyectos, y aqui era el mismo
              recurso repetido. Sin imagen al pasar el raton: era la unica
              pieza puramente decorativa de la seccion, y el titulo a tamaño
              de cartel ya hace ese trabajo por si solo. */}

          <div className="flex-1">
            {/* En móvil la fila es un desplegable: solo el título ocupa sitio y
                el detalle se abre al tocar. Así la sección baja a la mitad sin
                recortar ni una palabra. En escritorio está todo visible y este
                botón no hace nada. */}
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              className="w-full flex items-baseline justify-between gap-3 text-left lg:pointer-events-none"
            >
              <h3 className="font-display uppercase text-white leading-[0.92] tracking-[0.01em] text-[clamp(2.25rem,6.4vw,6rem)]">
                {service.title}
              </h3>
              <span
                aria-hidden
                className={cn(
                  'lg:hidden shrink-0 text-exvia-red-text text-lg leading-none transition-transform duration-300',
                  abierto && 'rotate-45'
                )}
              >
                +
              </span>
            </button>

            <div className={cn(abierto ? 'block' : 'hidden', 'lg:block')}>
            <p className="mt-2 lg:mt-4 text-[0.8125rem] leading-snug lg:leading-relaxed text-white/70 max-w-lg">
              {service.description}
            </p>

            {service.link && service.linkLabel && (
              <button
                type="button"
                onClick={() => goTo(service.link!)}
                className="group mt-3.5 lg:mt-7 inline-flex items-center gap-4 border-b border-exvia-red/50 pb-1.5 text-xs font-geist-mono uppercase tracking-[0.22em] text-exvia-red-text hover:border-exvia-red hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-exvia-red focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              >
                {service.linkLabel}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </button>
            )}

            {service.brands && (
              <>
                <button
                  type="button"
                  onClick={() => setShowBrands((v) => !v)}
                  aria-expanded={showBrands}
                  className="group mt-3.5 lg:mt-7 inline-flex items-center gap-4 border-b border-exvia-red/50 pb-1.5 text-xs font-geist-mono uppercase tracking-[0.22em] text-exvia-red-text hover:border-exvia-red hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-exvia-red focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                >
                  {servicesConfig.brandsLabel}
                  <span
                    aria-hidden
                    className={cn('transition-transform duration-300', showBrands && 'rotate-90')}
                  >
                    &rarr;
                  </span>
                </button>

                {showBrands && (
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {service.brands.map((brand) => (
                      <span
                        key={brand}
                        className="px-4 py-2 border border-white/20 text-xs font-geist-mono uppercase tracking-[0.15em] text-white/80"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Services() {
  // Los hooks van SIEMPRE antes de cualquier return: con el early return
  // delante, React lanzaba el error de orden de hooks al ocultar la sección.
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.3 });
  const { ref: listRef, isVisible: listVisible } = useScrollAnimation({ threshold: 0.1 });

  if (!servicesConfig.heading && servicesConfig.services.length === 0) return null;

  return (
    <section id="services" className="w-full bg-black py-14 lg:py-44">
      <div className="container-large px-6 lg:px-12">
        <div ref={headerRef} className="max-w-2xl mb-8 lg:mb-16">
          <div
            className={cn(
              'flex items-center gap-4 mb-6 reveal',
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <span className="text-xs font-geist-mono uppercase tracking-[0.25em] text-exvia-red-text">
              {servicesConfig.label}
            </span>
            <span aria-hidden className="h-px w-12 bg-exvia-red/70" />
          </div>

          <h2
            className={cn(
              'font-display uppercase text-white leading-[0.95] tracking-[0.02em] text-[clamp(2rem,4vw,4.25rem)] reveal',
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            )}
            style={{ transitionDelay: '100ms' }}
          >
            {servicesConfig.heading}
          </h2>
        </div>

        <div
          ref={listRef}
          className={cn(
            'border-b border-white/10 reveal',
            listVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          {servicesConfig.services.map((service) => (
            <ServiceRow key={service.title} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
