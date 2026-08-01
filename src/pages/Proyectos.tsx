import { AccesosCategorias } from '@/components/AccesosCategorias';
import { Portfolio } from '@/sections/Portfolio';
import { Photography } from '@/sections/Photography';
import { NuestraVision } from '@/sections/NuestraVision';
import { CtaBanner } from '@/components/CtaBanner';

/**
 * Proyectos por categorías: Largometrajes, Cortometrajes, Fotografía y
 * Campañas creativas, con accesos directos arriba para saltar entre ellas.
 */
export function Proyectos() {
  return (
    <>
      <AccesosCategorias />
      <Portfolio />
      <Photography />
      {/* Cierre: el reel visto por ventanas. Va después del trabajo y antes
          de la llamada a la acción — es el remate, no compite con los carteles. */}
      <NuestraVision />
      <CtaBanner />
    </>
  );
}
