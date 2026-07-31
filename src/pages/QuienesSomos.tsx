import { About } from '@/sections/About';
import { Testimonials } from '@/sections/Testimonials';
import { CTA } from '@/sections/CTA';

/** Única página con Testimonios: es donde encaja lo que dicen de vosotros. */
export function QuienesSomos() {
  return (
    <>
      <About />
      <Testimonials />
      <CTA />
    </>
  );
}
