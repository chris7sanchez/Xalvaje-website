import { useEffect, useRef, useState, useCallback, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { heroConfig, reelConfig } from '@/config';

// Alto del contenedor de scroll, en "pantallas" (vh). Da el recorrido
// necesario para que el scrub de fotogramas se sienta gradual, no un salto.
const SCRUB_SCREENS = 3.5;

// En móvil se sirven los fotogramas de 800x450: los de escritorio son 1600x900
// y suman 3,36 MB, que ahogaban la conexión y hacían que las fotos de las demás
// secciones tardasen en aparecer.
const esPantallaPequena = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

function frameUrl(index: number, pequena: boolean) {
  const n = String(index + 1).padStart(3, '0');
  const prefijo = pequena
    ? heroConfig.scrubFramePathPrefixSmall
    : heroConfig.scrubFramePathPrefix;
  return `${prefijo}${n}.webp`;
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
  const [pequena] = useState(esPantallaPequena);
  const [reelOpen, setReelOpen] = useState(false);
  // En ref además de en estado: los handlers de gesto la consultan sin obligar
  // a re-crear el efecto. Si el efecto se re-ejecutase, su limpieza pondría
  // overflow:'' y descongelaría el hero justo al abrir el reel.
  const reelOpenRef = useRef(false);

  const frameCount = heroConfig.scrubFrameCount;

  // Revela el hero en cuanto el primer fotograma está listo, o tras un
  // timeout de seguridad: un fotograma lento o ausente nunca deja la
  // pantalla en negro (fondo de respaldo de heroConfig.backgroundImage).
  useEffect(() => {
    const t = setTimeout(() => setTimeoutElapsed(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Precarga de TODOS los fotogramas en segundo plano al abrir la página.
  // Sin esto, la primera pasada del scroll pide imágenes que aún no han
  // llegado y la secuencia va a trompicones; con la caché caliente, fluye.
  useEffect(() => {
    if (reducedMotion) return;
    let cancelado = false;
    // Guardamos las referencias: si el navegador descarta el bitmap decodificado
    // porque nadie lo retiene, volveríamos a tener el tirón.
    const retenidas: HTMLImageElement[] = [];
    const TANDA = 6;

    // Esperamos a que la página termine de cargar antes de pedir los 60
    // fotogramas: si arrancan a la vez, se comen el ancho de banda y las fotos
    // de las demás secciones tardan en aparecer (se notaba mucho en móvil).
    const esperarCarga = () =>
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((res) => window.addEventListener('load', () => res(), { once: true }));

    (async () => {
      await esperarCarga();
      for (let inicio = 0; inicio < frameCount && !cancelado; inicio += TANDA) {
        const lote = Math.min(TANDA, frameCount - inicio);
        await Promise.all(
          Array.from({ length: lote }, async (_, k) => {
            const img = new Image();
            img.src = frameUrl(inicio + k, pequena);
            retenidas.push(img);
            try {
              // decode() es la clave: descargar no es suficiente, hay que tener
              // el bitmap listo ANTES de que el scroll pida el fotograma.
              await img.decode();
            } catch {
              // Un fotograma que falle no debe frenar a los demás
            }
          })
        );
      }
    })();

    return () => {
      cancelado = true;
      // No vaciamos los src: abortar la precarga es justamente lo que dejaba
      // la primera pasada sin decodificar.
    };
  }, [frameCount, reducedMotion, pequena]);
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
        // ORDEN CRÍTICO: recolocar PRIMERO y apagar el scroll DESPUÉS.
        // Con overflow hidden ya puesto, Chrome puede ignorar el scrollTo y
        // dejar la página pasada de largo (se veía la sección blanca).
        const lockY = el.offsetTop + el.offsetHeight - viewportH;
        // 'instant' es obligatorio: el CSS pone scroll-behavior:smooth en <html>,
        // así que un scrollTo normal se ANIMA. Esta recolocación debe ser
        // imperceptible; animada se veía como un salto de la página al llegar
        // al último fotograma, y encima competía con la inercia del gesto.
        if (window.scrollY > lockY) window.scrollTo({ top: lockY, behavior: 'instant' });
        // En body, no en <html>: es el método estándar de bloqueo (modales)
        // y conserva la posición de scroll en todos los navegadores.
        document.body.style.overflow = 'hidden';
      }
    });
  }, []);

  useEffect(() => {
    reelOpenRef.current = reelOpen;
  }, [reelOpen]);

  const releaseLock = useCallback(() => {
    if (!lockedRef.current) return;
    lockedRef.current = false;
    suppressRelockRef.current = true;
    setLocked(false);
    document.body.style.overflow = '';
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
      if (reelOpenRef.current) return;
      if (lockedRef.current && e.deltaY < 0) releaseLock();
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (reelOpenRef.current) return;
      if (!lockedRef.current) return;
      const y = e.touches[0]?.clientY ?? 0;
      if (y > touchStartY + 12) {
        // Dedo bajando = intención de subir la página: descongelar
        releaseLock();
      } else if (y < touchStartY) {
        // Dedo subiendo = intento de seguir bajando: bloquear el gesto
        // (iOS puede ignorar overflow:hidden en body; esto lo cubre)
        e.preventDefault();
      }
    };

    document.addEventListener('click', unlock, true);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      document.removeEventListener('click', unlock, true);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      // Nunca dejar la página sin scroll si el componente se desmonta
      document.body.style.overflow = '';
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
              src={frameUrl(i, pequena)}
              alt={i === 0 ? 'XALVAJE — rodaje' : ''}
              aria-hidden={i !== 0}
              className={cn(
                // En móvil, CONTAIN: el fotograma es 16:9 y una pantalla vertical
                // es 0,46, así que con cover solo se veía el 26 % del ancho del
                // garaje. Con contain se ve entero y las franjas las rellena el
                // fondo borroso que va detrás (z-0).
                'absolute inset-0 w-full h-full object-contain md:object-cover',
                i === currentFrame ? 'opacity-100' : 'opacity-0'
              )}
              // Todos eager: los 60 están dentro del viewport (absolute inset-0),
              // así que 'lazy' no ahorraba nada y retrasaba la primera pasada.
              // Es la misma URL que precarga el efecto de arriba: una sola petición.
              loading="eager"
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

        {/* Reel: en el centro exacto del encuadre, que es donde cae el cruce de
            la X. Vale para cualquier pantalla porque object-cover centra la
            imagen, así que el centro del contenedor y el de la X coinciden.
            Aparece con las zonas: es el momento en que el hero se congela como
            portada-menú y el visitante está eligiendo a dónde ir.
            Lleva fondo negro propio: el cruce de la X es la zona MÁS iluminada
            del fotograma y un botón claro ahí sería invisible. */}
        {reelConfig.src && (
          <div
            className={cn(
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-700 ease-out',
              showZones ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            )}
          >
            <button
              type="button"
              onClick={() => setReelOpen(true)}
              aria-label={`${reelConfig.label}: vídeo de 90 segundos`}
              className="group flex flex-col items-center gap-3 focus:outline-none"
            >
              <span className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/70 bg-black/55 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/80 group-hover:border-white group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black/50">
                {/* Triángulo de play, ligeramente descentrado para que se vea óptico */}
                <span
                  aria-hidden
                  className="ml-1 block w-0 h-0 border-y-[9px] border-y-transparent border-l-[15px] border-l-white transition-transform duration-300 group-hover:scale-110"
                />
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm text-[0.65rem] sm:text-xs font-geist-mono uppercase tracking-[0.22em] text-white">
                {reelConfig.label}
              </span>
            </button>
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
        {/* pb-28 en móvil: el tagline ocupa tres líneas ahí y llegaba a 16 px del
            fondo, pisándose con el aviso de scroll ("Descubre XALVAJE" /
            "Scroll para explorar"), que va en bottom-6. Texto sobre texto. */}
        <div className="relative z-20 flex flex-col items-center justify-end min-h-screen px-6 lg:px-12 pointer-events-none pb-28 md:pb-20">
          <div
            className={cn(
              'text-center transition-all duration-1000 ease-out',
              revealReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            )}
            style={{ transitionDelay: '900ms' }}
          >
            {heroConfig.headlineLines[0] && (
              <h1 className="font-display-serif font-light text-[clamp(2.75rem,8.5vw,6.5rem)] text-white tracking-[-0.015em] leading-[1.05] drop-shadow-2xl">
                {heroConfig.headlineLines[0]}
              </h1>
            )}
            {heroConfig.headlineLines[1] && (
              <p className="mt-2 font-display-serif font-light italic text-[clamp(1.125rem,3.4vw,2.125rem)] text-white/90 tracking-[0.005em] leading-snug drop-shadow-xl">
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

      {/* Visor del reel. Al cerrar hay que devolver el bloqueo del scroll si el
          hero estaba congelado: Radix gestiona su propio overflow y al soltarlo
          dejaría la página suelta a mitad de la portada-menú. */}
      <Dialog
        open={reelOpen}
        onOpenChange={(v) => {
          setReelOpen(v);
          if (!v && lockedRef.current) {
            document.body.style.overflow = 'hidden';
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="z-[100] max-w-none sm:max-w-none w-screen h-screen p-0 border-0 bg-black/95 rounded-none flex items-center justify-center"
        >
          <DialogTitle className="sr-only">Reel de XALVAJE Producciones</DialogTitle>

          {/* Ancho contenido a propósito: el reel es de 640x360 y a pantalla
              completa se vería blando. */}
          <video
            className="w-[92vw] max-w-4xl aspect-video bg-black"
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={reelConfig.poster}
          >
            <source src={reelConfig.src} type="video/mp4" />
            Tu navegador no puede reproducir vídeo.{' '}
            <a href={reelConfig.src} className="underline">
              Descargar el reel
            </a>
            .
          </video>

          <button
            type="button"
            onClick={() => setReelOpen(false)}
            aria-label="Cerrar el reel"
            className="absolute top-6 right-6 z-10 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-sm font-geist-mono uppercase tracking-[0.2em] text-white hover:bg-black/90 transition-colors"
          >
            Cerrar
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
