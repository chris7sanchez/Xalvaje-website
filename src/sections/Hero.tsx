import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Respeta el ahorro de datos del móvil: con él activado no se descarga el vídeo.
const conAhorroDeDatos = () => {
  if (typeof navigator === 'undefined') return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return c?.saveData === true;
};

function frameUrl(index: number, pequena: boolean) {
  const n = String(index + 1).padStart(3, '0');
  const prefijo = pequena
    ? heroConfig.scrubFramePathPrefixSmall
    : heroConfig.scrubFramePathPrefix;
  return `${prefijo}${n}.webp`;
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
  // Portada estática en móvil: sin scrub, sin congelación, sin precargar 60
  // fotogramas. Reutiliza la rama de reducedMotion, que ya está probada.
  const portadaEstatica = pequena && !!heroConfig.portadaMovil;
  // El vídeo manda sobre la imagen, salvo que se pida menos animación o haya
  // ahorro de datos: entonces se queda el póster fijo.
  const [ahorroDatos] = useState(conAhorroDeDatos);
  const portadaVideo =
    pequena && !!heroConfig.portadaMovilVideo && !reducedMotion && !ahorroDatos;
  const sinScrub = reducedMotion || portadaEstatica;
  const [reelOpen, setReelOpen] = useState(false);
  // En ref además de en estado: los handlers de gesto la consultan sin obligar
  // a re-crear el efecto. Si el efecto se re-ejecutase, su limpieza pondría
  // overflow:'' y descongelaría el hero justo al abrir el reel.
  const reelOpenRef = useRef(false);
  const navigate = useNavigate();

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
    if (sinScrub) return;
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
  }, [frameCount, sinScrub, pequena]);
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
    if (sinScrub) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, sinScrub]);

  // Salidas de la congelación:
  // 1) Clic en cualquier enlace de ancla (nav o zonas del hero): desbloqueo
  //    definitivo y scroll normal a partir de ahí. En captura, para restaurar
  //    el overflow ANTES del scrollIntoView del enlace.
  // 2) Gesto de scroll hacia ARRIBA (rueda o dedo): descongela para poder
  //    rebobinar la secuencia; si se vuelve a llegar al final, se recongela.
  useEffect(() => {
    if (sinScrub) return;

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
  }, [sinScrub, releaseLock]);

  if (!heroConfig.headlineLines.length && !heroConfig.name) return null;

  const scrubProgress = progress;

  const currentFrame = sinScrub
    ? frameCount - 1
    : Math.min(frameCount - 1, Math.floor(scrubProgress * frameCount));

  // La portada entra limpia: solo el logotipo y el aviso de scroll. El titular
  // se materializa a mitad del recorrido, cuando la escena se oscurece, y los
  // tres accesos aparecen al final.
  const showTitular = sinScrub || scrubProgress > 0.19;
  const showZones = sinScrub || scrubProgress > 0.62;
  /** Qué lama de los accesos está abierta. null = las cuatro por igual. */
  const [lamaAbierta, setLamaAbierta] = useState<number | null>(null);
  const showScrollCue = !sinScrub && progress < 0.08;
  // Tramo de portada: los fotogramas ya han terminado y la imagen final
  // permanece fija en pantalla.
  const isFinalFrame = sinScrub || scrubProgress >= 1;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: sinScrub ? '100vh' : `${SCRUB_SCREENS * 100}vh` }}
    >
      {/* Barra de progreso: solo mientras el hero está en pantalla */}
      {!sinScrub && (
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
            backgroundImage: `url(${portadaVideo ? heroConfig.portadaMovilVideoPoster : portadaEstatica ? heroConfig.portadaMovil : heroConfig.backgroundImage})`,
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

        {/* Portada estática en móvil: una sola imagen VERTICAL que llena la
            pantalla. Los 60 fotogramas son 16:9 y aquí o se recortaban al 26 %
            o dejaban 300 px de franja. */}
        <div className="absolute inset-0 z-10">
          {portadaVideo ? (
            <video
              className="absolute inset-0 w-full h-full object-cover object-center"
              src={heroConfig.portadaMovilVideo}
              poster={heroConfig.portadaMovilVideoPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="XALVAJE Producciones — rodaje en la nave"
              onCanPlay={() => setFirstFrameLoaded(true)}
              onError={() => setTimeoutElapsed(true)}
            />
          ) : portadaEstatica ? (
            <img
              src={heroConfig.portadaMovil}
              alt="XALVAJE Producciones — el logo pintado en la persiana del garaje"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center"
              onLoad={() => setFirstFrameLoaded(true)}
              onError={() => setTimeoutElapsed(true)}
            />
          ) : (
            Array.from({ length: frameCount }).map((_, i) => (
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
                'absolute inset-0 w-full h-full object-cover object-center',
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
            ))
          )}
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

        {/* LAS PERSIANAS. Aparecen sobre el fotograma final: cuatro lamas del
            mismo ancho con el rótulo en vertical, y la que se señala se abre en
            ventana mientras las otras tres se estrechan.

            El reparto va por `flex-grow` desde el estado y no por :hover a
            secas: hace falta que las NO señaladas también reaccionen, y eso el
            CSS suelto no lo puede expresar.

            Cerrada enseña un fotograma fijo; el <video> solo se monta en la que
            está abierta. La portada ya carga 60 fotogramas del scrub y cuatro
            clips a la vez encima de eso era pedirle demasiado. */}
        {heroConfig.zones.length > 0 && (
          <div
            className={cn(
              'absolute inset-x-0 top-[54%] -translate-y-1/2 z-30 px-4 sm:px-8 transition-[opacity,transform] duration-700 ease-out',
              showZones ? 'opacity-100 translate-y-[-50%]' : 'opacity-0 translate-y-[-40%] pointer-events-none'
            )}
          >
            <div
              className="flex mx-auto w-full max-w-5xl h-[30vh] sm:h-[34vh] md:h-[38vh] gap-3 sm:gap-4 lg:gap-6"
              onMouseLeave={() => setLamaAbierta(null)}
            >
              {heroConfig.zones.map((zone, i) => {
                const abierta = lamaAbierta === i;
                return (
                  <a
                    key={zone.href}
                    href={zone.href}
                    onMouseEnter={() => setLamaAbierta(i)}
                    onFocus={() => setLamaAbierta(i)}
                    onClick={(e) => {
                      e.preventDefault();
                      // Soltar el bloqueo ANTES de navegar: si no, la página de
                      // destino se abre con el scroll congelado.
                      unlockedRef.current = true;
                      lockedRef.current = false;
                      document.body.style.overflow = '';
                      navigate(zone.href);
                    }}
                    aria-label={zone.label}
                    className={cn(
                      'relative block overflow-hidden border transition-[flex-grow,border-color] duration-[520ms] ease-out-quart',
                      abierta ? 'border-exvia-red' : 'border-white/35'
                    )}
                    style={{ flexGrow: abierta ? 2.6 : 1, flexBasis: 0 }}
                  >
                    <img
                      src={zone.poster}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        'absolute inset-0 w-full h-full object-cover transition-[filter,opacity] duration-[520ms] ease-out-quart',
                        abierta ? 'opacity-0' : 'opacity-100 grayscale contrast-[1.15]'
                      )}
                    />
                    {abierta && (
                      <video
                        src={zone.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}

                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-0 transition-colors duration-[520ms]',
                        abierta ? 'bg-black/20' : 'bg-black/60'
                      )}
                    />

                    {/* Franja oscura solo bajo el rótulo de la lama abierta: el
                        rojo sobre metraje claro se perdía, y subir el velo de
                        toda la ventana apagaba la imagen, que es lo que se ha
                        venido a ver. [L0] */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent transition-opacity duration-500',
                        abierta ? 'opacity-100' : 'opacity-0'
                      )}
                    />

                    {/* Rótulo en vertical con la lama estrecha; se lee de abajo
                        arriba, como el PRODUCCIONES del logotipo. */}
                    <span
                      className={cn(
                        'absolute left-1/2 bottom-4 font-geist-mono uppercase text-[0.55rem] sm:text-[0.66rem] tracking-[0.22em] text-white whitespace-nowrap transition-opacity duration-300',
                        abierta ? 'opacity-0' : 'opacity-100'
                      )}
                      style={{ writingMode: 'vertical-rl', transform: 'translateX(-50%) rotate(180deg)' }}
                    >
                      {zone.label}
                    </span>

                    {/* Y en horizontal, en grande, cuando se abre */}
                    <span
                      className={cn(
                        'absolute left-4 lg:left-6 bottom-4 lg:bottom-6 right-4 font-display uppercase leading-[0.92] tracking-[-0.015em] text-exvia-red-text',
                        'text-[clamp(1.35rem,3.4vw,3rem)] transition-opacity duration-300 delay-100',
                        '[text-shadow:0_2px_16px_rgba(0,0,0,0.9)]',
                        abierta ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      {zone.label}
                    </span>
                  </a>
                );
              })}
            </div>
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
              'absolute left-1/2 top-[25%] md:top-[24%] -translate-x-1/2 -translate-y-1/2 z-30 transition-[opacity,transform] duration-700 ease-out',
              showZones ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            )}
          >
            <button
              type="button"
              onClick={() => setReelOpen(true)}
              aria-label={`${reelConfig.label}: vídeo de 90 segundos`}
              className="group flex flex-col items-center gap-3 focus:outline-none"
            >
              <span className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/70 bg-black/55 backdrop-blur-sm transition-[background-color,border-color,transform] duration-300 group-active:scale-[0.97] group-active:duration-160 group-hover:bg-black/80 group-hover:border-white group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black/50">
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
              'hidden absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 z-20 transition-[opacity,transform] duration-200 ease-out',
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
              'hidden absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 transition-[opacity,transform] duration-200 ease-out',
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
        {/* Titular. No está en la entrada: se materializa a mitad del recorrido,
            cuando la escena se oscurece, con una disipación (desenfoque que se
            va + leve ascenso) en lugar de un simple fundido. Queda a la altura
            de la cámara, algo por debajo del centro. */}
        {/* REPARTO VERTICAL DE LA PORTADA, medido y no supuesto. De arriba
            abajo: barra (hasta el 17 %), botón del reel (18-32 %), persianas
            (35-73 %) y titular (77-91 %). Si se toca cualquiera de los cuatro
            hay que rehacer la cuenta: es lo único que impide que se pisen. */}
        <div className="absolute inset-x-0 top-[84%] -translate-y-1/2 z-20 flex flex-col items-center px-6 lg:px-12 pointer-events-none">
          <div
            className={cn(
              'text-center transition-[opacity,transform,filter] ease-out',
              showTitular && revealReady
                ? 'opacity-100 blur-0 translate-y-0 duration-[1400ms]'
                : 'opacity-0 blur-[14px] translate-y-6 duration-700'
            )}
          >
            {heroConfig.headlineLines[0] && (
              <h1 className="font-roustel text-[clamp(1.75rem,5vw,4rem)] text-white tracking-normal leading-[1.15] pb-[0.12em] [text-shadow:0_2px_18px_rgba(0,0,0,0.85),0_1px_4px_rgba(0,0,0,0.9)]">
                {heroConfig.headlineLines[0]}
              </h1>
            )}
            {heroConfig.tagline && (
              <p className="mt-4 text-[0.6rem] sm:text-sm font-geist-mono uppercase tracking-[0.08em] sm:tracking-[0.2em] text-white/60 max-w-full break-words">
                {heroConfig.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Aviso de scroll. Ya NO va al centro: ahí es donde está pintado el
            XALVAJE de la persiana y el rótulo se le montaba encima. Baja al
            72 %, que es suelo de la nave y está limpio. */}
        <div
          className={cn(
            'absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-700 flex flex-col items-center gap-4',
            showScrollCue && revealReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Scrim propio: cae justo sobre la zona mas iluminada de la
              persiana y el cruce de la X. En blanco a pelo, aun con
              drop-shadow, se quedaba por debajo de 3:1. Al agrandar el texto
              el problema se ve mas, no menos. */}
          <span className="rounded-full bg-black/55 backdrop-blur-[2px] px-6 py-2.5 sm:px-8 sm:py-3
                           text-sm sm:text-xl lg:text-2xl font-geist-mono uppercase
                           tracking-[0.3em] sm:tracking-[0.35em] text-white">
            Scroll para explorar
          </span>
          {/* Flecha hacia ARRIBA: la persiana sube al avanzar la secuencia,
              asi que el gesto que se pide apunta en esa direccion. */}
          <span
            aria-hidden
            className="animate-bounce grid place-items-center w-11 h-11 sm:w-14 sm:h-14 rounded-full
                       bg-black/55 backdrop-blur-[2px] text-white text-3xl sm:text-4xl leading-none"
          >
            &uarr;
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
