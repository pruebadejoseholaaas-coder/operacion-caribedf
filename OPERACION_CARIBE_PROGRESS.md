# Operación Caribe — Informe de progreso

Actualizado: 2026-11-22 · Rama: `mundo-abierto-trafico-minimapa` (cuarto bloque)

Este documento refleja el estado **real y verificado** del proyecto, no solo lo que existe en el código.
La verificación se hizo compilando con Vite y ejecutando el juego en Chromium headless con WebGL
(SwiftShader), leyendo telemetría del propio juego. No se ha probado en un Android físico ni en una
GPU real, así que el rendimiento final sigue pendiente de validación en dispositivo.

## Estado de publicación

- Rama local: `mundo-abierto-trafico-minimapa`, con 12 commits sobre `main` (incluye este informe).
- **No se pudo subir a GitHub**: el token de la integración devuelve
  `403 Resource not accessible by integration` al crear la rama o hacer push.
  El repositorio sigue intacto y no se ha abierto ningún Pull Request.
- Para publicar: usar una cuenta con permiso de escritura y ejecutar
  `git push origin mundo-abierto-trafico-minimapa`, después abrir un PR contra `main`.
- Se conservan los 8 parches y el bundle 0.4 de bloques anteriores. El código actual está en la rama local; no se generó un bundle 0.5 nuevo.

## Cómo se verifica

```bash
npm install
npm run build          # compilación de producción
npm run dev            # servidor local
```

En desarrollo se expone `window.__oc` (solo con `import.meta.env.DEV`) con escena, cámara,
colisiones, mundo, tráfico, comercios, NPC y jugador. Sirve para pruebas automatizadas.

## Cuarto bloque: correcciones críticas y sistemas nuevos

### Correcciones críticas verificadas

- **Guardado de la casa**: al recargar dentro de la vivienda se restaura el interior y, al salir,
  el jugador aparece en la calle junto a la puerta (no en las coordenadas interiores 1000,1000).
- **Stock de comercios**: se guardan stock, ventas, visitas e ingresos de los 40 locales. Antes de
  esta corrección, comprar arroz y recargar devolvía el stock a 12.
- **Detección de interiores**: se corrigió la rotación de la transformación local/mundo. Las 9
  posiciones de prueba dentro del comercio (centro, esquinas y bordes) devuelven `inside=true`.
- **Botón táctil E**: ahora ejecuta la interacción contextual (entrar a casa, usar la moto, trabajar)
  en vez de limitarse a subir a la moto.
- **Pasajeros del autobús**: el pasajero que baja es distinto del que sube; se añadió un tercer
  pasajero oculto por parada que aparece al llegar el autobús.
- **Colisiones dinámicas**: el jugador es empujado fuera de vehículos en movimiento y de NPC.
- **Turnos y encargos**: se guardan y restauran el turno activo, la fase, el tiempo restante,
  los clientes servidos y los objetivos de reparto.

### Fase 7: ambiente y audio

- Farolas encendidas de noche con hasta 8 luces puntuales cerca del jugador (4 en móvil).
- Ventanas iluminadas en fachadas cercanas; se activan/desactivan con el ciclo día/noche.
- Charcos en calles cercanas cuando llueve, nubes dinámicas y viento en las copas de los árboles.
- Audio procedural sin archivos externos: viento, lluvia, ciudad, motor de la moto, campana de
  comercio y radio. Tres emisoras ficticias desde el teléfono y botón de sonido funcional.
- Límites de ambientes en móvil para no disparar el coste de luces y partículas.

### Fase 8: menú, ajustes y guardado

- Menú principal con Continuar, Nueva partida, Ajustes y Créditos.
- Ajustes persistentes: calidad gráfica (baja/media/alta), sombras, volumen, voces y FPS.
- Guardar, cargar y borrar partida desde Ajustes; el menú se abre con Esc.
- Créditos con Three.js (MIT) y OpenStreetMap (ODbL).
- Nueva partida borra partida, economía y misión, y vuelve a la selección de rol.
- El botón de sonido y el menú comparten el estado de audio; el FPS se muestra solo si se activa.

### Fase 5: reposición y actividad variable

- Cada comercio repone una unidad de stock cada 50–95 s hasta volver a 12.
- La frecuencia de clientes cambia según la hora (mañana, mediodía, tarde y noche).
- Caja registradora visible en el mostrador; pulsa al comprar el jugador o un cliente.
- El stock y los ingresos siguen persistiendo entre sesiones.

### Fase 6: misión encadenada y actividad deportiva

- **El recado de Doña Rosa**: comprar 2 arroz y 1 aceite, entregarlos en Empanadas Doña Rosa y
  cocinar la comida en casa. Recompensa RD$ 650 y +8 de reputación. Estado persistente, marcador
  dorado en el mundo y en el minimapa, y texto en el teléfono.
- Cancha de baloncesto en un parque cercano; al pulsar E cerca de la cancha se lanza un tiro con
  probabilidad de canasta. Acierto: +4 energía y +1 reputación.

### Fase 4: cocina

- Acción «Cocinar comida casera» junto a la cocina. Consume un alimento del inventario y recupera
  45% de energía; si no hay comida, avisa y no gasta nada.

### Fase 3 y Fase 1: mejoras de ciudad

- Faros delanteros visibles solo de noche en los 16 vehículos activos.
- Pasos de cebra en los cruces con semáforo cercanos al jugador.
- Cancha y mobiliario urbano adicional en parques.

## Pruebas del cuarto bloque

Todas se ejecutaron con Vite y Chromium headless con WebGL (SwiftShader). No sustituyen una prueba
en Android físico ni en GPU real.

