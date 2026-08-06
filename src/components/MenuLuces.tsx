import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { paginasConfig } from '@/config';

/**
 * EL MENÚ DE LUCES de la portada (elegido de /demo-menu, propuesta VI).
 *
 * Sobre el fotograma final —la nave en reposo— cada esquina enciende SU estado
 * de luz renderizado, cruzando de imagen con el parpadeo de una lámpara de
 * tungsteno. VER REEL no es un botón: son letras que se revelan dentro del haz
 * cenital cuando el ratón se acerca al centro.
 *
 * Estados renderizados por Christian (06/08/2026). Dos siguen PENDIENTES de
 * re-export (su archivo llegó duplicado o cambiado): Qué Ofrecemos y Nuestra
 * Visión llevan mientras tanto una luz hecha en CSS sobre el reposo. Cuando
 * lleguen los definitivos, basta añadirlos a RENDERS y quitar el caso especial.
 *
 * En pantallas SIN ratón no hay hover: se ven las cuatro esquinas y el VER REEL
 * siempre encendidos, y el toque navega directo.
 */

const RENDERS = {
  reposo: '/images/menu-estados/reposo.webp',
  proyectos: '/images/menu-estados/proyectos.webp',
  quienes: '/images/menu-estados/quienes-somos.webp',
  reel: '/images/menu-estados/ver-reel.webp',
};

type Estado = 'proyectos' | 'ofrecemos' | 'quienes' | 'vision' | null;

const ESQUINAS: { clave: Exclude<Estado, null>; ruta: string; pos: string }[] = [
  { clave: 'proyectos', ruta: '/proyectos', pos: 'left-[6%] top-[18%]' },
  { clave: 'ofrecemos', ruta: '/que-ofrecemos', pos: 'right-[6%] top-[18%]' },
  { clave: 'quienes', ruta: '/quienes-somos', pos: 'left-[6%] bottom-[12%]' },
  { clave: 'vision', ruta: '/nuestra-vision', pos: 'right-[6%] bottom-[12%]' },
];

const ETIQUETAS: Record<Exclude<Estado, null>, string> = {
  proyectos: 'Proyectos',
  ofrecemos: '¿Qué ofrecemos?',
  quienes: '¿Quiénes somos?',
  vision: 'Nuestra visión',
};

export function MenuLuces({
  visible,
  alIr,
  alReel,
}: {
  visible: boolean;
  alIr: (ruta: string) => void;
  alReel: () => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [foco, setFoco] = useState<Estado>(null);
  const [cerca, setCerca] = useState(false);
  const [conRaton] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  );

  // Las rutas del menú tienen que existir como páginas; si el config y las
  // rutas se desincronizan, mejor enterarse en desarrollo.
  if (import.meta.env.DEV) {
    const conocidas = paginasConfig.map((p) => p.ruta);
    ESQUINAS.forEach((e) => {
      if (!conocidas.includes(e.ruta)) console.warn(`MenuLuces: ruta desconocida ${e.ruta}`);
    });
  }

  const reelVisible = conRaton ? cerca && foco === null : true;

  return (
    <div
      ref={caja}
      className={cn(
        'absolute inset-0 z-30 transition-opacity duration-700',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onMouseMove={
        conRaton
          ? (e) => {
              const r = caja.current?.getBoundingClientRect();
              if (!r) return;
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height * 0.4);
              setCerca(Math.hypot(dx * 1.5, dy) < r.height * 0.3);
            }
          : undefined
      }
      onMouseLeave={() => { setFoco(null); setCerca(false); }}
    >
      {/* Base: el reposo renderizado, cubriendo el fotograma final */}
      <img src={RENDERS.reposo} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />

      {/* Estados reales */}
      <img
        src={RENDERS.proyectos} alt="" aria-hidden
        className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-200', foco === 'proyectos' ? 'opacity-100 animate-[encender_600ms_ease-out]' : 'opacity-0')}
      />
      <img
        src={RENDERS.quienes} alt="" aria-hidden
        className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-200', foco === 'quienes' ? 'opacity-100 animate-[encender_600ms_ease-out]' : 'opacity-0')}
      />
      <img
        src={RENDERS.reel} alt="" aria-hidden
        className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-200', reelVisible && conRaton ? 'opacity-100 animate-[encender_600ms_ease-out]' : 'opacity-0')}
      />

      {/* Provisionales hasta el re-export: luz CSS sobre el reposo */}
      <span aria-hidden className={cn('absolute inset-0 transition-opacity duration-200 pointer-events-none', foco === 'vision' ? 'opacity-100 animate-[encender_600ms_ease-out]' : 'opacity-0')}>
        <span className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 18% 30% at 79% 58%, rgba(110,165,255,0.55), transparent 75%)', mixBlendMode: 'screen' }} />
        <span className="absolute inset-0 bg-black/35" style={{ WebkitMaskImage: 'radial-gradient(ellipse 22% 36% at 79% 58%, transparent 40%, #000 100%)', maskImage: 'radial-gradient(ellipse 22% 36% at 79% 58%, transparent 40%, #000 100%)' }} />
      </span>
      <span aria-hidden className={cn('absolute inset-0 transition-opacity duration-200 pointer-events-none', foco === 'ofrecemos' ? 'opacity-100 animate-[encender_600ms_ease-out]' : 'opacity-0')}>
        <span className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 34% 24% at 55% 12%, rgba(255,255,255,0.4), transparent 75%)', mixBlendMode: 'screen' }} />
        <span className="absolute inset-0 bg-black/35" style={{ WebkitMaskImage: 'radial-gradient(ellipse 40% 30% at 55% 12%, transparent 40%, #000 100%)', maskImage: 'radial-gradient(ellipse 40% 30% at 55% 12%, transparent 40%, #000 100%)' }} />
      </span>

      {/* Las cuatro esquinas */}
      {ESQUINAS.map((e) => (
        <a
          key={e.clave}
          href={e.ruta}
          onClick={(ev) => { ev.preventDefault(); alIr(e.ruta); }}
          onMouseEnter={conRaton ? () => setFoco(e.clave) : undefined}
          onFocus={() => setFoco(e.clave)}
          className={cn(
            'absolute font-display uppercase leading-none tracking-[-0.01em] transition-[color,transform,opacity] duration-300',
            'text-[clamp(1rem,2.4vw,2.2rem)]',
            e.pos,
            foco === e.clave ? 'text-exvia-red-text scale-110' : foco === null ? 'text-[#FBF7F5]' : 'text-[#FBF7F5]/30'
          )}
          style={{ textShadow: '0 2px 14px rgba(0,0,0,0.92)' }}
        >
          {ETIQUETAS[e.clave]}
        </a>
      ))}

      {/* VER REEL, dentro del haz cenital */}
      <button
        type="button"
        onClick={alReel}
        aria-label="Ver el reel completo, 92 segundos"
        className={cn(
          'absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2',
          'font-display uppercase leading-none text-[clamp(1.6rem,4vw,3.4rem)]',
          'transition-[opacity,filter,transform] duration-500 ease-out-quart',
          reelVisible
            ? 'opacity-100 blur-0 scale-100 text-[#FBF7F5]'
            : 'opacity-0 blur-[10px] scale-95 pointer-events-none text-white'
        )}
        style={{ textShadow: '0 0 30px rgba(255,235,200,0.9), 0 0 70px rgba(255,220,160,0.5), 0 2px 10px rgba(0,0,0,0.8)' }}
      >
        Ver reel
      </button>
    </div>
  );
}
