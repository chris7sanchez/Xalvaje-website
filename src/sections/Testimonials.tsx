import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { testimonialsConfig } from '@/config';

export function Testimonials() {
  // El hook va antes del return: llamarlo condicionalmente rompe el orden de
  // hooks de React.
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.15 });

  if (!testimonialsConfig.testimonials.length) return null;

  return (
    <section id="testimonials" className="w-full bg-black py-24 lg:py-32">
      <div ref={sectionRef} className="container-large px-6 lg:px-12">
        <div
          className={cn(
            'max-w-2xl mb-14 lg:mb-16 transition-all duration-800 ease-out-quart',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-geist-mono uppercase tracking-[0.25em] text-exvia-red-text">
              {testimonialsConfig.label}
            </span>
            <span aria-hidden className="h-px w-12 bg-exvia-red/70" />
          </div>

          <h2 className="font-display uppercase text-white leading-[0.95] tracking-[0.02em] text-[clamp(2rem,4vw,3.25rem)]">
            {testimonialsConfig.heading}
          </h2>
        </div>

        {/* Sin avatares: las fotos que había eran de los propios socios puestas
            como si fueran clientes. Aquí la cita se sostiene sola. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {testimonialsConfig.testimonials.map((testimonial, index) => (
            <blockquote
              key={testimonial.author}
              className={cn(
                'flex flex-col transition-all duration-700 ease-out-quart',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <span
                aria-hidden
                className="font-display text-exvia-red text-5xl leading-none mb-4 select-none"
              >
                &ldquo;
              </span>

              {/* Sin recortar: antes se truncaban a tres líneas y las citas
                  quedaban cortadas a mitad de frase. */}
              <p className="text-[0.9375rem] leading-relaxed text-white/80 flex-1">
                {testimonial.quote}
              </p>

              <span aria-hidden className="block w-10 h-px bg-exvia-red/70 mt-7 mb-5" />

              <footer>
                <p className="font-display uppercase text-white tracking-[0.05em] text-lg leading-none">
                  {testimonial.author}
                </p>
                <p className="mt-2 text-[0.6875rem] font-geist-mono uppercase tracking-[0.2em] text-exvia-red-text">
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
