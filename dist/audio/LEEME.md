# Audio del ambiente de la portada

Aquí van dos archivos, y hasta que estén la web no suena (el componente
`src/components/Ambiente.tsx` se apaga solo si dan 404, sin errores ni control
a la vista):

| archivo | qué es | cómo debería estar |
|---|---|---|
| `porton.mp3` | El portón de garaje subiendo, rápido | 2-4 s, seco, sin cola de reverb larga. Es el golpe de entrada. |
| `wildtrack.mp3` | Calle cercana con coches + el equipo trabajando en la sala | 60-90 s, **en bucle limpio** (que el final empalme con el principio sin costura), sin música y sin voces reconocibles |

Formato: MP3 a 128 kbps mono basta y sobra — el ambiente va a 0,16 de volumen.
Cuanto menos pesen, mejor: se descargan en la portada.

## Cómo hacer que el bucle no se note
Cortar por un punto de silencio relativo y aplicar un fundido cruzado de ~1 s
entre el final y el principio. Con ffmpeg, sobre un wildtrack de 90 s:

```bash
ffmpeg -i bruto.wav -af "afade=t=in:st=0:d=1,afade=t=out:st=89:d=1" \
  -c:a libmp3lame -b:a 128k -ac 1 wildtrack.mp3
```

## Volúmenes
Están en `Ambiente.tsx`: `VOLUMEN_PORTON` (0,5) y `VOLUMEN_AMBIENTE` (0,16).
