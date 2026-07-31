import { useState, useEffect, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { AnimatedButton } from './AnimatedButton';
import { navigationConfig } from '@/config';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in navbar after page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!navigationConfig.logo && navigationConfig.links.length === 0) return null;

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out-circ',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
          // Sin fondo, el logo y los enlaces blancos caen sobre la zona más
          // iluminada del fotograma: medido 1,12:1, invisible. Este degradado
          // (negro 60 % arriba, a nada abajo) los deja en 6,06:1 sin que se vea
          // como una barra sólida.
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm'
            : 'bg-gradient-to-b from-black/60 via-black/25 to-transparent'
        )}
      >
        <div className="w-full px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo: la X del logotipo + "ALVAJE" como texto.
                La X es la primera letra de la marca; alt="X" hace que,
                si la imagen fallara, se siga leyendo "XALVAJE". */}
            {navigationConfig.logo && (
              <a
                href="#"
                className="flex items-center group"
                aria-label={`${navigationConfig.logo} — Inicio`}
              >
                {/* PRODUCCIONES en horizontal, no lateral: en vertical, 12
                    caracteres dentro de los 44 px del logo darían una letra de
                    3 px. En el pie sí va lateral, que hay altura de sobra. */}
                <Logo
                  size={44}
                  produccionesDebajo
                  claro={!isScrolled}
                  className="transition-transform duration-500 ease-out-quart group-hover:scale-105"
                />
              </a>
            )}

            {/* La barra queda con el logotipo y el desplegable, nada mas: los
                enlaces sueltos y el boton de Contacto se duplicaban con los tres
                accesos de la portada. Todos siguen dentro del desplegable. */}

            {/* Desplegable, ahora en todas las pantallas */}
            {navigationConfig.links.length > 0 && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative w-8 h-6 flex flex-col justify-between"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMenuOpen}
              >
                <span
                  className={cn(
                    'w-full h-0.5 transition-all duration-500 ease-out-quad origin-center',
                    isScrolled ? 'bg-exvia-black' : 'bg-white',
                    isMenuOpen && 'translate-y-[10px] rotate-[-45deg]'
                  )}
                />
                <span
                  className={cn(
                    'w-full h-0.5 transition-all duration-300 ease-out-quad',
                    isScrolled ? 'bg-exvia-black' : 'bg-white',
                    isMenuOpen && 'scale-0 opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'w-full h-0.5 transition-all duration-500 ease-out-quad origin-center',
                    isScrolled ? 'bg-exvia-black' : 'bg-white',
                    isMenuOpen && '-translate-y-[10px] rotate-[45deg]'
                  )}
                />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {navigationConfig.links.length > 0 && (
        <div
          className={cn(
            'fixed inset-0 z-40 bg-white transition-all duration-500 ease-out-cubic',
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          )}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navigationConfig.links.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'text-3xl font-semibold text-exvia-black transition-all duration-500 ease-out-quart',
                  isMenuOpen
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: isMenuOpen ? `${index * 100}ms` : '0ms' }}
              >
                {link.label}
              </a>
            ))}
            {navigationConfig.contactLabel && (
              <AnimatedButton
                href={navigationConfig.contactHref || "#contact"}
                variant="primary"
                size="lg"
                className={cn(
                  'mt-4 transition-all duration-500 ease-out-quart',
                  isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: isMenuOpen ? '400ms' : '0ms' }}
              >
                {navigationConfig.contactLabel}
              </AnimatedButton>
            )}
          </div>
        </div>
      )}
    </>
  );
}
