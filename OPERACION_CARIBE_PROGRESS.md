# Operación Caribe — Informe de progreso

Actualizado: 2026-11-22 · Rama: `mundo-abierto-trafico-minimapa` (tercer bloque)

Este documento refleja el estado **real y verificado** del proyecto, no solo lo que existe en el código.
La verificación se hizo compilando con Vite y ejecutando el juego en Chromium headless con WebGL
(SwiftShader), leyendo telemetría del propio juego. No se ha probado en un Android físico ni en una
GPU real, así que el rendimiento final sigue pendiente de validación en dispositivo.

## Estado de publicación

- Rama local: `mundo-abierto-trafico-minimapa`, con 8 commits sobre `main`.
- **No se pudo subir a GitHub**: el token de la integración devuelve
  `403 Resource not accessible by integration` al crear la rama o hacer push.
  El repositorio sigue intacto y no se ha abierto ningún Pull Request.
- Para publicar: usar una cuenta con permiso de escritura y ejecutar
  `git push origin mundo-abierto-trafico-minimapa`, después abrir un PR contra `main`.
- Se generaron 8 parches y `operacion-caribe-0.4.bundle` fuera del repositorio para transferir los commits.

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
| 3. Tráfico y transporte | Implementado | Grafo de calles, intersecciones, semáforos, carriles, separación, frenado, estacionados, paradas con pasajeros que esperan, suben y bajan, y tráfico visible en el minimapa. Verificado por telemetría. |
| 4. Viviendas y vida cotidiana | Implementado en este bloque | Casa propia con fachada en la ciudad e interior explorable: sala, comedor, cocina, dormitorio y baño. Puerta funcional, luces, cama para dormir, nevera, armario e inventario doméstico. Guardado de energía, ropa y luces. |
| 5. Negocios y economía | Implementado | 40 comercios con interior explorable, techo, luz propia, mostrador y estantes sólidos, horarios, stock, precios en RD$, empleado, clientes que entran, compran y salen, ingresos del local, compra del jugador y economía persistente. Colocación corregida: 0/40 dentro de edificios. |
| 6. Trabajos y misiones | Parcial (turnos y reputación implementados) | Objetivo de encuentro, roles, encargos de entrega, tres trabajos por turno (colmado, reparto y taller) con duración limitada, tareas interactivas, pago en RD$, reputación, progreso guardado y cancelación. Faltan misiones encadenadas, historias de personajes y eventos de barrio. |
| 7. Ambiente y sonido | Parcial | Ciclo día/noche, amanecer, clima (sol, nublado, lluvia, niebla), lluvia y luces de farolas. Faltan sonidos ambientales, nubes, viento y árboles animados. |
| 8. Interfaz y optimización | Parcial | Minimapa circular, mapa completo, HUD con dinero/energía/reloj, teléfono con trabajos y reputación, mochila, avisos, fundido, guardado, cámara interior en casa y comercios, colisiones de mobiliario y controles táctiles. Faltan menú principal, ajustes gráficos y pruebas en Android. |

## Cambios realizados (acumulado)

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

### Pasajeros del transporte público

- Cada parada tiene dos vecinos esperando en la acera.
- Cuando una guagua o carro público se detiene, un pasajero camina hasta la puerta y sube;
  otro desciende y se queda esperando en la parada.
- Los pasajeros reaparecen con el tiempo, así que las paradas no se vacían.
- Las paradas (cuadros azules) y los vehículos (puntos blancos) se dibujan en el minimapa y el mapa.

### Trabajos por turnos (`src/jobs.js`)

- Tres trabajos desde el teléfono (`P`): colmado, reparto y taller.
- Cada oferta muestra el local, la paga estimada y la distancia; si el local está cerrado,
  el botón queda deshabilitado.
- El turno tiene dos fases: viaje al lugar de trabajo (marcador naranja) y trabajo con tiempo
  limitado (marcador verde).
- Colmado: cada pocos segundos llega un cliente al mostrador; `E` lo atiende. Hay que atender 4.
- Taller: `E` repara el vehículo 4 veces, con una pequeña espera entre reparaciones.
- Reparto: 3 paquetes en comercios distintos; el marcador salta al siguiente destino tras cada entrega.
- Pago: base + tarea completada, multiplicado por la reputación (hasta ×1,5).
- Reputación 0–100 y número de trabajos completados se guardan y se muestran en el teléfono.
- El turno se puede cancelar sin pago. Un turno activo no se guarda al recargar; sí el progreso.
- El HUD de misión muestra el tiempo restante y el progreso (`2/4`).

