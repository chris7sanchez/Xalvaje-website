import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks/useScrollAnimation';
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { portfolioConfig } from '@/config';

interface Project {
  title: string;
  category: string;
  year: string;
  image: string;
  hoverImage?: string;
  featured?: boolean;
  youtubeUrl?: string;
  carouselImages?: string[];
}

function FeaturedPrisma({ project, isVisible }: { project: Project; isVisible: boolean }) {
  const images = project.carouselImages || [];
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 ease-out-quart',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      {/* Cartel fijo, sin nombre superpuesto, contraste reducido */}
      <div className="relative overflow-hidden bg-neutral-900 aspect-[4/3] md:aspect-auto">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          style={{ filter: 'contrast(0.88) brightness(1.04)' }}
        />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 text-xs font-geist-mono bg-white/90 backdrop-blur-sm rounded-full text-exvia-black">
            {project.year}
          </span>
        </div>
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
                    'w-1.5 h-1.5 rounded-full transition-all',
                    i === current ? 'bg-white w-4' : 'bg-white/40'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Título e info debajo del cartel (el nombre no va superpuesto en PRISMA) */}
      <div className="md:col-span-2">
        <span className="text-[0.6rem] font-geist-mono uppercase tracking-[0.25em] text-exvia-red">
          {project.category}
        </span>
        <h3 className="mt-1 text-3xl lg:text-4xl font-black text-white uppercase tracking-[-0.02em] leading-none">
          {project.title}
        </h3>
      </div>
    </div>
  );
}

function ProjectCard({ project, index, isVisible }: { project: Project; index: number; isVisible: boolean }) {
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (project.youtubeUrl) {
      setShowVideo(true);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  // Si no hay hoverImage, usamos la misma imagen
  const hoverImage = project.hoverImage || project.image;
  const hasHoverEffect = project.hoverImage && project.hoverImage !== project.image;

  return (
    <>
      <div
        className={cn(
          'group cursor-pointer transition-all duration-700 ease-out-quart flex-1 min-w-[270px] max-w-[560px]',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
        style={{ transitionDelay: `${index * 100}ms` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden bg-neutral-900 aspect-[3/4]">
          {/* Imagen base (cartel) a sangre completa */}
          <img loading="lazy" decoding="async"
            src={project.image}
            alt={project.title}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out-cubic',
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
                'absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out-cubic',
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              )}
            />
          )}

          {/* Degradado para legibilidad del texto superpuesto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 transition-opacity duration-500" />

          {/* Categoría en rojo, arriba a la izquierda */}
          <span className="absolute top-4 left-4 text-[0.6rem] font-geist-mono uppercase tracking-[0.25em] text-exvia-red">
            {project.category}
          </span>

          {/* Título grande superpuesto */}
          <h3 className="absolute left-4 right-4 bottom-14 text-2xl lg:text-3xl font-black text-white uppercase tracking-[-0.02em] leading-[0.95] drop-shadow-lg">
            {project.title}
          </h3>

          {/* Año, abajo a la izquierda */}
          <span className="absolute bottom-4 left-4 text-xs font-geist-mono text-white/80 border-b border-white/40 pb-0.5">
            {project.year}
          </span>

          {/* Ver proyecto, abajo a la derecha */}
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 text-[0.65rem] font-geist-mono uppercase tracking-[0.15em] text-white/80 group-hover:text-white transition-colors">
            {project.youtubeUrl ? (
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

      {/* YouTube Video Modal */}
      {showVideo && project.youtubeUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Video Container */}
          <div 
            className="w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={getYoutubeEmbedUrl(project.youtubeUrl)}
              title={project.title}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
    <section id="portfolio" className="w-full py-24 lg:py-32 bg-neutral-900">
      <div className="container-large px-6 lg:px-12">
        {/* Header */}
        <div ref={headerRef} className="max-w-3xl mb-16">
          {portfolioConfig.label && (
            <div
              className={cn(
                'transition-all duration-800 ease-out-quart',
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              <span className="inline-flex items-center gap-3 text-xs font-geist-mono uppercase tracking-widest text-exvia-red">
                {portfolioConfig.label}
                <span className="inline-block w-10 h-px bg-exvia-red" />
              </span>
            </div>
          )}

          {portfolioConfig.heading && (
            <h2
              className={cn(
                'text-h2 font-black uppercase tracking-[-0.02em] text-white mt-4 transition-all duration-800 ease-out-quart',
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: '100ms' }}
            >
              {portfolioConfig.heading}
            </h2>
          )}

          {portfolioConfig.description && (
            <p
              className={cn(
                'mt-6 text-lg text-white/60 leading-relaxed transition-all duration-800 ease-out-quart',
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: '200ms' }}
            >
              {portfolioConfig.description}
            </p>
          )}
        </div>

        {/* PRISMA: cartel + carrusel, fuera del grid */}
        {portfolioConfig.projects[0] && (
          <div className="mb-6">
            <FeaturedPrisma project={portfolioConfig.projects[0]} isVisible={visibleItems[0]} />
          </div>
        )}

        {/* Resto de proyectos - grid compacto */}
        <div ref={gridRef} className="flex flex-wrap gap-6">
          {portfolioConfig.projects.slice(1).map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i + 1} isVisible={visibleItems[i + 1]} />
          ))}

          {/* Decorative CTA Card */}
          {portfolioConfig.cta.heading && (
            <div
              className={cn(
                'relative overflow-hidden bg-white/[0.04] border border-white/10 rounded-lg p-5 flex flex-col justify-between transition-all duration-700 ease-out-quart aspect-[3/4] flex-1 min-w-[270px] max-w-[560px]',
                visibleItems[portfolioConfig.projects.length] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{ transitionDelay: '400ms' }}
            >
              <div>
                {portfolioConfig.cta.label && (
                  <span className="text-[0.65rem] font-geist-mono uppercase tracking-widest text-white/50">
                    {portfolioConfig.cta.label}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white mt-2 leading-tight">
                  {portfolioConfig.cta.heading}
                </h3>
              </div>
              {portfolioConfig.cta.linkText && (
                <a href={portfolioConfig.cta.linkHref || '#contact'} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer group">
                  <span className="text-xs font-medium">{portfolioConfig.cta.linkText}</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
              {/* Decorative circle */}
              <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
            </div>
          )}
        </div>

        {/* View All Button */}
        {portfolioConfig.viewAllLabel && (
          <div
            className={cn(
              'mt-16 text-center transition-all duration-800 ease-out-quart',
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
