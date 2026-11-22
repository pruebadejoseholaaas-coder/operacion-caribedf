# Operación Caribe — Informe de progreso

Actualizado: 2026-11-22 · Rama: `mundo-abierto-trafico-minimapa`

Este documento refleja el estado **real y verificado** del proyecto, no solo lo que existe en el código.
La verificación se hizo compilando con Vite y ejecutando el juego en Chromium headless con WebGL
(SwiftShader), leyendo telemetría del propio juego. No se ha probado en un Android físico ni en una
GPU real, así que el rendimiento final sigue pendiente de validación en dispositivo.

## Cómo se verifica

```bash
npm install
npm run build          # compilación de producción
npm run dev            # servidor local
```

En desarrollo se expone `window.__oc` (solo con `import.meta.env.DEV`) con escena, cámara,
colisiones, mundo, tráfico, comercios, NPC y jugador. Sirve para pruebas automatizadas.

## Estado por fase

| Fase | Estado | Verificado |
| --- | --- | --- |
| 1. Mundo y ciudad | Parcial | Calles, aceras, contenes, cruces, edificios OSM con fachadas, parques, agua, árboles, farolas, bancos, papeleras, postes y carga por sectores. Faltan interiores de edificios no comerciales y más variedad de alturas. |
| 2. Habitantes e IA | Parcial | 22 NPC con nombre, oficio, personalidad, horario, ruta por aceras, saludos, confianza y memoria guardada. Faltan rutas casa-trabajo, conversaciones encadenadas y animaciones de sentarse/comprar. |
| 3. Tráfico y transporte | Implementado en este bloque | Grafo de calles, intersecciones, semáforos, carriles, separación, frenado, estacionados, paradas de guagua y reciclaje. Verificado por telemetría. Faltan pasajeros subiendo/bajando y tráfico en el minimapa. |
| 4. Viviendas y vida cotidiana | Pendiente | Sin casa del jugador ni interiores domésticos. |
| 5. Negocios y economía | Parcial | 40 comercios con interior, horarios, stock, precios en RD$, empleado y cliente animados, compra y economía persistente. Corregida la colocación (antes 16 estaban dentro de edificios). |
| 6. Trabajos y misiones | Pendiente | Solo existe el objetivo de "punto de encuentro" y los roles con habilidades. |
| 7. Ambiente y sonido | Parcial | Ciclo día/noche, amanecer, clima (sol, nublado, lluvia, niebla), lluvia y luces de farolas. Faltan sonidos ambientales, nubes, viento y árboles animados. |
| 8. Interfaz y optimización | Parcial | Minimapa circular, mapa completo, HUD, guardado y controles táctiles básicos. Faltan menú principal, teléfono, inventario visible, ajustes gráficos y pruebas en Android. |

## Cambios realizados en este bloque

### Tráfico real (`src/traffic.js`)

- Grafo planar construido desde las vías del mapa. Los cruces geométricos se dividen para que
  existan intersecciones reales aunque OSM no comparta nodos.
- 579 nodos, 121 cruces con semáforo y 10 paradas de transporte en el área jugable.
- Carriles a la derecha según el sentido, giros en intersecciones con preferencia por seguir recto.
- Semáforos con dos fases (eje X / eje Z) y ámbar; los vehículos frenan antes del cruce en rojo.
- Separación con el vehículo de delante y frenado ante el jugador si se cruza en la vía.
- Estacionados junto al contención, con colisión, reciclados al alejarse.
- Reciclaje de vehículos lejanos sin teletransportes visibles ni cambio de modelo en el sitio.
- 16 vehículos activos en PC y 9 en móvil, con los 50 modelos del catálogo existente.

### Correcciones críticas

- **16 de 40 comercios estaban dentro de edificios** del mapa real (y varios a 20–37 m de la calle).
  Ahora se colocan en solares libres junto a la vía, mirando a la calle, con 20 m de separación.
  Verificación: 40/40 comercios, 0 dentro de edificios.
- **El objetivo de la misión estaba dentro de un edificio** y era inalcanzable. Ahora se ajusta a la
  vía más cercana. Verificación: 0 edificios en el punto objetivo.
- El punto de aparición caía en el eje de la calle; ahora se coloca en la acera libre más cercana.
- La moto aparecía delante de la cámara; ahora se aparca en el contención y se rediseñó el modelo.
- La cámara atravesaba edificios; ahora se acerca al jugador cuando hay una pared detrás.
- Los vehículos antiguos se teletransportaban al final del segmento y cambiaban de modelo en el sitio.

### Interfaz

- Minimapa circular con calles, edificios, parques, comercios (abierto/cerrado), NPC, objetivo y brújula.
- Mapa completo con la tecla `M` (o tocando el minimapa) y cierre con `Esc` o el botón.
- El minimapa gira con la cámara y la flecha muestra la orientación real del jugador.

## Pruebas realizadas

| Prueba | Resultado |
| --- | --- |
| `npm run build` | Correcto (≈1,4 s, 708 kB sin comprimir). |
| Carga en Chromium headless | Sin `pageerror`. Único error de red: favicon 404 (irrelevante). |
| Comercios dentro de edificios | 0 de 40. |
| Objetivo dentro de edificios | 0. |
| Tráfico, 15 s de simulación | 16 vehículos, 0 fuera de la vía (máx. 1,54 m del eje), salto máximo 1,72 m/500 ms, distancia mínima entre vehículos 5,33 m, cambios de arista y giros detectados, 22 estacionados, 10 paradas. |
| Semáforos | Vehículos detenidos en rojo detectados en muestreo. |
| Minimapa / mapa completo | Se dibujan y abren/cierran correctamente. |
| FPS headless | ≈3,5 fps con SwiftShader; no representa el rendimiento de una GPU real. |

## Errores conocidos y limitaciones

- El rendimiento en Android real no está medido. El tráfico y los semáforos usan objetos ligeros,
  pero falta probarlo en un teléfono.
- Los semáforos y las paradas no tienen colisión (son mobiliario).
- Los pasajeros del transporte público aún no suben ni bajan.
- El tráfico no aparece en el minimapa.
- La lluvia no moja las calles ni genera charcos.
- El audio ambiental y la música siguen pendientes.

## Próxima tarea prioritaria

1. Casa del jugador con interior explorable: puerta, sala, cocina, comedor, dormitorio, baño, cama,
   luces, armario e inventario doméstico, integrada con el guardado.
2. Teléfono e inventario visibles en la interfaz.
3. Trabajos y misiones con recompensas en RD$.
4. Pasajeros y paradas de transporte público.
5. Pruebas en Android y ajustes gráficos.