### Encargos de entrega

- El teléfono ofrece un encargo a un comercio entre 70 y 280 m.
- El marcador azul y el minimapa indican el destino; al llegar se paga la recompensa en RD$
  y se puede pedir otro encargo.
- No se puede aceptar un encargo mientras hay un turno activo.

### Interiores de comercios y clientes

- Los 40 comercios tienen interior construido y **entrada central libre**: el jugador puede entrar
  caminando, no solo abrir el panel de compra.
- Techo, felpudo, mostrador, estanterías, neveras y vitrinas; una sola luz dinámica ilumina el
  comercio en el que está el jugador y la cámara se acerca y baja para no atravesar el techo.
- Mostrador, estantería, neveras y cristales tienen colisión; la entrada central queda libre.
- Dos clientes por comercio: aparecen en la acera, entran, esperan en el mostrador, compran un
  producto (baja el stock y sube el ingreso del local) y salen. El ciclo se repite mientras el
  comercio esté abierto y el jugador esté cerca.
- El panel de compra muestra clientes, ventas e ingresos del local, además del stock y el dinero.
- Se corrigió un error de colocación de colisiones en comercios rotados: el desplazamiento local
  del mueble no se rotaba con el local. Ahora las paredes, el mostrador y las estanterías
  quedan en su sitio.

## Pruebas realizadas

| Prueba | Resultado |
| --- | --- |
| `npm run build` | Correcto (≈1,5 s, 742 kB sin comprimir). |
| Carga en Chromium headless | Sin `pageerror` ni recursos 404. |
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
| Pasajeros de parada | 20 pasajeros esperando en 10 paradas; un autobús detenido activa subida y bajada. |
| Interfaz móvil (390×844, táctil) | Botones sin solaparse, teléfono y mochila caben en pantalla y responden. |
| Turno de colmado | 4/4 clientes atendidos, +RD$ 360, reputación 4, turno cerrado. |
| Turno de taller | 4/4 reparaciones, +RD$ 469 con reputación 4. |
| Turno de reparto | 3/3 paquetes entregados, +RD$ 473 con reputación 8. |
| Cancelar turno | Se cancela sin pago y sin dejar marcador. |
| Persistencia de trabajos | Tras recargar: 3 trabajos completados, reputación 12 y RD$ 3.802. |
| Clientes de comercio | Ciclo idle → entering → buying → leaving; 1 visita y RD$ 45 de ingreso en la prueba. |
| Interior de comercio | `insideShop` verdadero dentro y falso al salir; entrada caminando; el mostrador expulsa al jugador. |
| Teléfono con turno activo | Muestra tiempo y progreso, y permite cancelar. |
| Minimapa y mapa con turno | Marcador naranja "Trabajo" visible en ambos; el mapa completo lo etiqueta. |
| Carga final sin errores | Sin `pageerror` ni recursos 404 tras añadir el icono. |
| Estado final | 16 vehículos, 10 visibles, 22 estacionados, 20 pasajeros, 40 comercios, 121 semáforos, casa a 59 m del inicio. |
| FPS headless | ≈3,5 fps con SwiftShader; no representa el rendimiento de una GPU real. |

## Errores conocidos y limitaciones

- El rendimiento en Android real no está medido. El tráfico y los semáforos usan objetos ligeros,
  pero falta probarlo en un teléfono.
- Los semáforos y las paradas no tienen colisión (son mobiliario).
- El interior de la casa es funcional pero sencillo; no hay animaciones de sentarse ni de cocinar.
- Los pasajeros de parada son una simulación visual: no compran billete ni tienen rutas propias.
- El turno o encargo activo no se guarda al recargar (solo el dinero, la reputación y los trabajos completados).
- Los clientes de comercio son una simulación visual: no hacen cola ni hablan con el jugador.
- Los interiores comparten una base común y se diferencian por los muebles de cada categoría.
- La tarea del turno se hace desde la puerta del local, no detrás del mostrador.
- La lluvia no moja las calles ni genera charcos.
- El audio ambiental y la música siguen pendientes.

## Próxima tarea prioritaria

1. Misiones encadenadas e historias de personajes con recompensas y reputación.
2. Lluvia que moje calles y genere charcos; audio ambiental y radio.
3. Menú principal y ajustes gráficos.
4. Prueba real en Android y medición de FPS.
5. Eventos de barrio y actividades que dependan de la hora.
