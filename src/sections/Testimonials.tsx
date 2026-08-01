import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { testimonialsConfig } from '@/config';

export function Testimonials() {
  // El hook va antes del return: llamarlo condicionalmente rompe el orden de
  // hooks de React.
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.15 });

  if (!testimonialsConfig.testimonials.length) return null;

  return (
    <section id="testimonials" className="w-full bg-black py-16 lg:py-64">
      <div ref={sectionRef} className="container-large px-6 lg:px-12">
        <div
          className={cn(
            'max-w-2xl mb-10 lg:mb-24 reveal',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-geist-mono uppercase tracking-[0.25em] text-exvia-red-text">
              {testimonialsConfig.label}
            </span>
            <span aria-hidden className="h-px w-12 bg-exvia-red/70" />
          </div>

          <h2 className="font-display uppercase text-white leading-[0.95] tracking-[0.02em] text-[clamp(2rem,4vw,4.25rem)]">
            {testimonialsConfig.heading}
          </h2>
        </div>

        {/* Sin avatares: las fotos que había eran de los propios socios puestas
            como si fueran clientes. Aquí la cita se sostiene sola. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {testimonialsConfig.testimonials.map((testimonial, index) => (
            <blockquote
              key={testimonial.author}
              className={cn(
                'flex flex-col reveal',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <span
                aria-hidden
                className="font-display text-exvia-red text-3xl lg:text-6xl leading-none mb-2 lg:mb-6 select-none"
              >
                &ldquo;
              </span>

              {/* Sin recortar: antes se truncaban a tres líneas y las citas
                  quedaban cortadas a mitad de frase. */}
              <p className="text-[0.8125rem] lg:text-2xl lg:leading-relaxed leading-snug text-white/80 flex-1">
                {testimonial.quote}
              </p>

              <span aria-hidden className="block w-10 h-px bg-exvia-red/70 mt-5 lg:mt-9 mb-3 lg:mb-6" />

              <footer>
                <p className="font-display uppercase text-white tracking-[0.05em] text-lg lg:text-2xl leading-none">
                  {testimonial.author}
                </p>
                <p className="mt-3 text-[0.6875rem] lg:text-xs font-geist-mono uppercase tracking-[0.2em] text-exvia-red-text">
                  {testimonial.role} &middot; {testimonial.company}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
