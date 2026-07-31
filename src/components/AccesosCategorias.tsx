import { cn } from '@/lib/utils';
import { categoriasProyectos } from '@/config';

/**
 * Accesos directos a cada bloque de Proyectos. Se quedan pegados bajo la barra
 * al bajar, para poder saltar de una categoría a otra sin volver arriba.
 */
export function AccesosCategorias({ activa }: { activa?: string }) {
  const ir = (slug: string) => {
    const destino = document.getElementById(slug);
    if (!destino) return;
    // La barra es fija: sin este margen, el título de la categoría queda debajo.
    const y = destino.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-[4.5rem] z-30 bg-black/85 backdrop-blur-md border-y border-white/10">
      <div className="container-large px-6 lg:px-12">
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto py-3 no-scrollbar">
          {categoriasProyectos.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => ir(c.slug)}
              className={cn(
                'shrink-0 px-3 py-1.5 text-[0.65rem] sm:text-xs font-geist-mono uppercase tracking-[0.18em] transition-colors duration-300 border',
                activa === c.slug
                  ? 'text-white border-exvia-red bg-exvia-red/15'
                  : 'text-white/60 border-white/20 hover:text-white hover:border-white/50'
              )}
            >
              {c.titulo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
