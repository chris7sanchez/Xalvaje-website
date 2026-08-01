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
        {/* Arco del texto de arriba. Radio 46, no 62: las letras de un textPath
            se apoyan HACIA FUERA del trazado, y no por su altura de mayúscula
            sino por el ascendente de la fuente, que en Anton es bastante más.
            Con 62 (y hasta con 54) las puntas de las letras cruzaban el aro,
            que está en 74. Comprobado a 288 px. */}
        <path id="sello-arco" d="M 54 100 A 46 46 0 0 1 146 100" fill="none" />
      </defs>

      {/* Filo claro, para que el sello despegue sobre carteles oscuros */}
      <polygon points={PUNTAS} fill="#FBF7F5" />
      <polygon
        points={PUNTAS}
        fill="var(--exvia-red, #B8442A)"
        transform="translate(100 100) scale(0.955) translate(-100 -100)"
      />

      {/* UN solo aro, no dos. El segundo iba en 68 y era justo el que cortaba
          PREMIADO: dentro de él solo caben 126 unidades de ancho y la palabra
          mide 131. Con el aro de 74, la cuerda a la altura de la palabra da
          139 y entra holgada. Un adorno menos, la palabra más grande. */}
      <circle cx="100" cy="100" r="74" fill="none" stroke="#FBF7F5" strokeWidth="2.4" />

      {/* El reparto del espacio manda sobre el adorno: PREMIADO es la palabra
          que tiene que leerse de lejos, así que se lleva el centro entero y el
          cuerpo más grande que cabe dentro del aro. Antes ocupaba ese sitio un
          garabato de visto bueno que no decía nada y dejaba la palabra en la
          mitad de tamaño. */}
      <g fill="#FBF7F5" fontFamily="Anton, 'Arial Narrow', sans-serif" textAnchor="middle">
        <text fontSize="21" letterSpacing="0.8">
          <textPath href="#sello-arco" startOffset="50%">CORTOMETRAJE</textPath>
        </text>
        {/* 34 y no más: a la altura de su base la cuerda del aro mide 139 y la
            palabra ocupa 131. Con más cuerpo se saldría del círculo. */}
        <text x="100" y="126" fontSize="34" letterSpacing="0.2">PREMIADO</text>
      </g>

      {/* Tres estrellas abajo, para que el aro no quede cojo */}
      <g fill="#FBF7F5" opacity="0.85">
        <circle cx="84" cy="148" r="3.2" />
        <circle cx="100" cy="151" r="3.8" />
        <circle cx="116" cy="148" r="3.2" />
      </g>
    </svg>
  );
}
