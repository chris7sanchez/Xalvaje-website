import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { paginasConfig } from '@/config';

/**
 * Barra de las páginas interiores: blanca y fija, con las tres secciones para
 * saltar entre ellas y un "volver" a la portada. La portada usa su propia barra
 * (transparente sobre el fotograma), por eso esta es un componente aparte.
 */
export function PageNav() {
  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/5">
      <div className="container-large px-6 lg:px-12 py-3 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center group shrink-0"
          aria-label="XALVAJE Producciones — Volver a la portada"
        >
          {/* En móvil solo la X: con cuatro secciones el logotipo entero dejaba
              la última fuera de pantalla. */}
          <Logo size={30} soloMarca claro={false} className="sm:hidden" />
          <Logo size={38} produccionesDebajo claro={false} className="hidden sm:inline-flex" />
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6 lg:gap-8" aria-label="Secciones">
          {paginasConfig.map((p) => {
            const activa = pathname === p.ruta;
            return (
              <Link
                key={p.ruta}
                to={p.ruta}
                aria-current={activa ? 'page' : undefined}
                className={cn(
                  'relative text-[0.65rem] sm:text-xs font-geist-mono uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-colors duration-300 py-1',
                  activa ? 'text-exvia-black' : 'text-exvia-black/55 hover:text-exvia-black'
                )}
              >
                {p.etiquetaCorta}
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-0 -bottom-0.5 h-px bg-exvia-red transition-[width,opacity] duration-300',
                    activa ? 'w-full' : 'w-0'
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <Link
          to="/"
          className="group hidden sm:inline-flex items-center gap-2 shrink-0 text-[0.65rem] font-geist-mono uppercase tracking-[0.2em] text-exvia-black/60 hover:text-exvia-black transition-colors"
        >
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
            &larr;
          </span>
          Volver
        </Link>
      </div>
    </header>
  );
}
