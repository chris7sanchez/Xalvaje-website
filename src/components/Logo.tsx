import { cn } from '@/lib/utils';

/**
 * Logotipo XALVAJE, con las proporciones medidas sobre el logo original:
 *
 *   · la X mide 3 veces la altura de las mayúsculas de "ALVAJE"
 *   · la A se SOLAPA ligeramente con la X, no se separa de ella
 *   · "PRODUCCIONES" va en vertical a la derecha y ocupa el 74 % del alto de la X
 *
 * Todo se deriva de `size` (la altura de la X en px) para que cualquier tamaño
 * mantenga las proporciones.
 *
 * OJO con `conProducciones`: a tamaño pequeño la proporción original dejaría
 * "PRODUCCIONES" en 2-3 px, ilegible. Por eso el tamaño de esa palabra tiene un
 * suelo de 8 px; por debajo de `size` 110 conviene no mostrarla.
 */

// Relaciones respecto a la altura de la X
const RATIO_ALVAJE = 0.452; // font-size; con la cap-height de Jost (~0,73em) da el 1:3
const RATIO_PRODUCCIONES_ALTO = 0.74;
const SOLAPE = -0.03; // la A entra un poco bajo la X

type Props = {
  /** Altura de la X en píxeles. Lo demás se calcula a partir de aquí. */
  size?: number;
  /** "PRODUCCIONES" en vertical. Requiere size >= 110 para que se lea. */
  conProducciones?: boolean;
  /**
   * "PRODUCCIONES" en horizontal, bajo "ALVAJE". Para sitios de poca altura
   * como la barra de navegación: en vertical, 12 caracteres dentro de los 44 px
   * del logo obligarían a una letra de 3 px.
   */
  produccionesDebajo?: boolean;
  /**
   * Solo la X, sin "ALVAJE". Para la barra de las páginas interiores en móvil:
   * con cuatro secciones, el logotipo completo se comía el ancho y la última
   * entrada del menú se salía de la pantalla.
   */
  soloMarca?: boolean;
  /** false = letras negras (fondo claro) */
  claro?: boolean;
  /** Relieve como en el logo original */
  sombra?: boolean;
  className?: string;
};

export function Logo({
  size = 44,
  conProducciones = false,
  produccionesDebajo = false,
  soloMarca = false,
  claro = true,
  sombra = true,
  className,
}: Props) {
  const alvajePx = size * RATIO_ALVAJE;
  const produccionesAlto = size * RATIO_PRODUCCIONES_ALTO;
  // 12 caracteres con el tracking aplicado; suelo de 8 px por legibilidad
  const produccionesPx = Math.max(8, produccionesAlto / (12 * 0.95));

  const sombraTexto = sombra
    ? `${(size * 0.03).toFixed(1)}px ${(size * 0.045).toFixed(1)}px ${(size * 0.11).toFixed(1)}px rgba(0,0,0,0.55)`
    : undefined;

  return (
    <span className={cn('inline-flex items-center', className)}>
      <img
        src="/images/logo-x.webp"
        alt="X"
        width={187}
        height={240}
        style={{
          height: size,
          width: 'auto',
          marginRight: size * SOLAPE,
          filter: sombra
            ? `drop-shadow(${(size * 0.035).toFixed(1)}px ${(size * 0.05).toFixed(1)}px ${(size * 0.09).toFixed(1)}px rgba(0,0,0,0.5))`
            : undefined,
        }}
      />

      {!soloMarca && (
      <span className="inline-flex flex-col">
        <span
          className={cn('font-logo font-light leading-none', claro ? 'text-white' : 'text-exvia-black')}
          style={{
            fontSize: alvajePx,
            letterSpacing: '0.16em',
            textShadow: sombraTexto,
          }}
        >
          ALVAJE
        </span>

        {produccionesDebajo && (
          <span
            className={cn(
              'font-logo font-normal leading-none whitespace-nowrap',
              claro ? 'text-white/85' : 'text-exvia-black/75'
            )}
            style={{
              fontSize: Math.max(8, size * 0.16),
              letterSpacing: '0.42em',
              marginTop: size * 0.12,
              textShadow: sombraTexto,
            }}
          >
            PRODUCCIONES
          </span>
        )}
      </span>
      )}

      {conProducciones && !soloMarca && (
        <span
          className={cn(
            'font-logo font-normal leading-none whitespace-nowrap',
            claro ? 'text-white/85' : 'text-exvia-black/75'
          )}
          style={{
            fontSize: produccionesPx,
            letterSpacing: '0.34em',
            // Vertical y leyendo de abajo hacia arriba, como en el original
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            marginLeft: size * 0.05,
            textShadow: sombraTexto,
          }}
        >
          PRODUCCIONES
        </span>
      )}
    </span>
  );
}
