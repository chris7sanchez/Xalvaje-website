import { Portfolio } from '@/sections/Portfolio';
import { Photography } from '@/sections/Photography';
import { CTA } from '@/sections/CTA';

/** Proyectos, con Fotografía dentro. Cierra con el bloque de contacto. */
export function Proyectos() {
  return (
    <>
      <Portfolio />
      <Photography />
      <CTA />
    </>
  );
}
