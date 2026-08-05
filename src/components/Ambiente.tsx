import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * AMBIENTE SONORO DE LA PORTADA.
 *
 * Al primer gesto del visitante suena el portón de garaje subiendo, y detrás
 * entra el wildtrack de calle —coches de fondo, el equipo trabajando en la
 * sala— en bucle y muy por debajo. La idea es que la web tenga sala, no que
 * suene a música de espera: por eso el wildtrack se queda en 0,16 de volumen.
 *
 * OJO CON EL AUTOPLAY, que es la trampa de todo esto. Los navegadores no dejan
 * sonar nada hasta que el visitante "activa" la página, y la RUEDA DEL RATÓN NO
 * CUENTA como activación: solo valen pulsar, tocar la pantalla o el teclado.
 * Como la portada se recorre con la rueda, en escritorio lo normal es que el
 * primer intento lo bloqueen. Por eso:
 *   · se prueba en CADA gesto, no solo en el primero;
 *   · si el navegador dice que no, aparece el botón de sonido para activarlo a
 *     mano, y ahí ya no puede negarse;
 *   · la decisión se recuerda, para no dar la lata en cada visita.
 *
 * Y si los archivos de audio no están (404), esto se apaga solo: ni suena, ni
 * enseña el control, ni deja un error en consola. La web no se entera. [F9]
 */

const PORTON = '/audio/porton.mp3';
const WILDTRACK = '/audio/wildtrack.mp3';

/** Volumen final del ambiente. Bajo a propósito: es sala, no banda sonora. */
const VOLUMEN_AMBIENTE = 0.16;
const VOLUMEN_PORTON = 0.5;
/** Lo que tarda el ambiente en entrar del todo, en ms */
const ENTRADA_MS = 2600;
/** Retraso del ambiente respecto al portón: entra cuando el portón ya subió */
const RETRASO_MS = 900;

const MEMORIA = 'xalvaje-sonido';

export function Ambiente({ activo = true }: { activo?: boolean }) {
  const porton = useRef<HTMLAudioElement | null>(null);
  const ambiente = useRef<HTMLAudioElement | null>(null);
  const arrancado = useRef(false);
  const fundido = useRef<number | null>(null);

  const [sonando, setSonando] = useState(false);
  const [hayControl, setHayControl] = useState(false);
  const [disponible, setDisponible] = useState(true);

  /** Sube el ambiente poco a poco hasta su volumen final. */
  const subirAmbiente = useCallback(() => {
    const a = ambiente.current;
    if (!a) return;
    if (fundido.current) window.clearInterval(fundido.current);
    const paso = 60;
    let t = 0;
    fundido.current = window.setInterval(() => {
      t += paso;
      a.volume = Math.min(VOLUMEN_AMBIENTE, (t / ENTRADA_MS) * VOLUMEN_AMBIENTE);
      if (t >= ENTRADA_MS && fundido.current) window.clearInterval(fundido.current);
    }, paso);
  }, []);

  const arrancar = useCallback(async () => {
    if (arrancado.current || !porton.current || !ambiente.current) return;
    try {
      porton.current.volume = VOLUMEN_PORTON;
      await porton.current.play();
      arrancado.current = true;
      setSonando(true);
      setHayControl(true);
      window.setTimeout(() => {
        const a = ambiente.current;
        if (!a) return;
        a.volume = 0;
        a.play().then(subirAmbiente).catch(() => {});
      }, RETRASO_MS);
    } catch {
      // Bloqueado por el navegador: se enseña el botón y se vuelve a intentar
      // en el siguiente gesto. No es un error, es la política de autoplay.
      setHayControl(true);
    }
  }, [subirAmbiente]);

  // Gestos que pueden desbloquear el audio. La rueda va incluida aunque casi
  // nunca sirva: si el visitante ya activó la página antes, funciona.
  useEffect(() => {
    if (!activo || !disponible) return;
    if (localStorage.getItem(MEMORIA) === 'off') return;

    const probar = () => { if (!arrancado.current) arrancar(); };
    const eventos = ['pointerdown', 'touchstart', 'keydown', 'wheel'] as const;
    eventos.forEach((e) => window.addEventListener(e, probar, { passive: true }));
    return () => eventos.forEach((e) => window.removeEventListener(e, probar));
  }, [activo, disponible, arrancar]);

  // Al salir de la portada se calla, pero no se descarga: si vuelve, sigue.
  useEffect(() => {
    if (activo) return;
    porton.current?.pause();
    ambiente.current?.pause();
    setSonando(false);
  }, [activo]);

  const alternar = () => {
    if (sonando) {
      porton.current?.pause();
      ambiente.current?.pause();
      setSonando(false);
      localStorage.setItem(MEMORIA, 'off');
      return;
    }
    localStorage.setItem(MEMORIA, 'on');
    if (arrancado.current) {
      ambiente.current?.play().then(subirAmbiente).catch(() => {});
      setSonando(true);
    } else {
      arrancar();
    }
  };

  if (!activo) return null;

  return (
    <>
      <audio
        ref={porton}
        src={PORTON}
        preload="auto"
        onError={() => setDisponible(false)}
      />
      <audio
        ref={ambiente}
        src={WILDTRACK}
        loop
        preload="auto"
        onError={() => setDisponible(false)}
      />

      {/* El control solo asoma cuando hay algo que controlar */}
      {disponible && hayControl && (
        <button
          type="button"
          onClick={alternar}
          aria-pressed={sonando}
          aria-label={sonando ? 'Silenciar el ambiente' : 'Activar el sonido'}
          className="fixed bottom-6 left-6 z-[70] flex items-end gap-[3px] h-6 px-3 py-2 bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/50 transition-colors duration-300"
        >
          {/* Tres barras: se mueven mientras suena, quietas y bajas cuando no.
              Sin texto: en una portada a oscuras, un rótulo cantaría. */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                'block w-[2px] bg-white transition-[height,opacity] duration-300',
                sonando ? 'animate-[barra_900ms_ease-in-out_infinite]' : 'h-[3px] opacity-50'
              )}
              style={sonando ? { height: '100%', animationDelay: `${i * 140}ms` } : undefined}
            />
          ))}
        </button>
      )}
    </>
  );
}