| Prueba | Resultado |
| --- | --- |
| Guardado dentro de casa y salida | `inside=true` tras recargar; al salir, posición (-57,-11) junto a la casa (-58.2,-18.3). |
| Stock tras comprar y recargar | stock `[11,12,12,12]` y efectivo RD$ 2,465 se mantienen. |
| Esquinas de comercio | 9/9 posiciones `inside=true`. |
| Botón táctil E | entra a la casa (`inside=true`) desde móvil. |
| Turno activo tras recargar | fase `work`, tiempo 1:47, objetivo 0/4 y marcador restaurados. |
| Pasajeros | estados simultáneos `boarding`, `wait`, `alighting`; el que baja es distinto del que sube. |
| Noche | 6 farolas activas, 36 ventanas iluminadas, 12 nubes, viento >0. |
| Lluvia | 28 charcos visibles y lluvia activa. |
| Faros | 16/16 vehículos con faros de noche; 0 de día. |
| Misión Doña Rosa | 0→1 al comprar, 1→2 al entregar, 2→3 al cocinar; +RD$ 650 y reputación 8. |
| Baloncesto | tiro válido con aviso «¡Canasta! +4 energía · +1 reputación». |
| Menú y ajustes | menú visible, roles ocultos, Continuar deshabilitado sin partida; calidad alta con DPR 2; volumen 0.20; créditos con OpenStreetMap. |
| Regresión principal | 16 vehículos, 22 estacionados, 40 comercios, 121 cruces, 10 paradas, 20 pasajeros; sin errores de página. |

## Estado por fase


| Fase | Estado | Verificado |
| --- | --- | --- |
| 1. Mundo y ciudad | Parcial | Calles, aceras, contenes, cruces, pasos de cebra, edificios OSM con fachadas, parques, cancha, agua, árboles, farolas, bancos, papeleras y postes. Faltan interiores de hospital/escuela, más variedad de alturas y mobiliario de calle. |
| 2. Habitantes e IA | Parcial | 22 NPC con nombre, oficio, personalidad, horario, ruta por aceras, saludos, confianza y memoria guardada. **Pendiente principal:** rutas casa-trabajo, conversaciones encadenadas y animaciones de sentarse/comprar. |
| 3. Tráfico y transporte | Implementado | Grafo, intersecciones, semáforos, carriles, separación, frenado, estacionados, paradas con pasajeros que suben y bajan, faros nocturnos, colisión dinámica y minimapa. Faltan estacionamientos dedicados y servicio de taxi/público. |
| 4. Viviendas y vida cotidiana | Parcial alto | Casa con interior, puerta, luces, cama, nevera, armario, inventario, guardado y cocina. Faltan almacenamiento doméstico separado y casas de NPC con acceso. |
| 5. Negocios y economía | Implementado | 40 comercios con interior, horarios, stock, precios en RD$, empleado, clientes, caja registradora, reposición automática, demanda por hora, ingresos y persistencia. Colocación: 0/40 dentro de edificios. |
| 6. Trabajos y misiones | Parcial alto | Turnos, encargos, reputación y misión encadenada «El recado de Doña Rosa»; cancha con tiro de baloncesto. Faltan más historias, eventos de barrio y actividades que dependan de hora/lugar. |
| 7. Ambiente y sonido | Parcial alto | Ciclo día/noche, clima, farolas, ventanas iluminadas, lluvia, charcos, nubes, viento en árboles, audio procedural, motor, campana y radio. Faltan sonidos de multitud y música original. |
| 8. Interfaz y optimización | Parcial alto | Menú principal, ajustes gráficos persistentes, volumen, voces, FPS, guardar/cargar/borrar, minimapa, mapa, teléfono, mochila, controles táctiles y adaptación móvil. Faltan APK Android, LOD/texturas y pruebas en dispositivo real. |

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
  pero falta probarlo en un teléfono y medir FPS con calor/consumo.
- **Fase 2**: los NPC caminan por aceras, pero todavía no tienen rutas casa-trabajo ni
  conversaciones encadenadas. Es el mayor hueco funcional.
- **Fase 1**: hospital y escuela son fachadas; no tienen interior explorable. La variedad de
  alturas y el cableado urbano todavía es limitada.
- **Fase 3**: no hay estacionamientos dedicados ni servicio de taxi/público con pasajeros.
- **Fase 4**: no hay cofre de almacenamiento separado del inventario general ni casas de NPC
  explorables. La cocina tiene acción, pero no animación de cocinar.
- **Fase 5**: los clientes son una simulación visual; no hacen cola ni hablan con el jugador.
- **Fase 6**: hay una misión encadenada y baloncesto; faltan más historias, eventos de barrio y
  actividades que cambien según hora y lugar.
- **Fase 7**: el audio es procedural; faltan sonidos de multitud y música original.
- **Fase 8**: no hay APK Android, LOD/texturas optimizadas ni suite de pruebas de regresión
  permanente. Las pruebas actuales son scripts locales de Puppeteer.
- La publicación en GitHub sigue bloqueada por `403`; requiere un token con permiso de escritura.

## Próxima tarea prioritaria

1. **Fase 2 (habitantes)**: rutas casa-trabajo sobre la red de aceras, conversaciones encadenadas y
   animaciones de sentarse/comprar. Es el mayor hueco funcional que queda.
2. **Fase 1**: interiores de hospital y escuela, más variedad de alturas y cableado/mobiliario.
3. **Fase 3**: estacionamientos dedicados y servicio de taxi/público.
4. **Fase 8**: APK Android con Capacitor, LOD/texturas y prueba en dispositivo real.
5. **Publicación**: sigue bloqueada por `403`; requiere un token con permiso de escritura.
