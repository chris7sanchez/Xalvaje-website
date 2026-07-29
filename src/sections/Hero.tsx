import { useEffect, useRef, useState, useCallback, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { heroConfig } from '@/config';

// Alto del contenedor de scroll, en "pantallas" (vh). Da el recorrido
// necesario para que el scrub de fotogramas se sienta gradual, no un salto.
const SCRUB_SCREENS = 3.5;

function frameUrl(index: number) {
  const n = String(index + 1).padStart(3, '0');
  return `${heroConfig.scrubFramePathPrefix}${n}.webp`;
}

// El salto nativo del navegador a #ancla no es fiable en esta web (confirmado:
// tampoco funciona en el nav principal sin este mismo workaround). Mismo
// patrón que usa Navigation.tsx: conservamos el href real (SEO, teclado,
// abrir en pestaña nueva) y forzamos el scroll manualmente.
function handleZoneClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
}

export function Hero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [timeoutElapsed, setTimeoutElapsed] = useState(false);
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const tickingRef = useRef(false);

  const frameCount = heroConfig.scrubFrameCount;

  // Revela el hero en cuanto el primer fotograma está listo, o tras un
  // timeout de seguridad: un fotograma lento o ausente nunca deja la
  // pantalla en negro (fondo de respaldo de heroConfig.backgroundImage).
  useEffect(() => {
    const t = setTimeout(() => setTimeoutElapsed(true), 2500);
    return () => clearTimeout(t);
  }, []);
  const revealReady = firstFrameLoaded || timeoutElapsed;

  const handleScroll = useCallback(() => {
    if (tickingRef.current || !wrapperRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      const el = wrapperRef.current;
      tickingRef.current = false;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrollable = rect.height - viewportH;
      const active = rect.top < viewportH && rect.bottom > 0;
      setIsActive(active);
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const raw = -rect.top / scrollable;
      setProgress(Math.min(1, Math.max(0, raw)));
    });
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, reducedMotion]);

  if (!heroConfig.headlineLines.length && !heroConfig.name) return null;

  const currentFrame = reducedMotion
    ? Math.floor(frameCount / 2)
    : Math.min(frameCount - 1, Math.floor(progress * frameCount));

  const showZones = reducedMotion || progress > 0.6;
  const showScrollCue = !reducedMotion && progress < 0.05;
  // Tramo final: el último fotograma ya está fijo en pantalla (fin del scrub).
  // Marcamos este momento como "portada" intencional, no como un parón.
  const isFinalFrame = reducedMotion || progress > 0.92;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: reducedMotion ? '100vh' : `${SCRUB_SCREENS * 100}vh` }}
    >
      {/* Barra de progreso: solo mientras el hero está en pantalla */}
      {!reducedMotion && (
        <div
          className={cn(
            'fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent transition-opacity duration-300',
            isActive ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div
            className="h-full bg-exvia-red transition-[width] duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <section
        id="hero"
        className="sticky top-0 w-full h-screen overflow-hidden bg-neutral-900"
      >
        {/* Fondo de respaldo estático: se ve si los fotogramas tardan o fallan (nunca negro) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroConfig.backgroundImage})`,
            filter: 'blur(8px) brightness(0.6)',
          }}
        />

        {/* Cinematic fade-in overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black z-40 pointer-events-none transition-opacity duration-[1500ms] ease-out',
            revealReady ? 'opacity-0' : 'opacity-100'
          )}
        />

        {/* Secuencia de fotogramas del scroll-scrub */}
        <div className="absolute inset-0 z-10">
          {Array.from({ length: frameCount }).map((_, i) => (
            <img
              key={i}
              src={frameUrl(i)}
              alt={i === 0 ? 'XALVAJE — rodaje' : ''}
              aria-hidden={i !== 0}
              className={cn(
                'absolute inset-0 w-full h-full object-cover',
                i === currentFrame ? 'opacity-100' : 'opacity-0'
              )}
              loading={i < 3 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding="async"
              onLoad={i === 0 ? () => setFirstFrameLoaded(true) : undefined}
              onError={i === 0 ? () => setTimeoutElapsed(true) : undefined}
            />
          ))}
          {/* Vignette cinematográfico: se intensifica en el fotograma final
              para que la "portada" se lea como remate intencional, no como
              un frame cualquiera que se quedó congelado. */}
          <div
            className="absolute inset-0 pointer-events-none z-20 transition-[background] duration-700 ease-out"
            style={{
              background: isFinalFrame
                ? 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.72) 100%)'
                : 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        </div>

        {/* Zonas interactivas: aparecen sobre el fotograma final, etiquetas
            siempre visibles (no dependen de :hover, funcionan en móvil) */}
        {heroConfig.zones.length > 0 && (
          <div
            className={cn(
              'absolute inset-x-0 top-[38%] z-30 flex justify-center items-center gap-2 sm:gap-6 px-4 transition-all duration-700 ease-out',
              showZones ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            )}
          >
            {heroConfig.zones.map((zone) => (
              <a
                key={zone.href}
                href={zone.href}
                onClick={(e) => handleZoneClick(e, zone.href)}
                className="group relative px-3 py-2 sm:px-5 sm:py-3 text-center"
              >
                <span className="text-[0.65rem] sm:text-sm font-geist-mono uppercase tracking-[0.2em] text-white/90 group-hover:text-white transition-colors duration-300">
                  {zone.label}
                </span>
                <span className="absolute left-1/2 -bottom-0.5 h-px w-0 bg-exvia-red -translate-x-1/2 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
        )}

        {/* Role labels on sides */}
        {heroConfig.roles[0] && (
          <div
            className={cn(
              'absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-out',
              revealReady ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            )}
            style={{ transitionDelay: '1200ms' }}
          >
            <span className="text-xs font-geist-mono uppercase tracking-[0.3em] text-white/80">
              {heroConfig.roles[0]}
            </span>
          </div>
        )}
        {heroConfig.roles[1] && (
          <div
            className={cn(
              'absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-out',
              revealReady ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            )}
            style={{ transitionDelay: '1400ms' }}
          >
            <span className="text-xs font-geist-mono uppercase tracking-[0.3em] text-white/80">
              {heroConfig.roles[1]}
            </span>
          </div>
        )}

        {/* Content Container */}
        <div className="relative z-20 flex flex-col items-center justify-end min-h-screen px-6 lg:px-12 pointer-events-none pb-16 md:pb-20">
          <div
            className={cn(
              'text-center transition-all duration-1000 ease-out',
              revealReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
            style={{ transitionDelay: '900ms' }}
          >
            {heroConfig.headlineLines[0] && (
              <h1 className="text-[clamp(2.25rem,8vw,6rem)] font-black text-white uppercase tracking-[-0.03em] leading-[0.95] drop-shadow-2xl">
                {heroConfig.headlineLines[0]}
              </h1>
            )}
            {heroConfig.headlineLines[1] && (
              <p className="mt-1 text-[clamp(1rem,3.2vw,2rem)] font-medium text-white/85 uppercase tracking-[-0.01em] leading-tight drop-shadow-xl">
                {heroConfig.headlineLines[1]}
              </p>
            )}
            {heroConfig.tagline && (
              <p className="mt-4 text-xs sm:text-sm font-geist-mono uppercase tracking-[0.2em] text-white/60">
                {heroConfig.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Scroll cue inicial: invita a empezar el scrub */}
        <div
          className={cn(
            'absolute bottom-6 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-700',
            showScrollCue && revealReady ? 'opacity-70' : 'opacity-0'
          )}
        >
          <span className="text-[0.6rem] font-geist-mono uppercase tracking-[0.35em] text-white">
            Scroll para explorar
          </span>
        </div>

        {/* Cue final: reemplaza al de inicio una vez el scrub ha terminado,
            para que el tramo "fijo" se sienta como un remate, no como un corte. */}
        <div
          className={cn(
            'absolute bottom-6 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-700 flex flex-col items-center gap-2',
            isFinalFrame && revealReady ? 'opacity-70' : 'opacity-0'
          )}
        >
          <span className="text-[0.6rem] font-geist-mono uppercase tracking-[0.35em] text-white">
            Descubre XALVAJE
          </span>
          <span className="w-px h-6 bg-gradient-to-b from-white/70 to-transparent animate-pulse" />
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          }}
        />
      </section>
    </div>
  );
}
