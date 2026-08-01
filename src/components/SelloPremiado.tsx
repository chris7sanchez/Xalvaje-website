/**
 * Sello de CORTOMETRAJE PREMIADO.
 *
 * Va en SVG inline y no como archivo suelto a propósito: un `.svg` referenciado
 * desde un <img> queda aislado — no le llegan ni las fuentes ni el CSS de la
 * página, así que "Anton" no se aplicaría y el rótulo saldría con otra letra.
 * Inline sí hereda la tipografía de la web.
 *
 * Estrella de 22 puntas generada por ángulos (radios 96 y 82 sobre un lienzo
 * de 200), no a ojo.
 */

const PUNTAS =
  '100,4 111.7,18.8 127,7.9 134.1,25.4 151.9,19.2 153.7,38 172.6,37.1 169,55.7 ' +
  '187.3,60.1 178.7,76.9 195,86.3 182,100 195,113.7 178.7,123.1 187.3,139.9 169,144.3 ' +
  '172.6,162.9 153.7,162 151.9,180.8 134.1,174.6 127,192.1 111.7,181.2 100,196 88.3,181.2 ' +
  '73,192.1 65.9,174.6 48.1,180.8 46.3,162 27.4,162.9 31,144.3 12.7,139.9 21.3,123.1 ' +
  '5,113.7 18,100 5,86.3 21.3,76.9 12.7,60.1 31,55.7 27.4,37.1 46.3,38 48.1,19.2 ' +
  '65.9,25.4 73,7.9 88.3,18.8';

export function SelloPremiado({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} role="img" aria-label="Cortometraje premiado">
      <defs>
        {/* Arco para el texto de arriba. Radio 62: deja las letras dentro de
            los aros sin tocarlos. */}
        <path id="sello-arco" d="M 38 100 A 62 62 0 0 1 162 100" fill="none" />
      </defs>

      {/* Filo claro, para que el sello despegue sobre carteles oscuros */}
      <polygon points={PUNTAS} fill="#FBF7F5" />
      <polygon
        points={PUNTAS}
        fill="var(--exvia-red, #B8442A)"
        transform="translate(100 100) scale(0.955) translate(-100 -100)"
      />

      <circle cx="100" cy="100" r="74" fill="none" stroke="#FBF7F5" strokeWidth="2.4" />
      <circle cx="100" cy="100" r="68" fill="none" stroke="#FBF7F5" strokeWidth="1.2" opacity="0.75" />

      <g fill="#FBF7F5" fontFamily="Anton, 'Arial Narrow', sans-serif" textAnchor="middle">
        <text fontSize="17" letterSpacing="1.1">
          <textPath href="#sello-arco" startOffset="50%">CORTOMETRAJE</textPath>
        </text>
        <text x="100" y="116" fontSize="23" letterSpacing="0.6">PREMIADO</text>
      </g>

      <path d="M 52 126 Q 100 120 148 126" fill="none" stroke="#FBF7F5" strokeWidth="1.6" opacity="0.8" />
      <path
        d="M 74 145 L 91 162 Q 110 138 130 126"
        fill="none"
        stroke="#FBF7F5"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
