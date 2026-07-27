import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { heroConfig } from '@/config';

const boxSize = 450;
const halfBox = boxSize / 2;

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-play video when loaded
  useEffect(() => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked
      });
    }
  }, [videoLoaded]);

  // Revela el hero en cuanto el vídeo está listo, o tras un timeout de seguridad /
  // ante un error de carga: un vídeo lento o ausente nunca deja la pantalla en negro.
  useEffect(() => {
    if (videoLoaded) {
      setRevealReady(true);
      return;
    }
    const t = setTimeout(() => setRevealReady(true), 2500);
    return () => clearTimeout(t);
  }, [videoLoaded]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const section = e.currentTarget;
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use CSS custom properties for GPU-accelerated transforms
    section.style.setProperty('--mouse-x', `${x - halfBox}px`);
    section.style.setProperty('--mouse-y', `${y - halfBox}px`);
  }, []);

  if (!heroConfig.name && heroConfig.roles.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full min-h-screen overflow-hidden bg-neutral-900 cursor-none"
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': 'calc(42vw - 200px)', '--mouse-y': 'calc(28vh - 200px)' } as React.CSSProperties}
    >
      {/* Fondo de respaldo estático: se ve si el vídeo tarda o falla (nunca negro) */}
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
          'absolute inset-0 bg-black z-40 pointer-events-none transition-opacity duration-[2000ms] ease-out',
          revealReady ? 'opacity-0' : 'opacity-100'
        )}
      />

      {/* Background Video with MODERATE Blur (8px) */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-1000',
          isLoaded && videoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        )}
      >
        <video
          ref={videoRef}
          src="/videos/logo_xalvaje.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(8px) brightness(0.75)' }}
          poster={heroConfig.backgroundImage}
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setRevealReady(true)}
        />
        
        {/* Cinematic vignette overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)'
          }}
        />
      </div>

      {/* Sharp Image Container - uses CSS variables for position (EFFECTO REVEAL) */}
      <div
        className={cn(
          'absolute top-0 left-0 overflow-hidden pointer-events-none z-30',
          isLoaded && revealReady ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          width: boxSize,
          height: boxSize,
          transform: 'translate3d(var(--mouse-x), var(--mouse-y), 0)',
          willChange: 'transform',
        }}
      >
        {/* Sharp image fills the entire section, offset to align with background */}
        <div
          className="absolute inset-0"
          style={{
            transform: 'translate3d(calc(var(--mouse-x) * -1), calc(var(--mouse-y) * -1), 0)',
            width: '100vw',
            height: '100vh',
            willChange: 'transform',
          }}
        >
          <img
            src={heroConfig.backgroundImage}
            alt="Hero Sharp"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Square border frame */}
      <div
        className={cn(
          'absolute top-0 left-0 pointer-events-none z-30',
          isLoaded && revealReady ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          width: boxSize,
          height: boxSize,
          border: '1px solid rgba(255,255,255,0.5)',
          transform: 'translate3d(var(--mouse-x), var(--mouse-y), 0)',
          willChange: 'transform',
        }}
      >
        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-px bg-white/70" />
          <div className="absolute w-px h-4 bg-white/70" />
        </div>
      </div>

      {/* Role labels on sides */}
      {heroConfig.roles[0] && (
        <div
          className={cn(
            'absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-out',
            isLoaded && revealReady ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          )}
          style={{ transitionDelay: '1500ms' }}
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
            isLoaded && revealReady ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          )}
          style={{ transitionDelay: '1700ms' }}
        >
          <span className="text-xs font-geist-mono uppercase tracking-[0.3em] text-white/80">
            {heroConfig.roles[1]}
          </span>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-end min-h-screen px-6 lg:px-12 pointer-events-none">
        {/* Main Heading */}
        <div
          className={cn(
            'text-center transition-all duration-1000 ease-out pb-8 md:pb-12',
            isLoaded && revealReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          )}
          style={{ transitionDelay: '1200ms' }}
        >
          <h1 className="text-[clamp(3rem,12vw,12rem)] font-black text-white tracking-[-0.04em] leading-[0.85] drop-shadow-2xl">
            {heroConfig.name}
          </h1>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
        }}
      />
    </section>
  );
}
