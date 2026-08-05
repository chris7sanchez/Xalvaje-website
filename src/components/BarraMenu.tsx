import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { paginasConfig } from '@/config';

/**
 * BARRA SUPERIOR Y MENÚ, únicos para toda la web.
 *
 * Antes había dos: la transparente de la portada (que sobre el fotograma
 * iluminado no se veía) y la blanca de las páginas interiores. Ahora es una
 * sola, más alta —el alto vive en `--alto-barra`, en index.css— y con fondo
 * translúcido oscuro, así que se lee tanto sobre el hero como sobre el negro
 * de dentro.
 *
 * El menú es un PANEL que entra desde la derecha y ocupa poco menos de media
 * pantalla. Cada sección es una fila a todo lo ancho del panel, y al pasar el
 * ratón la fila entera se llena de hueso de izquierda a derecha y el texto se
 * vuelve negro: la fila se invierte, como un negativo.
 *
 * (Las páginas interiores ya no llevan los cuatro enlaces a la vista. Viven
 * todos dentro del panel, que es lo que pidió el diseño nuevo.)
 */

const HUESO = '#FBF7F5';

/**
 * Lo que se lista en el panel: la PORTADA primero y luego las cuatro secciones.
 *
 * La portada va aquí porque al unificar las dos barras desapareció el "volver"
 * que llevaba la blanca, y el panel solo enseñaba las secciones: una vez dentro
 * se podía saltar de una a otra pero no salir. Al inicio se llegaba únicamente
 * pulsando el logotipo, y nadie tiene por qué adivinar eso.
 */
const ENTRADAS = [{ ruta: '/', etiquetaCorta: 'Portada' }, ...paginasConfig];

/** La portada es la 00: volver al principio, no una sección más. Así las
 *  cuatro secciones conservan su 01-04 de siempre. */

