import { useEffect, useState } from 'react';

/**
 * `true` solo cuando el dispositivo tiene un puntero fino de verdad (ratón o
 * trackpad). En táctil, `onMouseEnter` se dispara al tocar y `onMouseLeave`
 * puede no llegar nunca: el estado de hover se quedaría encendido para
 * siempre. Se notaba sobre todo en Proyectos, donde tocar un cartel dejaba la
 * imagen alternativa fijada hasta tocar otra cosa.
 *
 * Los hover puramente CSS no necesitan esto: la bandera
 * `hoverOnlyWhenSupported` de tailwind.config.js ya los envuelve en
 * `@media (hover: hover) and (pointer: fine)`.
 */
export function useHoverCapaz() {
  const [capaz, setCapaz] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const alCambiar = () => setCapaz(mq.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  return capaz;
}
