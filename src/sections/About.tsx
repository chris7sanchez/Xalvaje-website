import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Play, Pause, Maximize2, X } from 'lucide-react';

export function About() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (fullscreenVideoRef.current && videoRef.current) {
      fullscreenVideoRef.current.currentTime = videoRef.current.currentTime;
      if (isPlaying) {
        fullscreenVideoRef.current.play();
      } else {
        fullscreenVideoRef.current.pause();
      }
    }
  }, [isFullscreen, isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  return (
    <section id="about" className="w-full py-16 lg:py-20 bg-white">
      <div className="container-large px-6 lg:px-12">
        {/* Section Label */}
        <div
          className={cn(
            'mb-8 transition-all duration-800 ease-out-quart',
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <span className="text-sm lg:text-base font-geist-mono uppercase tracking-[0.25em] text-exvia-black/60">
            Sobre Nosotros
          </span>
        </div>

        <div ref={sectionRef} className="space-y-12">
          
          {/* VIDEO REEL + DESCRIPCIÓN */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Video */}
            <div
              className={cn(
                'transition-all duration-800 ease-out-quart',
                sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="relative group">
                <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden shadow-xl">
                  <video
                    ref={videoRef}
                    src="/videos/chriss_reel.mp4"
                    className="w-full h-full object-cover"
                    onLoadedData={() => setVideoLoaded(true)}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                  />
                  
                  {!isPlaying && videoLoaded && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white hover:scale-110 transition-all"
                           onClick={togglePlay}>
                        <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                      </div>
                    </div>
                  )}

                  {!videoLoaded && (
                    <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                      <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" fill="currentColor" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                      )}
                    </button>
                    <button onClick={openFullscreen} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-exvia-black/40 text-center uppercase tracking-widest">Reel de producción — XALVAJE</p>
            </div>

            {/* Descripción */}
            <div
              className={cn(
                'transition-all duration-800 ease-out-quart',
                sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: '200ms' }}
            >
              <p className="text-lg lg:text-xl text-exvia-black/50 leading-relaxed italic mb-4">
                "Juntos creamos mundos donde la luz encuentra su camino"
              </p>
              <p className="text-base text-exvia-black/60 leading-relaxed">
                XALVAJE nació en 2020 de la unión de dos visiones creativas con una misma pasión: contar historias que trasciendan la pantalla y lleguen directamente al corazón del espectador.
              </p>
              <p className="text-base text-exvia-black/60 leading-relaxed mt-3">
                Nuestro nombre representa la dualidad de la luz y la sombra, ese equilibrio perfecto entre lo salvaje y lo refinado que buscamos en cada proyecto.
              </p>
            </div>
          </div>

          {/* DIRECTORES - Dos columnas */}
          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-exvia-border">
            {/* Christian Sánchez */}
            <div
              className={cn(
                'flex gap-6 transition-all duration-800 ease-out-quart',
                sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                <img loading="lazy" decoding="async" 
                  src="/images/christian-director.webp" 
                  alt="Christian Sánchez - Director" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-exvia-black mb-1">Christian Sánchez</h3>
                <p className="text-sm text-exvia-black/50 uppercase tracking-wider mb-3">Director</p>
                <p className="text-sm text-exvia-black/60 leading-relaxed">
                  Director y guionista con formación en cinematografía. Especializado en narrativa visual emotiva y dirección de actores. Su visión artística ha definido el estilo de XALVAJE desde sus inicios.
                </p>
              </div>
            </div>

            {/* Ángel Lara */}
            <div
              className={cn(
                'flex gap-6 transition-all duration-800 ease-out-quart',
                sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                <img loading="lazy" decoding="async" 
                  src="/images/angel-lara.webp" 
                  alt="Ángel Lara - Productor" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-exvia-black mb-1">Ángel Lara</h3>
                <p className="text-sm text-exvia-black/50 uppercase tracking-wider mb-3">Productor</p>
                <p className="text-sm text-exvia-black/60 leading-relaxed">
                  Productor y director de fotografía con experiencia en producción audiovisual comercial y artística. Su ojo técnico y artístico complementa la visión creativa de cada proyecto.
                </p>
              </div>
            </div>
          </div>

          {/* EN EQUIPO */}
          <div
            className={cn(
              'pt-8 border-t border-exvia-border transition-all duration-800 ease-out-quart',
              sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            )}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-exvia-black mb-4">En Equipo</h3>
                <p className="text-base text-exvia-black/60 leading-relaxed mb-4">
                  Somos cazadores de emociones, arquitectos de sueños visuales. Desde cortometrajes premiados hasta nuestro primer largometraje "PRISMA", cada proyecto es una oportunidad de explorar nuevas formas de narrativa visual.
                </p>
                <p className="text-base text-exvia-black/60 leading-relaxed">
                  Nuestra filosofía se basa en la colaboración, la experimentación y el compromiso con la excelencia artística. Cada historia merece ser contada de la mejor manera posible.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img loading="lazy" decoding="async" 
                  src="/images/en-equipo.webp" 
                  alt="El equipo de XALVAJE" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeFullscreen}>
          <button onClick={closeFullscreen} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <video
              ref={fullscreenVideoRef}
              src="/videos/chriss_reel.mp4"
              className="max-w-full max-h-full"
              controls
              autoPlay={isPlaying}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
