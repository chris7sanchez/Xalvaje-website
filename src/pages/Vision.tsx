import { NuestraVision } from '@/sections/NuestraVision';
import { CtaBanner } from '@/components/CtaBanner';

/**
 * Página del manifiesto. Va sola a propósito: la tira de ventanas ocupa la
 * pantalla entera durante todo su recorrido, así que cualquier cosa que
 * compartiera página con ella competiría por el mismo espacio.
 */
export function Vision() {
  return (
    <>
      <NuestraVision />
      <CtaBanner />
    </>
  );
}
