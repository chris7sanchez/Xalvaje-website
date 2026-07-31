import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { AnimatedButton } from './AnimatedButton';
import { navigationConfig, paginasConfig } from '@/config';

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

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-[opacity,transform] duration-500 ease-out-circ',
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
              <Link
                to="/"
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
              </Link>
            )}

            {/* La barra queda con el logotipo y el desplegable, nada mas: los
                enlaces sueltos y el boton de Contacto se duplicaban con los tres
                accesos de la portada. Todos siguen dentro del desplegable. */}

            {/* Desplegable, ahora en todas las pantallas */}
            {navigationConfig.links.length > 0 && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative w-8 h-6 flex flex-col justify-between transition-transform duration-160 ease-out-quad active:scale-[0.97]"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMenuOpen}
              >
                <span
                  className={cn(
                    'w-full h-0.5 transition-[transform,opacity,background-color] duration-250 ease-out-quad origin-center',
                    isScrolled ? 'bg-exvia-black' : 'bg-white',
                    isMenuOpen && 'translate-y-[10px] rotate-[-45deg]'
                  )}
                />
                <span
                  className={cn(
                    'w-full h-0.5 transition-[transform,opacity,background-color] duration-250 ease-out-quad',
                    isScrolled ? 'bg-exvia-black' : 'bg-white',
                    // scale-x-90, no scale-0: nada en el mundo real se encoge
                    // hasta la nada antes de desaparecer.
                    isMenuOpen && 'scale-x-90 opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'w-full h-0.5 transition-[transform,opacity,background-color] duration-250 ease-out-quad origin-center',
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
            'fixed inset-0 z-40 bg-white transition-opacity duration-500 ease-out-cubic',
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          )}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {paginasConfig.map((link, index) => (
              <Link
                key={link.ruta}
                to={link.ruta}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'text-3xl font-semibold text-exvia-black transition-[opacity,transform] duration-500 ease-out-quart',
                  isMenuOpen
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: isMenuOpen ? `${index * 100}ms` : '0ms' }}
              >
                {link.etiquetaCorta}
              </Link>
            ))}
            {navigationConfig.contactLabel && (
              <AnimatedButton
                href={navigationConfig.contactHref || "#contact"}
                variant="primary"
                size="lg"
                className={cn(
                  'mt-4 transition-[opacity,transform] duration-500 ease-out-quart',
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
