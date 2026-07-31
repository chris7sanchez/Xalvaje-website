import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { aboutConfig, type AboutPerson } from '@/config';

/** Titular con el punto final en rojo, como en el diseño. */
function HeadlineLine({ text }: { text: string }) {
  const hasDot = text.endsWith('.');
  return (
    <span className="block">
      {hasDot ? text.slice(0, -1) : text}
      {hasDot && <span className="text-exvia-red">.</span>}
    </span>
  );
}

function PersonBlock({ person, onOpenBio }: { person: AboutPerson; onOpenBio: () => void }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  const photo = (
    <div
      className="relative w-full lg:max-w-[66%] lg:mx-auto overflow-hidden bg-neutral-950"
      style={{ aspectRatio: String(person.imageRatio) }}
    >
      <img
        src={person.image}
        alt={person.imageAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );

  const content = (
    <div
      className={cn(
        'flex flex-col justify-center px-8 py-10 lg:px-16 lg:py-10 reveal',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      <div className="max-w-2xl">
        {/* Sin numeracion: eran dos personas, no una lista ordenada.
            Nombre en UNA linea y el rol pegado justo debajo. El flex-wrap
            hace el resto: cuando la columna da de si, el rol sube a la
            derecha del nombre; cuando no, cae debajo. Sin duplicar marcado
            ni media queries a ojo. */}
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <h3 className="font-display uppercase text-white leading-[0.95] tracking-[0.05em] text-[clamp(2rem,3.6vw,3.6rem)] whitespace-nowrap">
            {person.firstName} {person.lastName}
          </h3>

          <p className="text-xs font-geist-mono uppercase tracking-[0.22em] text-exvia-red-text">
            {person.roles.join('  ·  ')}
          </p>
        </div>

        <blockquote className="mt-6 text-lg lg:text-xl text-white leading-snug">
          &ldquo;{person.quote}&rdquo;
        </blockquote>

        <span aria-hidden className="block w-10 h-px bg-exvia-red/70 mt-6 mb-5" />

        <p className="text-sm leading-relaxed text-white/70">{person.intro}</p>

        <button
          type="button"
          onClick={onOpenBio}
          className="group mt-8 inline-flex items-center gap-4 self-start border-b border-exvia-red/50 pb-1.5 text-xs font-geist-mono uppercase tracking-[0.22em] text-exvia-red-text hover:border-exvia-red hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-exvia-red focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        >
          Ver biografía
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 border-b border-white/10 items-center"
    >
      {/* En móvil la foto va siempre primero; el espejo solo aplica en escritorio */}
      {person.mirrored ? (
        <>
          <div className="lg:order-2">{photo}</div>
          <div className="lg:order-1">{content}</div>
        </>
      ) : (
        <>
          {photo}
          {content}
        </>
      )}
    </div>
  );
}

function TeamBlock() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const { team } = aboutConfig;

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 items-center">
      <div
        className={cn(
          'flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-12 reveal',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <div className="w-full">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-geist-mono uppercase tracking-[0.25em] text-exvia-red-text">
              {team.label}
            </span>
            <span aria-hidden className="h-px w-12 bg-exvia-red/70" />
          </div>

          <h2 className="font-display uppercase text-white leading-[0.95] tracking-[0.02em] text-[clamp(2rem,4vw,4.25rem)] mb-8">
            {team.headlineLines.map((line) => (
              <HeadlineLine key={line} text={line} />
            ))}
          </h2>

          {/* Tres columnas como en el diseño; se apilan por debajo de sm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5">
            {team.columns.map((col, i) => (
              <div key={i} className="space-y-4">
                {col.map((p) => (
                  <p key={p.slice(0, 24)} className="text-[0.8125rem] leading-relaxed text-white/70">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm font-geist-mono uppercase tracking-[0.18em] text-exvia-red-text">
            {team.closing}
          </p>
          <span aria-hidden className="block w-10 h-px bg-exvia-red/70 mt-4" />
        </div>
      </div>

      <div
        className="relative w-full lg:max-w-[60%] lg:mx-auto overflow-hidden bg-neutral-950"
        style={{ aspectRatio: String(team.imageRatio) }}
      >
        <img
          src={team.image}
          alt={team.imageAlt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export function About() {
  const [openBio, setOpenBio] = useState<AboutPerson | null>(null);

  return (
    <section id="about" className="w-full bg-black">
      {/* Encabezado de sección: al entrar por el menú aparecía directamente la
          foto del primer autor, sin decir dónde estabas. */}
      <div className="container-large px-6 lg:px-12 pt-14 lg:pt-16 pb-8 lg:pb-10">
        <span className="block text-[0.7rem] font-geist-mono uppercase tracking-[0.3em] text-white/85">
          {aboutConfig.sectionLabel}
        </span>
        <h2 className="mt-2 font-display uppercase text-white leading-[0.95] tracking-[-0.01em] text-[clamp(2rem,4.2vw,4.5rem)]">
          {(() => {
            // Mismo criterio que en Proyectos: primera palabra en blanco y el
            // resto en rojo, partiendo el texto del config.
            const [primera, ...resto] = aboutConfig.sectionHeading.split(' ');
            return (
              <>
                {primera}
                {resto.length > 0 && (
                  <span className="text-exvia-red-text"> {resto.join(' ')}</span>
                )}
              </>
            );
          })()}
        </h2>
      </div>

      {/* Dentro del mismo container-large que el encabezado y que el resto de
          paginas. Antes iban a sangre completa y Quienes Somos se veia el
          doble de grande que Proyectos en la misma pantalla. */}
      <div className="container-large px-6 lg:px-12">
        {aboutConfig.people.map((person) => (
          <PersonBlock key={person.number} person={person} onOpenBio={() => setOpenBio(person)} />
        ))}

        <TeamBlock />
      </div>

      {/* Biografía completa */}
      <Dialog open={openBio !== null} onOpenChange={(v) => !v && setOpenBio(null)}>
        <DialogContent
          showCloseButton={false}
          className="z-[100] max-w-none sm:max-w-2xl w-[92vw] max-h-[85vh] overflow-y-auto p-8 lg:p-12 border border-white/15 bg-neutral-950 rounded-none"
        >
          {openBio && (
            <>
              <DialogTitle className="font-display uppercase text-white leading-[0.95] tracking-[0.05em] text-[clamp(1.75rem,4vw,2.75rem)]">
                {openBio.firstName} {openBio.lastName}
              </DialogTitle>
              <p className="text-xs font-geist-mono uppercase tracking-[0.22em] text-exvia-red-text">
                {openBio.roles.join('  ·  ')}
              </p>
              <span aria-hidden className="block w-10 h-px bg-exvia-red/70 my-2" />
              <div className="space-y-4">
                {openBio.bio.map((p) => (
                  <p key={p.slice(0, 24)} className="text-sm leading-relaxed text-white/75">
                    {p}
                  </p>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOpenBio(null)}
                className="mt-4 self-start border-b border-exvia-red/50 pb-1.5 text-xs font-geist-mono uppercase tracking-[0.22em] text-exvia-red-text hover:border-exvia-red hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
