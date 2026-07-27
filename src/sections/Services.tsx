import { useState, type ElementType } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useServiceParallax } from '@/hooks/useMouseParallax';
import { servicesConfig } from '@/config';
import {
  ArrowUpRight, ChevronDown, Circle,
  Camera, Aperture, Palette, TrendingUp,
  Film, Video, Clapperboard, Image, Layers, Megaphone, Sparkles, PenTool, Monitor, Compass,
} from 'lucide-react';

// Solo se empaquetan los iconos que usamos (evita importar toda la librería lucide-react).
const ICON_MAP: Record<string, ElementType> = {
  Camera, Aperture, Palette, TrendingUp,
  Film, Video, Clapperboard, Image, Layers, Megaphone, Sparkles, PenTool, Monitor, Compass,
};

function getIcon(iconName: string): ElementType {
  return ICON_MAP[iconName] || Circle;
}

// Marcas para el submenu de Marketing
const brands = [
  'Apivita',
  'Belif', 
  'Adidas',
  'Boss',
  'Camper'
];

interface ServiceCardProps {
  service: { 
    iconName: string; 
    title: string; 
    description: string; 
    image: string;
    link?: string;
    hasSubmenu?: boolean;
  };
  index: number;
  onNavigate?: (href: string) => void;
}

function ServiceCard({ service, index, onNavigate }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showBrands, setShowBrands] = useState(false);
  const { containerRef, getTransform } = useServiceParallax();
  const Icon = getIcon(service.iconName);

  const handleClick = () => {
    if (service.hasSubmenu) {
      setShowBrands(!showBrands);
    } else if (service.link && onNavigate) {
      onNavigate(service.link);
    }
  };

  const isClickable = service.link || service.hasSubmenu;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative border-t border-exvia-border transition-colors duration-300',
        isClickable && 'cursor-pointer hover:bg-exvia-subtle/30'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="p-8 lg:p-10"
        onClick={handleClick}
      >
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 flex items-center justify-center border border-exvia-border rounded-lg bg-white">
              <Icon className="w-5 h-5 text-exvia-black" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-h5 font-semibold text-exvia-black">{service.title}</h3>
              {isClickable && (
                <div className="flex items-center text-exvia-black/40">
                  {service.hasSubmenu ? (
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showBrands && 'rotate-180')} />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-exvia-black/60 leading-relaxed max-w-md">
              {service.description}
            </p>
          </div>

          {/* Index Number */}
          <div className="hidden lg:block text-xs font-geist-mono text-exvia-black/30">
            0{index + 1}
          </div>
        </div>
      </div>

      {/* Submenu de Marcas (solo para Marketing) */}
      {service.hasSubmenu && showBrands && (
        <div className="px-8 lg:px-10 pb-8 lg:pb-10 pt-2">
          <div className="pl-[72px] lg:pl-20">
            <p className="text-xs font-geist-mono uppercase tracking-wider text-exvia-black/40 mb-3">
              Marcas con las que hemos trabajado
            </p>
            <div className="flex flex-wrap gap-3">
              {brands.map((brand) => (
                <span 
                  key={brand}
                  className="px-4 py-2 bg-exvia-subtle rounded-full text-sm text-exvia-black/70 font-medium"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hover Image */}
      <div
        className={cn(
          'absolute right-8 top-1/2 -translate-y-1/2 w-48 h-32 lg:w-64 lg:h-40 overflow-hidden rounded-lg shadow-xl pointer-events-none z-10',
          'transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        style={getTransform(50, 6)}
      >
        <img loading="lazy" decoding="async"
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export function Services() {
  if (!servicesConfig.heading && servicesConfig.services.length === 0) return null;

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.3 });
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollAnimation({ threshold: 0.1 });

  const handleNavigate = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Configuración de servicios con links
  const servicesWithLinks = [
    {
      ...servicesConfig.services[0], // Producción Audiovisual
      link: '#portfolio'
    },
    {
      ...servicesConfig.services[1], // Fotografía
      link: '#photography'
    },
    {
      ...servicesConfig.services[2], // Dirección de Arte
      // Sin link
    },
    {
      ...servicesConfig.services[3], // Marketing
      hasSubmenu: true
    }
  ];

  return (
    <section id="services" className="w-full py-24 lg:py-32 bg-white">
      <div className="container-large px-6 lg:px-12">
        {/* Header - TÍTULOS MÁS GRANDES */}
        <div ref={headerRef} className="max-w-2xl mb-16">
          {servicesConfig.label && (
            <div
              className={cn(
                'transition-all duration-800 ease-out-quart',
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              <span className="text-sm lg:text-base font-geist-mono uppercase tracking-[0.25em] text-exvia-black/60">
                {servicesConfig.label}
              </span>
            </div>
          )}

          {servicesConfig.heading && (
            <h2
              className={cn(
                'text-3xl lg:text-4xl xl:text-5xl font-semibold text-exvia-black mt-4 transition-all duration-800 ease-out-quart',
                headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
              style={{ transitionDelay: '100ms' }}
            >
              {servicesConfig.heading}
            </h2>
          )}
        </div>

        {/* Services Grid */}
        {servicesWithLinks.length > 0 && (
          <div
            ref={servicesRef}
            className={cn(
              'border-b border-exvia-border transition-all duration-800 ease-out-quart',
              servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            {servicesWithLinks.map((service, index) => (
              <ServiceCard 
                key={service.title} 
                service={service} 
                index={index}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
