import { AccesosCategorias } from '@/components/AccesosCategorias';
import { Portfolio } from '@/sections/Portfolio';
import { Photography } from '@/sections/Photography';
import { Fragmentos } from '@/sections/Fragmentos';
import { CtaBanner } from '@/components/CtaBanner';

/**
 * Proyectos por categorías: Largometrajes, Cortometrajes, Fotografía y
 * Campañas creativas, con accesos directos arriba para saltar entre ellas.
 * Fragmentos va al final: son sueltos sin categoría, no compiten con los
 * proyectos ni con los retratos por atención.
 */
export function Proyectos() {
  return (
    <>
      <AccesosCategorias />
      <Portfolio />
      <Photography />
      <Fragmentos />
      <CtaBanner />
    </>
  );
}