export function BarraMenu() {
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  // Al cambiar de página, el panel se cierra solo.
  useEffect(() => { setAbierto(false); }, [pathname]);

  useEffect(() => {
    if (!abierto) return;

    // Se bloquea el scroll con estilo en línea y se quita luego con
    // removeProperty, NO poniéndolo a '': el body tiene su propio overflow en
    // la hoja de estilos y hay que devolverle el mando.
    document.body.style.overflow = 'hidden';

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setAbierto(false); boton.current?.focus(); }
    };
    document.addEventListener('keydown', alPulsar);
    panel.current?.focus();

    return () => {
      document.body.style.removeProperty('overflow');
      document.removeEventListener('keydown', alPulsar);
    };
  }, [abierto]);

  return (
    <>
      <header
        /* z-60, por encima del panel: en móvil el panel ocupa el ancho entero
           y, al ir después en el documento, tapaba el botón de cerrar. Con Esc
           se salía, pero en un móvil no hay Esc. */
        className="fixed top-0 inset-x-0 z-[60] flex items-center"
        style={{ height: 'var(--alto-barra)' }}
      >
        {/* La banda va aparte del contenido para poder difuminarla sin tocar
            la opacidad del logotipo ni la del botón. */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 border-b transition-colors duration-500',
            abierto
              ? 'bg-black border-white/10'
              : 'bg-black/65 backdrop-blur-md border-white/10'
          )}
        />

        <div className="relative w-full px-6 lg:px-12 flex items-center justify-between gap-4">
          <Link to="/" className="group shrink-0" aria-label="XALVAJE Producciones — Inicio">
            {/* Punto medio: 34/44 era ilegible y 56/88 se comía la barra.
                El alto de la barra va con él (--alto-barra). */}
            <Logo
              size={44}
              soloMarca
              className="sm:hidden transition-transform duration-500 ease-out-quart group-hover:scale-105"
            />
            <Logo
              size={64}
              produccionesDebajo
              className="hidden sm:inline-flex transition-transform duration-500 ease-out-quart group-hover:scale-105"
            />
          </Link>

          <button
            ref={boton}
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="panel-menu"
            className="group flex items-center gap-3 sm:gap-4 py-2 pl-3 transition-transform duration-160 ease-out-quad active:scale-[0.97]"
          >
            <span className="font-geist-mono uppercase text-[0.85rem] sm:text-[1rem] tracking-[0.28em] text-white/85 group-hover:text-white transition-colors">
              {abierto ? 'Cerrar' : 'Menú'}
            </span>

            {/* Tres rayas: la de en medio se va al abrir y las otras dos se
                cruzan. Se marcha desplazandose, no encogiendose a cero: nada
                en el mundo real desaparece reduciendose a nada. */}
            <span aria-hidden className="relative block w-9 sm:w-11 h-4">
              <span
                className={cn(
                  'absolute left-0 w-full h-[1.5px] bg-white transition-transform duration-300 ease-out-quart',
                  abierto ? 'top-1/2 rotate-45' : 'top-0'
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-1/2 w-full h-[1.5px] bg-white transition-[transform,opacity] duration-300 ease-out-quart',
                  abierto ? 'translate-x-3 opacity-0' : 'translate-x-0 opacity-100'
                )}
              />
              <span
                className={cn(
                  'absolute left-0 w-full h-[1.5px] bg-white transition-transform duration-300 ease-out-quart',
                  abierto ? 'top-1/2 -rotate-45' : 'top-full'
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Fondo: cierra al pulsar y oscurece lo que queda a la vista */}
      <div
        aria-hidden
        onClick={() => setAbierto(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] transition-opacity duration-500 ease-out-quart',
          abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* EL PANEL */}
      <aside
        id="panel-menu"
        ref={panel}
        tabIndex={-1}
        aria-label="Secciones"
        aria-hidden={!abierto}
        className={cn(
          'fixed top-0 right-0 z-50 h-full outline-none',
          'w-full sm:w-[46vw] sm:min-w-[26rem] sm:max-w-[34rem]',
          'bg-black border-l border-white/10',
          'transition-transform duration-[520ms] ease-out-quart',
          abierto ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div
          className="flex flex-col h-full"
          style={{ paddingTop: 'var(--alto-barra)' }}
        >
          <span className="px-8 lg:px-10 pt-8 pb-6 font-geist-mono uppercase text-[0.58rem] tracking-[0.34em] text-white/35">
            Secciones
          </span>

          <nav className="border-t border-white/10">
            {ENTRADAS.map((p, i) => {
              const activa = pathname === p.ruta;
              return (
                <Link
                  key={p.ruta}
                  to={p.ruta}
                  aria-current={activa ? 'page' : undefined}
                  tabIndex={abierto ? 0 : -1}
                  className="group relative flex items-center gap-5 px-8 lg:px-10 py-5 lg:py-6 border-b border-white/10 overflow-hidden"
                >
                  {/* El barrido: la fila entera se llena de izquierda a derecha */}
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-left scale-x-0 transition-transform duration-[420ms] ease-out-quart group-hover:scale-x-100"
                    style={{ backgroundColor: HUESO }}
                  />

                  {/* El número: apagado en reposo, NEGRO cuando la fila se
                      selecciona. Sobre el hueso da 19:1. En la página en la que
                      estás va en rojo, que es la única marca que queda de cuál
                      es: el rótulo ya no cambia de color en reposo. */}
                  <span
                    className={cn(
                      'relative font-geist-mono text-[0.58rem] tracking-[0.28em] transition-colors duration-300 group-hover:text-black',
                      activa ? 'text-exvia-red-text' : 'text-white/45'
                    )}
                  >
                    {i === 0 ? '00' : String(i).padStart(2, '0')}
                  </span>

                  {/* En reposo, blanco sobre negro y punto: sin invertir nada.
                      Al seleccionar, la fila se llena de hueso y el rótulo pasa
                      a ROJO. Rojo sobre hueso da 5,15:1, por encima del mínimo
                      incluso para texto normal, y esto es texto grande.

                      El color va en CLASE y no en `style`: puesto en línea
                      ganaba siempre al group-hover, el texto se quedaba hueso
                      sobre el hueso del barrido y la fila se leía en blanco
                      sobre blanco al pasar el ratón. [L0] */}
                  <span className="relative font-display uppercase leading-none tracking-[-0.01em] text-[clamp(1.5rem,3.2vw,2.6rem)] text-[#FBF7F5] transition-colors duration-300 group-hover:text-exvia-red">
                    {p.etiquetaCorta}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-8 lg:px-10 py-8 border-t border-white/10">
            <Link
              to="/contacto"
              tabIndex={abierto ? 0 : -1}
              className="inline-flex items-center gap-2 font-geist-mono uppercase text-[0.62rem] tracking-[0.28em] text-white/60 hover:text-white transition-colors"
            >
              Contacto
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
