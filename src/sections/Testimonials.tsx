import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { testimonialsConfig } from '@/config';

export function Testimonials() {
  if (!testimonialsConfig.testimonials.length) return null;

  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section id="testimonials" className="w-full py-12 bg-exvia-subtle/30 border-t border-exvia-border">
      <div ref={sectionRef} className="container-large px-6 lg:px-12">
        {/* Small header */}
        <div className="mb-8">
          <span className="text-xs font-geist-mono uppercase tracking-widest text-exvia-black/40">
            {testimonialsConfig.label}
          </span>
        </div>

        {/* Testimonials as small cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonialsConfig.testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-4 items-start transition-all duration-700 ease-out-quart',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Small avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                <img loading="lazy" decoding="async"
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-exvia-black/70 leading-relaxed mb-2 line-clamp-3">
                  "{testimonial.quote}"
                </p>
                <p className="text-xs font-medium text-exvia-black">
                  {testimonial.author}
                </p>
                <p className="text-xs text-exvia-black/50">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
