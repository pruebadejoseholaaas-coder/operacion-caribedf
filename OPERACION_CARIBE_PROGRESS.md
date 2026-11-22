# Operación Caribe — Informe de progreso

Actualizado: 2026-11-22 · Rama: `mundo-abierto-trafico-minimapa` (segundo bloque)

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
| 4. Viviendas y vida cotidiana | Implementado en este bloque | Casa propia con fachada en la ciudad e interior explorable: sala, comedor, cocina, dormitorio y baño. Puerta funcional, luces, cama para dormir, nevera, armario e inventario doméstico. Guardado de energía, ropa y luces. |
| 5. Negocios y economía | Parcial | 40 comercios con interior, horarios, stock, precios en RD$, empleado y cliente animados, compra y economía persistente. Colocación corregida con muestreo del solar y acceso despejado: 0/40 dentro de edificios. |
| 6. Trabajos y misiones | Parcial | Objetivo de encuentro, roles con habilidades y encargos de entrega repetibles desde el teléfono con recompensa en RD$, marcador azul y progreso. Faltan trabajos con turnos, misiones encadenadas y reputación. |
| 7. Ambiente y sonido | Parcial | Ciclo día/noche, amanecer, clima (sol, nublado, lluvia, niebla), lluvia y luces de farolas. Faltan sonidos ambientales, nubes, viento y árboles animados. |
| 8. Interfaz y optimización | Parcial | Minimapa circular, mapa completo, HUD con dinero/energía/reloj, teléfono, mochila, avisos, fundido, guardado y controles táctiles. Faltan menú principal, ajustes gráficos y pruebas en Android. |

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

### Casa del jugador (`src/house.js`)

- Fachada construida en un solar libre junto a la calle, con puerta, porche, ventanas con rejas,
  tinaco y plantas. La casa se coloca antes que los comercios para reservar el solar.
- Interior de 14 × 12 m con sala, comedor, cocina, dormitorio y baño separado.
- Puerta funcional: `E` entra y sale; dentro se activan solo las colisiones del interior.
- Cama: dormir avanza el reloj hasta las 6:30 y restaura la energía.
- Interruptor: enciende y apaga las luces interiores (con luz de ventana tenue de respaldo).
- Armario: cambia el color de la ropa del jugador.
- Nevera: come un producto comprado en la ciudad y recupera energía.
- Caja de almacenamiento: abre la mochila.
- El interior se atenúa respecto al exterior para que la iluminación artificial importe.
- Estado guardado: energía, color de ropa, luces y posición.

### Interfaz (`src/ui.js`)

- HUD con dinero, energía y hora.
- Teléfono (`P`): reloj, dinero, energía, contactos, mensajes y botón de encargo.
- Mochila (`I`): inventario real de las compras, con botón "Comer" para alimentos.
- Avisos flotantes y fundido al dormir.
- Minimapa circular con calles, edificios, parques, comercios (abierto/cerrado), NPC, casa, objetivo,
  encargo y brújula.
- Mapa completo con la tecla `M` (o tocando el minimapa) y cierre con `Esc` o el botón.
- El minimapa gira con la cámara y la flecha muestra la orientación real del jugador.
- Botones táctiles para mochila y teléfono.

### Encargos de entrega

- El teléfono ofrece un encargo a un comercio entre 70 y 280 m.
- El marcador azul y el minimapa indican el destino; al llegar se paga la recompensa en RD$
  y se puede pedir otro encargo.

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
| Comercios dentro de edificios (muestreo del solar) | 0 de 40. |
| Casa dentro de edificios | 0. |
| Flujo de la casa | Entrar, apagar luces, dormir (06:31, energía 100), cambiar ropa, comer sin comida, abrir mochila y salir: correcto. |
| Persistencia tras recargar | Energía, ropa, luces y posición se restauran. |
| Encargo de entrega | Aceptado desde el teléfono, entregado y pagado (+RD$ 353 / +RD$ 401 en dos pruebas). |
| FPS headless | ≈3,5 fps con SwiftShader; no representa el rendimiento de una GPU real. |

## Errores conocidos y limitaciones

- El rendimiento en Android real no está medido. El tráfico y los semáforos usan objetos ligeros,
  pero falta probarlo en un teléfono.
- Los semáforos y las paradas no tienen colisión (son mobiliario).
- Los pasajeros del transporte público aún no suben ni bajan.
- El tráfico no aparece en el minimapa.
- El interior de la casa es funcional pero sencillo; no hay animaciones de sentarse ni de cocinar.
- El encargo no se guarda al recargar (solo el dinero ganado).
- La lluvia no moja las calles ni genera charcos.
- El audio ambiental y la música siguen pendientes.

## Próxima tarea prioritaria

1. Pasajeros que suben y bajan de guaguas y carros públicos en las paradas.
2. Tráfico y semáforos visibles en el minimapa.
3. Trabajos con turno (colmado, reparto, taller) y misiones encadenadas con reputación.
4. Interiores de los comercios con clientes que entran, compran y salen.
5. Lluvia que moje calles y genere charcos; audio ambiental y radio.
6. Menú principal, ajustes gráficos y prueba real en Android.
