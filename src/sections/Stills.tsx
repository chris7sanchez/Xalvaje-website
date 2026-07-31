import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function Stills() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section id="stills" className="w-full min-h-screen bg-neutral-900 relative overflow-hidden">
      {/* Full screen image */}
      <div className="absolute inset-0">
        <img loading="lazy" decoding="async" 
          src="/images/still-producciones.webp" 
          alt="Stills de producción XALVAJE" 
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
              'reveal',
              sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            )}
          >
            <span className="text-sm font-geist-mono uppercase tracking-[0.25em] text-white/60 mb-4 block">
              Behind the Scenes
            </span>
            <h2 className="font-display text-5xl lg:text-7xl uppercase tracking-[-0.01em] text-white mb-4">
              Stills
            </h2>
            <p className="text-lg text-white/70 leading-relaxed max-w-xl">
              Los momentos detrás de cámara que dan vida a nuestras producciones. 
              Un vistazo al proceso creativo de XALVAJE.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
