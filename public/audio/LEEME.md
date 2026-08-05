# Audio del ambiente de la portada

Los dos archivos que consume `src/components/Ambiente.tsx`. Están hechos a
partir de los brutos que entregó Christian, guardados en `recursos/audio/`
(fuera de git: `recursos/` está en .gitignore).

| archivo | de dónde sale | qué se le hizo |
|---|---|---|
| `porton.mp3` | `WILDTRACK GARAGE.mp3` (6,02 s) | Recortado el silencio de cabeza y cola (0,22 → 5,90 s), cierre con un fundido de 0,23 s y nivelado a **−24 LUFS** (era −18: se bajó 6 dB para que el paso al ambiente no diera un escalón). **89 KB, 5,68 s** |
| `wildtrack.mp3` | `WILDTRACK CINEMA.mp3` (25,27 s) | Bucle sin costura + tratamiento de lejanía. **234 KB, 19,9 s** |

## El wildtrack va SIN filtro de lejanía
Lo llevó (`lowpass=2200` + `aecho`) y **se retiró**: apagaba tanto las voces que
dejaba de oírse gente y quedaba una papilla. Lo que lo manda al fondo ahora es
el volumen, no el color. La cadena que queda es:

```
highpass=60  →  acompressor  →  loudnorm
```

- `highpass=60` solo se lleva subgraves que no se oyen y ensucian.
- `acompressor` está por el bucle, no por estética: iguala los extremos del
  archivo, que es lo que hacía audible el empalme.

**Medido:** los agudos (>3 kHz) están a −14,3 dB del cuerpo, prácticamente lo
mismo que el portón (−14,6). Los dos suenan a la misma sala; lo único que los
separa es el nivel.

## El bucle
Se salta la cabeza casi muda (0-0,4 s) y se cruzan 5 segundos entre el final y
el principio, de modo que al enlazar no hay corte. Con un cruce de 2 s el
empalme saltaba 9 dB; con 5 s más la compresión se queda en 6,3 dB, que a 0,16
de volumen no canta.

## Volúmenes y tiempos
Están en `Ambiente.tsx`: `VOLUMEN_PORTON` (0,34), `VOLUMEN_AMBIENTE` (0,14),
`RETRASO_MS` (3000: el ambiente entra a los 3 s, con el portón todavía subiendo)
y `ENTRADA_MS` (2600, lo que tarda en subir del todo).

## Rehacerlos
```bash
S="recursos/audio/WILDTRACK CINEMA.mp3"
ffmpeg -y -i "$S" -i "$S" -filter_complex \
"[0:a]atrim=0.4:20.27,asetpts=N/SR/TB[cuerpo];\
 [1:a]atrim=20.27:25.27,asetpts=N/SR/TB[cola];\
 [cola][cuerpo]acrossfade=d=5:c1=tri:c2=tri[bucle];\
 [bucle]highpass=f=60,acompressor=threshold=-30dB:ratio=4:attack=25:release=450:makeup=2,loudnorm=I=-30:TP=-6:LRA=6[out]" \
 -map "[out]" -c:a libmp3lame -b:a 96k -ar 44100 public/audio/wildtrack.mp3
```
