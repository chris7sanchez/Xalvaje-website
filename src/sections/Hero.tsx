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
  // Portada-menú: al llegar al último fotograma se congela el scroll del
  // documento (overflow hidden — sin pelear con la inercia, sin vibración).
  // Hacia abajo solo se sale pulsando un enlace del menú; un gesto de scroll
  // hacia arriba descongela para poder rebobinar la secuencia.
  // Si se entra con un ancla en la URL (/#portfolio), el visitante quiere ir
  // directo a esa sección: el tope no debe aplicarse.
  const unlockedRef = useRef(
    typeof window !== 'undefined' && window.location.hash.length > 1
  );
  const lockedRef = useRef(false);
  // Tras descongelar rebobinando, no se vuelve a congelar hasta salir de la
  // zona final; si no, el primer gesto de subida quedaría atrapado al instante.
  const suppressRelockRef = useRef(false);
  const [locked, setLocked] = useState(false);

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

      // Congelación al final del hero. Se activa EN CUANTO aparece el último
      // fotograma, no al agotar el recorrido: como la sección es sticky y
      // ocupa toda la pantalla, congelar aquí se ve idéntico y evita que la
      // inercia se pase del final y haya que recolocar (eso era el salto).
      const finalZone = 1 - 1 / heroConfig.scrubFrameCount;
      if (raw < finalZone) suppressRelockRef.current = false;
      if (
        !unlockedRef.current &&
        !lockedRef.current &&
        !suppressRelockRef.current &&
        raw >= finalZone
      ) {
        lockedRef.current = true;
        setLocked(true);
        setProgress(1);
        document.documentElement.style.overflow = 'hidden';
        // Solo si la inercia ya se pasó del final (la siguiente sección
        // asomaba), se recoloca; en el caso normal no hay ningún ajuste.
        const lockY = el.offsetTop + el.offsetHeight - viewportH;
        if (window.scrollY > lockY) window.scrollTo(0, lockY);
      }
    });
  }, []);

  const releaseLock = useCallback(() => {
    if (!lockedRef.current) return;
    lockedRef.current = false;
    suppressRelockRef.current = true;
    setLocked(false);
    document.documentElement.style.overflow = '';
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, reducedMotion]);

  // Salidas de la congelación:
  // 1) Clic en cualquier enlace de ancla (nav o zonas del hero): desbloqueo
  //    definitivo y scroll normal a partir de ahí. En captura, para restaurar
  //    el overflow ANTES del scrollIntoView del enlace.
  // 2) Gesto de scroll hacia ARRIBA (rueda o dedo): descongela para poder
  //    rebobinar la secuencia; si se vuelve a llegar al final, se recongela.
  useEffect(() => {
    if (reducedMotion) return;

    const unlock = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('a[href^="#"]')) {
        unlockedRef.current = true;
        releaseLock();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (lockedRef.current && e.deltaY < 0) releaseLock();
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      // Dedo bajando = intención de subir la página
      if (lockedRef.current && y > touchStartY + 12) releaseLock();
    };

    document.addEventListener('click', unlock, true);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      document.removeEventListener('click', unlock, true);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      // Nunca dejar la página sin scroll si el componente se desmonta
      document.documentElement.style.overflow = '';
    };
  }, [reducedMotion, releaseLock]);

  if (!heroConfig.headlineLines.length && !heroConfig.name) return null;

  const scrubProgress = progress;

  const currentFrame = reducedMotion
    ? frameCount - 1
    : Math.min(frameCount - 1, Math.floor(scrubProgress * frameCount));

  const showZones = reducedMotion || scrubProgress > 0.6;
  const showScrollCue = !reducedMotion && progress < 0.05;
  // Tramo de portada: los fotogramas ya han terminado y la imagen final
  // permanece fija en pantalla.
  const isFinalFrame = reducedMotion || scrubProgress >= 1;

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
            style={{ width: `${scrubProgress * 100}%` }}
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
          {/* Vignette cinematográfico. Son DOS capas que se funden por opacidad:
              un `background` con gradiente no se puede animar (el navegador lo
              cambia de golpe y se ve un salto de luz), pero la opacidad sí. */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)',
            }}
          />
          <div
            className={cn(
              'absolute inset-0 pointer-events-none z-20 transition-opacity duration-1000 ease-out',
              isFinalFrame ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.72) 100%)',
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

        {/* Cue final: aquí el scroll está topado a propósito, así que el aviso
            dirige al menú en vez de invitar a seguir bajando. */}
        <div
          className={cn(
            'absolute bottom-6 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-700 flex flex-col items-center gap-2',
            isFinalFrame && revealReady ? 'opacity-70' : 'opacity-0'
          )}
        >
          <span className="text-[0.6rem] font-geist-mono uppercase tracking-[0.35em] text-white text-center">
            {locked ? 'Elige una sección' : 'Descubre XALVAJE'}
          </span>
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
