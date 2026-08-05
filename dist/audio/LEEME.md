# Audio del ambiente de la portada

Los dos archivos que consume `src/components/Ambiente.tsx`. Están hechos a
partir de los brutos que entregó Christian, guardados en `recursos/audio/`
(fuera de git: `recursos/` está en .gitignore).

| archivo | de dónde sale | qué se le hizo |
|---|---|---|
| `porton.mp3` | `WILDTRACK GARAGE.mp3` (6,02 s) | Recortado el silencio de cabeza y cola (0,22 → 5,90 s), cierre con un fundido de 0,23 s y nivelado a −18 LUFS. **89 KB, 5,68 s** |
| `wildtrack.mp3` | `WILDTRACK CINEMA.mp3` (25,27 s) | Bucle sin costura + tratamiento de lejanía. **234 KB, 19,9 s** |

## El tratamiento de lejanía del wildtrack
La distancia se oye sobre todo como **pérdida de agudos**, no como bajar el
volumen. La cadena es:

```
highpass=95  →  lowpass=2200  →  acompressor  →  aecho  →  loudnorm
```

- `lowpass=2200` es el filtro que aleja: se lleva el brillo.
- `acompressor` aplana la dinámica. Hace dos cosas a la vez: la distancia
  comprime de por sí, y de paso iguala los extremos del archivo, que es lo que
  hacía audible el punto de empalme del bucle.
- `aecho` da algo de sala sin que se note como efecto.

**Medido:** en el bruto los agudos (>3 kHz) estaban a −9,2 dB del cuerpo; en el
tratado están a −20,2 dB. Once decibelios menos de brillo: eso es la distancia.

## El bucle
Se salta la cabeza casi muda (0-0,4 s) y se cruzan 5 segundos entre el final y
el principio, de modo que al enlazar no hay corte. Con un cruce de 2 s el
empalme saltaba 9 dB; con 5 s más la compresión se queda en 6,3 dB, que a 0,16
de volumen no canta.

## Volúmenes y tiempos
Están en `Ambiente.tsx`: `VOLUMEN_PORTON` (0,5), `VOLUMEN_AMBIENTE` (0,16),
`RETRASO_MS` (3000: el ambiente entra a los 3 s, con el portón todavía subiendo)
y `ENTRADA_MS` (2600, lo que tarda en subir del todo).

## Rehacerlos
```bash
S="recursos/audio/WILDTRACK CINEMA.mp3"
ffmpeg -y -i "$S" -i "$S" -filter_complex \
"[0:a]atrim=0.4:20.27,asetpts=N/SR/TB[cuerpo];\
 [1:a]atrim=20.27:25.27,asetpts=N/SR/TB[cola];\
 [cola][cuerpo]acrossfade=d=5:c1=tri:c2=tri[bucle];\
 [bucle]highpass=f=95,lowpass=f=2200,acompressor=threshold=-30dB:ratio=6:attack=25:release=450:makeup=3,aecho=0.85:0.6:55:0.22,loudnorm=I=-26:TP=-4:LRA=5[out]" \
 -map "[out]" -c:a libmp3lame -b:a 96k -ar 44100 public/audio/wildtrack.mp3
```
