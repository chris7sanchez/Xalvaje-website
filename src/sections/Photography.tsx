import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function Photography() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section id="photography" className="w-full min-h-screen bg-neutral-900 relative overflow-hidden">
      {/* Full screen image */}
      <div className="absolute inset-0">
        <img loading="lazy" decoding="async" 
          src="/images/fotografia.webp" 
          alt="Fotografía XALVAJE" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div ref={sectionRef} className="relative z-10 min-h-screen flex flex-col justify-end p-8 lg:p-16">
        <div className="max-w-2xl">
          <div
            className={cn(
              'transition-all duration-800 ease-out-quart',
              sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            )}
          >
            <span className="text-sm font-geist-mono uppercase tracking-[0.25em] text-white/60 mb-4 block">
              Portfolio
            </span>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Fotografía
            </h2>
            <p className="text-lg text-white/70 leading-relaxed max-w-xl">
              Capturamos momentos que perduran. Desde retratos íntimos hasta campañas de moda, 
              cada imagen cuenta una historia única.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
