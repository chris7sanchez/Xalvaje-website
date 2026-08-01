import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks/useScrollAnimation';
import { useHoverCapaz } from '@/hooks/useHoverCapaz';
import { SelloPremiado } from '@/components/SelloPremiado';
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { portfolioConfig, categoriasProyectos } from '@/config';

interface Project {
  title: string;
  category: string;
  year: string;
  image: string;
  /** Ancho/alto real del cartel; ver ProjectItem.aspecto en config.ts */
  aspecto?: number;
  hoverImage?: string;
  featured?: boolean;
  youtubeUrl?: string;
  /** Vídeo servido desde la propia web (/videos/...). Alternativa a youtubeUrl
   *  para las piezas cortas: sin marco ajeno, sin rastreadores y a pantalla
   *  completa. Si están los dos, manda este. */
  videoSrc?: string;
  carouselImages?: string[];
  /** Sinopsis que se lee sobre el vídeo, en la ventana del proyecto */
  sinopsis?: string[];
}

function FeaturedPrisma({ project, isVisible }: { project: Project; isVisible: boolean }) {
  const images = project.carouselImages || [];
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-6 reveal',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      {/* Cartel con el nombre dentro, igual que el resto de proyectos */}
      {/* También con su formato: el cartel de PRISMA es apaisado (1600x894) y
          antes se estiraba al alto de la fila, que lo recortaba por los lados. */}
      <div
        className="relative overflow-hidden bg-neutral-900 ring-1 ring-white/10"
        style={{ aspectRatio: String(project.aspecto ?? 4 / 3) }}
      >
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          style={{ filter: 'contrast(0.88) brightness(1.04)' }}
        />

        {/* Degradado para legibilidad del texto superpuesto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

        {/* Categoría en rojo, arriba a la izquierda */}
        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[0.55rem] sm:text-[0.6rem] font-geist-mono uppercase tracking-[0.2em] sm:tracking-[0.25em] text-exvia-red-text">
          {project.category}
        </span>

        {/* Título grande superpuesto: algo mayor que las tarjetas, es el destacado */}
        <h3 className="absolute left-4 right-4 bottom-12 text-3xl lg:text-5xl font-display text-white uppercase tracking-[-0.02em] leading-[0.95] drop-shadow-lg">
          {project.title}
        </h3>

        {/* Año, abajo a la izquierda */}
        <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-[0.65rem] sm:text-xs font-geist-mono text-white/80 border-b border-white/40 pb-0.5">
          {project.year}
        </span>
      </div>

      {/* Carrusel de fotos, con flechas */}
      <div className="relative overflow-hidden bg-neutral-900 aspect-[4/3] md:aspect-auto group">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${project.title} - foto ${i + 1}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          />
        ))}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Ir a foto ${i + 1}`}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-[background-color,transform] duration-300',
                    i === current ? 'bg-white w-4' : 'bg-white/40'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

function ProjectCard({ project, index, isVisible }: { project: Project; index: number; isVisible: boolean }) {
  const [showVideo, setShowVideo] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverCapaz = useHoverCapaz();

  const tieneVideo = Boolean(project.videoSrc || project.youtubeUrl);

  const handleClick = () => {
    if (tieneVideo) {
      setShowVideo(true);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };

  // Si no hay hoverImage, usamos la misma imagen
  const hoverImage = project.hoverImage || project.image;
  const hasHoverEffect = project.hoverImage && project.hoverImage !== project.image;

  return (
    <>
      <div
        className={cn(
          'group cursor-pointer reveal',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
        style={{ transitionDelay: `${index * 100}ms` }}
        onClick={handleClick}
        onMouseEnter={() => hoverCapaz && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* La ficha toma la FORMA DEL CARTEL, no al revés. Antes iban todas
            clavadas a 3/4 y los carteles de 2:3 perdían un 11 % por arriba y
            por abajo. Cada uno con su formato es lo que hace que la rejilla
            parezca una cartelera y no una plantilla. El filo claro y la sombra
            los despegan del fondo, como piezas montadas en una vitrina. */}
        <div
          className="relative overflow-hidden bg-neutral-900 ring-1 ring-white/10 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]"
          style={{ aspectRatio: String(project.aspecto ?? 3 / 4) }}
        >
          {/* Imagen base (cartel) a sangre completa */}
          <img loading="lazy" decoding="async"
            src={project.image}
            alt={project.title}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out-cubic',
              hasHoverEffect && isHovered ? 'opacity-0' : 'opacity-100',
              isHovered && !hasHoverEffect && 'scale-105'
            )}
          />
          {/* Imagen hover (si existe) */}
          {hasHoverEffect && (
            <img loading="lazy" decoding="async"
              src={hoverImage}
              alt={`${project.title} - hover`}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out-cubic',
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              )}
            />
          )}

          {/* Degradado para legibilidad del texto superpuesto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 transition-opacity duration-500" />

          {/* Categoría en rojo, arriba a la izquierda. Va con el rojo aclarado:
              a 9,6 px sobre imagen, el de marca se queda en 3,9:1 (AA pide 4,5).
              En los premiados se calla: lo dice el sello, y repetirlo al lado
              era decir dos veces lo mismo en el mismo rincón. */}
          {!project.category.includes('premiado') && (
            <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[0.55rem] sm:text-[0.6rem] font-geist-mono uppercase tracking-[0.2em] sm:tracking-[0.25em] text-exvia-red-text">
              {project.category}
            </span>
          )}

          {/* Sello, arriba a la IZQUIERDA y ladeado, como estampado a mano.
              Sale de la propia categoría: no hace falta un campo en el config. */}
          {project.category.includes('premiado') && (
            <SelloPremiado
              className="absolute top-2 left-2 sm:top-3 sm:left-3 w-12 sm:w-14 lg:w-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]"
              style={{ transform: 'rotate(-30deg)' }}
            />
          )}

          {/* Título grande superpuesto */}
          <h3 className="absolute left-3 right-3 sm:left-4 sm:right-4 bottom-10 sm:bottom-14 text-base sm:text-2xl lg:text-3xl font-display text-white uppercase tracking-[-0.02em] leading-[0.95] drop-shadow-lg">
            {project.title}
          </h3>

          {/* Año, abajo a la izquierda */}
          <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-[0.65rem] sm:text-xs font-geist-mono text-white/80 border-b border-white/40 pb-0.5">
            {project.year}
          </span>

          {/* Ver proyecto, abajo a la derecha */}
          <span className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 inline-flex items-center gap-1 sm:gap-1.5 text-[0.55rem] sm:text-[0.65rem] font-geist-mono uppercase tracking-[0.12em] sm:tracking-[0.15em] text-white/80 group-hover:text-white transition-colors">
            {tieneVideo ? (
              <>
                Ver proyecto
                <Play className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="currentColor" />
              </>
            ) : (
              <>
                Próximamente
                <ArrowUpRight className="w-3 h-3" />
              </>
            )}
          </span>
        </div>
      </div>

      {/* Ventana del proyecto: ficha con la sinopsis arriba y el vídeo debajo,
          en vez de saltar directo a YouTube. */}
      {showVideo && tieneVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          onClick={() => setShowVideo(false)}
        >
          <button
            type="button"
            onClick={() => { setShowVideo(false); setReproduciendo(false); }}
            aria-label="Cerrar"
            className="fixed top-5 right-5 z-10 w-11 h-11 rounded-full bg-black/70 backdrop-blur-sm border border-white/25 hover:bg-black/90 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div
            className="min-h-full flex items-center justify-center p-4 py-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-4xl">
              <div className="mb-6">
                <span className="text-[0.65rem] font-geist-mono uppercase tracking-[0.25em] text-exvia-red-text">
                  {project.category} &middot; {project.year}
                </span>
                <h3 className="mt-2 font-display uppercase text-white leading-[0.95] tracking-[-0.01em] text-[clamp(1.75rem,4vw,3.75rem)]">
                  {project.title}
                </h3>

                {project.sinopsis && project.sinopsis.length > 0 && (
                  <div className="mt-5 space-y-3 max-w-2xl">
                    {project.sinopsis.map((parrafo) => (
                      <p key={parrafo.slice(0, 24)} className="text-sm lg:text-[0.9375rem] leading-relaxed text-white/75">
                        {parrafo}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* El vídeo no arranca solo: se carga al pulsar play, así da tiempo
                  a leer la sinopsis y no se descarga si no se va a ver. */}
              <div className="relative w-full aspect-video bg-neutral-950 overflow-hidden">
                {reproduciendo ? (
                  project.videoSrc ? (
                    // object-contain y no cover: hay piezas cuadradas (1:1) y
                    // recortarlas para llenar el 16:9 se comeria el producto.
                    <video
                      src={project.videoSrc}
                      title={project.title}
                      className="absolute inset-0 w-full h-full object-contain bg-black"
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <iframe
                      src={getYoutubeEmbedUrl(project.youtubeUrl!)}
                      title={project.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => setReproduciendo(true)}
                    aria-label={`Reproducir ${project.title}`}
                    className="group absolute inset-0 w-full h-full"
                  >
                    <img
                      src={project.image}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-50"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/70 bg-black/55 backdrop-blur-sm transition-[background-color,transform] duration-300 group-active:scale-[0.97] group-active:duration-160 group-hover:bg-black/80 group-hover:scale-105">
                        <span
                          aria-hidden
                          className="ml-1 block w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-white"
                        />
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Portfolio() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.3 });
  const { containerRef: gridRef, visibleItems } = useStaggerAnimation(portfolioConfig.projects.length + 1, 120);

  if (!portfolioConfig.heading && portfolioConfig.projects.length === 0) return null;

  return (
    <section id="portfolio" className="w-full py-14 lg:py-32 bg-neutral-900">
      {/* El observador va en el contenedor que envuelve TODO, no en el grid de
          abajo: visibleItems gobierna también PRISMA (que está encima del grid)
          y el banner. Con el ref en el grid, al entrar por el enlace del menú
          PRISMA se quedaba invisible hasta que hacías scroll y el grid asomaba. */}
      <div ref={gridRef} className="container-large px-6 lg:px-12">
        {/* Header */}
        <div ref={headerRef} className="max-w-3xl mb-4 lg:mb-10">
          {portfolioConfig.label && (
            <div
              className={cn(
                'reveal',
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              <span className="block text-[0.7rem] font-geist-mono uppercase tracking-[0.3em] text-white/85">
                {portfolioConfig.label}
              </span>
            </div>
          )}

          {portfolioConfig.heading && (
            <h2
              className={cn(
                'font-display text-[clamp(2rem,4.2vw,4.5rem)] leading-[0.95] uppercase tracking-[-0.01em] text-white mt-2 reveal',
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: '100ms' }}
            >
              {(() => {
                // Como en el diseño: la primera palabra en blanco y el resto en
                // rojo, en la misma línea.
                const [primera, ...resto] = portfolioConfig.heading.split(' ');
                return (
                  <>
                    {primera}
                    {resto.length > 0 && (
                      <span className="text-exvia-red-text"> {resto.join(' ')}</span>
                    )}
                  </>
                );
              })()}
            </h2>
          )}

          {portfolioConfig.description && (
            <p
              className={cn(
                'mt-4 text-base lg:text-lg text-white/60 leading-relaxed reveal',
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: '200ms' }}
            >
              {portfolioConfig.description}
            </p>
          )}
        </div>

        {/* Por categorías: Largometrajes, Cortometrajes y Campañas. Fotografía
            no sale aquí: es su propia sección, justo debajo en esta página. */}
        {categoriasProyectos
          .filter((c) => c.coincideCon.length > 0)
          .map((cat) => {
            const deLaCategoria = portfolioConfig.projects
              .map((p, i) => ({ p, i }))
              .filter(({ p }) => cat.coincideCon.includes(p.category));

            if (deLaCategoria.length === 0) return null;
            const destacado = cat.slug === 'largometrajes';

            return (
              <div key={cat.slug} id={cat.slug} className="scroll-mt-32 mb-14 lg:mb-20">
                <div className="flex items-baseline gap-4 mb-5">
                  <h3 className="font-display uppercase text-white leading-none tracking-[0.02em] text-[clamp(1.25rem,2.4vw,2.5rem)]">
                    {cat.titulo}
                  </h3>
                  <span aria-hidden className="flex-1 h-px bg-white/15" />
                </div>

                {destacado ? (
                  deLaCategoria.map(({ p, i }) => (
                    <FeaturedPrisma key={p.title} project={p} isVisible={visibleItems[i]} />
                  ))
                ) : (
                  /* items-end: como cada cartel tiene su alto, se apoyan todos
                     en la misma línea de abajo, igual que en una vitrina. Y así
                     los títulos, que van dentro del cartel abajo, quedan
                     alineados entre sí en vez de bailar. */
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-end">
                    {deLaCategoria.map(({ p, i }) => (
                      <ProjectCard key={p.title} project={p} index={i} isVisible={visibleItems[i]} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {/* View All Button */}
        {portfolioConfig.viewAllLabel && (
          <div
            className={cn(
              'mt-16 text-center reveal',
              visibleItems[portfolioConfig.projects.length] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            )}
            style={{ transitionDelay: '600ms' }}
          >
            <button className="group inline-flex items-center gap-2 text-sm font-geist-mono text-white hover:text-white/70 transition-colors">
              <span>{portfolioConfig.viewAllLabel}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
