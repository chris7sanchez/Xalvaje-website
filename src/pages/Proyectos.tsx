import { AccesosCategorias } from '@/components/AccesosCategorias';
import { Portfolio } from '@/sections/Portfolio';
import { Photography } from '@/sections/Photography';
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
      <CtaBanner />
    </>
  );
}
