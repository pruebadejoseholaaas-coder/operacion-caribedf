# Operación Caribe — Informe de progreso

Actualizado: 2026-11-22 · Rama: `mundo-abierto-trafico-minimapa` (séptimo bloque · v0.8.0)

Este documento refleja el estado **real y verificado** del proyecto, no solo lo que existe en el código.
La verificación se hizo compilando con Vite y ejecutando el juego en Chromium headless con WebGL
(SwiftShader), leyendo telemetría del propio juego. No se ha probado en un Android físico ni en una
GPU real, así que el rendimiento final sigue pendiente de validación en dispositivo.

## Estado de publicación

- Rama publicada: `mundo-abierto-trafico-minimapa`, con 15 commits sobre `main`.
- **Pull Request abierto:** https://github.com/pruebadejoseholaaas-coder/operacion-caribedf/pull/1
  (pendiente de revisión del propietario; no se ha fusionado a `main`).
- Último commit del bloque anterior: `ade6566` — publicación de la versión 0.7.0.
- Cambios de este bloque: economía de comercios, clientes NPC, transporte público integrado,
  LOD de habitantes, pruebas automáticas y CI. Commit funcional de cierre: `02b3391`.
- Se conservan los 8 parches y el bundle 0.4 de bloques anteriores. Para la entrega 0.5 se generaron
  `operacion-caribe-0.5.bundle` y 13 parches en `../operacion-caribe-entrega-0.5/`.

## Cómo se verifica

```bash
npm install
npm run build          # compilación de producción
npm run dev            # servidor local
```

En desarrollo se expone `window.__oc` (solo con `import.meta.env.DEV`) con escena, cámara,
colisiones, mundo, tráfico, comercios, NPC y jugador. Sirve para pruebas automatizadas.

## Séptimo bloque: economía, clientes, transporte y estabilización (v0.8.0)

### Implementado

- **`src/economy.js`**: preferencias de consumo, demanda por hora, posiciones de cola,
  transformación al mundo, costo de venta y selección de producto con stock.
- **Comercios**: los 40 comercios tienen cola única, stock, venta real, costo, reposición,
  ventas de ciudadanos y persistencia. El panel F muestra cola, ventas de ciudadanos y caja.
- **Clientes NPC**: los habitantes entran al comercio, esperan su turno, compran un producto,
  reciben animación de compra y salen. No se usan visitantes decorativos para afirmar que hay IA.
- **Transporte**: paradas con línea y próxima guagua; NPC esperan, abordan y vuelven a su rutina.
  El jugador puede pulsar E en una parada y avanzar a la siguiente parada con fundido.
- **Optimización**: actualización LOD de NPC por distancia, ocultado de NPC lejanos,
  actualización de tráfico por distancia y visibilidad de interiores.
- **Clima**: los NPC en ocio buscan refugio cuando llueve.
- **Pruebas**: `tests/economy.test.mjs`, `tests/static.test.mjs`, script `npm test` y
  `.github/workflows/pr-checks.yml` (build + tests en PR).

### Error crítico encontrado y corregido

`shopRecord()` comprobaba la clave del comercio sin el prefijo `shop-`, pero guardaba con
prefijo. Cada llamada creaba un registro nuevo y reiniciaba `actualStaff`; varios comercios
mostraban 0 o 1 empleado aunque tuvieran varios NPC dentro. Se corrigió la clave. También se
separó la salida de clientes de la de empleados para no restar personal por error.

### Verificación de este bloque

- `npm run build`: correcto. Bundle principal 807.34 kB (gzip 230.18 kB).
- `npm test`: 9/9 pruebas correctas (incluye simulación de NPC que compra y de NPC que aborda una guagua).
- Simulación de 3 horas en Chromium headless:
  - 109 ventas atribuidas a ciudadanos,
  - 7 comercios con ventas de ciudadanos,
  - 0 rutas inseguras y 0 NPC bloqueados,
  - clientes terminan su compra y salen.
- Persistencia: stock, costo, ganancia, ventas de ciudadanos y empleados se conservan tras recargar.
- Transporte: se observaron estados `toStop` y `ridingBus`; los NPC vuelven a su rutina.
- Guagua del jugador: E en parada mueve al jugador a la parada siguiente y muestra la línea.
- Móvil 390×844: interiores y entrada/salida sin errores de página.
- Regresión: menú, misiones, trabajos, casa, clima, audio, minimapa e interiores sin errores
  de consola en las pruebas ejecutadas.
- GitHub Actions: workflow `PR checks` ejecutado sobre la rama; build y `npm test` en verde
  (run 45303442454).

### Límites que no se ocultan

- No se probó en un Android físico ni en una GPU real. La verificación es headless/SwiftShader.
- Los vehículos no esquivan físicamente a los peatones; solo frenan entre vehículos y respetan luces.
- El viaje del jugador en guagua es una transición a la parada siguiente, no una simulación de asiento.
- Los habitantes de la zona residencial alejada no tienen comercios a menos de 150 m; por eso
  compran sobre todo los trabajadores después del turno.
- No todos los edificios tienen interior; están cubiertos viviendas NPC, hospital, escuela y comercios.

### Correcciones de la etapa 1 (v0.9.0 en desarrollo)
- Se eliminó el parámetro `preference` sin uso de `productIndexFor()`.
- Se añadió una guarda para que un NPC en ocio vuelva a su turno cuando llega la hora.
- Se añadieron pruebas reproducibles de simulación de NPC, compra, cola y transporte.
- `AUDITORIA_OPERACION_CARIBE.md` quedó como redirección histórica; la fuente vigente es `AUDITORIA.md`.

### Próxima tarea exacta

Probar el APK en un Android físico y medir FPS/memoria; después, añadir una parada o comercio
en la zona residencial para que esos habitantes también compren antes del trabajo.

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

## Quinto bloque: Fase 2, habitantes autónomos

### Implementación real

- Nuevo módulo `src/citizens.js`, integrado en `src/main.js` sin eliminar el sistema de NPC existente.
- **Vivienda asignada**: cada NPC recibe una puerta de edificio cercana a la ciudad. Se elige una
  fachada orientada a la calle y se comprueba que la puerta quede fuera de todos los edificios.
- **Trabajo asignado**: cada oficio se mapea a comercios compatibles (colmado, panadería, taller,
  barbería, etc.). El destino es la puerta del comercio.
- **Rutas por aceras**: A* sobre el grafo de calles existente de 579 nodos. Cada arista se desplaza
  hacia la acera derecha. Si una acera está bloqueada por un edificio, se usa el eje de la vía como
  respaldo seguro. Se comprueban puntos y segmentos contra todos los polígonos de edificios.
- **Máquina de estados**: `sleeping`, `preparing`, `home`, `toWork`, `waiting`, `working`, `break`,
  `leisure`, `leisureIdle` y `toHome`. Cada NPC tiene horario propio (`shiftStart`, `shiftEnd`,
  `sleepStart`, `sleepEnd`) y descanso de mediodía entre 12:00 y 13:00.
- **Movimiento sin teletransporte**: el NPC avanza punto a punto con velocidad limitada. En la
  simulación de prueba, el paso máximo fue 0.55 m con `dt=0.5`; no hay saltos de posición.
- **Persistencia**: `saveGame()` guarda `npcRoutines` con estado, ruta, índice, posición, vivienda y
  trabajo. Al recargar se restauran las 22 rutinas y las rutas continúan.
- **Integración conservada**: se mantienen nombres, personalidad, confianza, memoria, saludos,
  conversaciones contextuales y el bucle de interacción social existente.

### Pruebas funcionales

| Prueba | Resultado real |
| --- | --- |
| Estado a las 08:00 | 14 trabajando, 3 esperando, 4 en casa, 1 yendo al trabajo; 0 rutas dentro de edificios. |
| Estado a las 12:20 | 17 en descanso y 5 aún llegando; 0 rutas inseguras. |
| Estado a las 16:06 | 8 trabajando, 10 en casa y 4 en actividad libre; 0 rutas inseguras. |
| Estado a las 23:06 | 22 durmiendo, 0 visibles; 0 rutas inseguras. |
| Llegada física | 18 trabajadores a menos de 3.2 m de su trabajo; 4 NPC en casa a menos de 3.2 m; 0 fuera de destino. |
| Persistencia | 22 rutinas guardadas; estados y 209 puntos de ruta restaurados; 0 rutas inseguras. |
| Conversación | `Luis (dependiente): «¡Buenas! ¿Cómo tú estás?» · Te reconoce · Confianza 1/5`. |
| Regresión | `final2`: 16 vehículos, 22 estacionados, 40 comercios, 121 cruces, 10 paradas, 20 pasajeros, sin errores. |
| Misión y menú | La misión de Doña Rosa y el menú/ajustes siguen funcionando sin errores. |

### Limitaciones de esta entrega

- La vivienda asignada es una **puerta de edificio**, no un interior explorable. El NPC desaparece
  al entrar a dormir; todavía no hay casas de NPC con sala, cama y objetos.
- El trabajo se realiza en la **puerta del comercio**, no detrás del mostrador. No hay estación de
  trabajo interior individual.
- Caminar y trabajar tienen animación; faltan sentarse, comprar y conversaciones encadenadas.
- Cuando una acera está bloqueada por geometría, la ruta usa el eje de la vía como respaldo. Nunca
  atraviesa edificios, pero en esos tramos no es estrictamente una acera.
- Los NPC son globales y no se descargan por sector. La persistencia se verificó al recargar la
  partida, no con un sistema de streaming de NPC por sector.

## Sexto bloque: interiores funcionales y vida cotidiana (v0.7.0)

### Implementación real

- Nuevo módulo `src/interiors.js`, integrado en `src/main.js` sin sustituir `src/citizens.js`
  ni eliminar las rutinas, rutas A*, horarios, persistencia, relaciones o conversaciones existentes.
- **22 viviendas de NPC** con sala, comedor, cocina, dormitorio, baño, plantas, televisor,
  nevera, cama, armario y colisiones de muebles. Cada casa tiene paleta y cartel con el nombre
  del habitante. Las casas se construyen en una zona apartada del mapa para no ocupar solares.
- **Hospital Municipal** con recepción, sala de espera, pasillo y dos consultorios; **Escuela
  Pública** con dos aulas, pizarras, pupitres, dirección y patio. Ambos tienen interior
  explorable y personal asignado.
- **Puestos de trabajo dentro de los 40 comercios existentes**: mostrador, cocina, barbería,
  taller, almacén y caja. El empleado real entra por la puerta, camina hasta su estación y
  permanece allí durante su turno. El trabajador decorativo anterior se oculta cuando hay un
  NPC real trabajando.
- **Ciclo completo**: sale de la vivienda, recorre la ciudad, entra al edificio, realiza su tarea,
  atiende clientes, descansa, sale al terminar la jornada, regresa a casa y duerme.
- **Animaciones conectadas al estado**: caminar, entrar, sentarse, comer, trabajar, atender
  clientes y dormir acostado. Las poses cambian la posición y las extremidades del modelo.
- **Visibilidad coherente**: las viviendas e instituciones solo se muestran cuando el jugador
  está dentro; los empleados de comercio son visibles desde la calle. Los grupos inactivos se
  ocultan para reducir el coste de render.
- **Acceso del jugador**: `E` cerca de una puerta de vivienda, hospital o escuela entra; `E` en
  la puerta interior sale. La posición y el interior se guardan y restauran.
- **Colisiones**: paredes exteriores, particiones y muebles principales de casas e instituciones.
  Las rutas interiores se validan contra esos colliders.
- **Economía integrada**: `shop.actualStaff` indica empleados reales; el cliente que compra
  dispara la animación de atención del cajero. El personal se reconstruye al recargar.
- **Persistencia**: se guardan y restauran `inside`, `insideKind`, `insideTarget`, `stationKey`,
  `task`, `action`, `serveT` y la posición interior de cada NPC.
- Corrección adicional: `shiftSummary()` expone `x`/`z` para que el HUD y las pruebas no
  produzcan distancias `NaN` al usar el resumen del turno.

### Pruebas funcionales del sexto bloque

Todas con Vite y Chromium headless/SwiftShader. La prueba visual se hizo con capturas de la
casa, el hospital y la escuela; no sustituye una prueba en Android físico.

| Prueba | Resultado real |
| --- | --- |
| Compilación | `npm run build` correcto en ≈1,5 s; sin `pageerror`. |
| Viviendas e instituciones | 22 casas, `inst-hospital` e `inst-school` creados. |
| Día completo 06:00→23:00 | 08:00: 14 trabajando y 8 en casa; 14:00: 17 trabajando y 5 libres; 19:00: 18 en casa y 4 libres; 23:00: 22 durmiendo dentro de su vivienda. |
| Rutas exteriores | 0 rutas dentro de edificios en todos los muestreos. |
| Rutas y posiciones interiores | 0 NPC dentro de muebles/paredes y 0 puntos de ruta bloqueados. |
| Luis (colmado) | 08:00 cajero dentro del colmado; 14:00 fuera en actividad libre; 19:00 sentado en casa; 23:00 acostado durmiendo. |
| María (escuela) | Maestra dentro de la escuela, en su estación, con acción `work`. |
| Carla (hospital) | Enfermera dentro del hospital, en su estación, con acción `work`. |
| Visibilidad | NPC de casa visible al entrar el jugador (`y=0.52`, `rotation.x=-1.57`, acción `sleep`); invisible al salir. Personal de escuela visible dentro. |
| Acceso del jugador | Entrada y salida correctas en casa, hospital y escuela; el minimapa se oculta dentro. |
| Persistencia de NPC | 22 rutinas con `inside`, tarea y acción restauradas; 22 durmiendo dentro de casa tras recargar. |
| Persistencia de trabajo | 17 NPC dentro del trabajo antes y después de recargar; 7 comercios con personal real restaurados. |
| Persistencia del jugador | Recargar dentro de una vivienda restaura `home-0` y la posición interior. |
| Empleado decorativo | Oculto en los comercios con `actualStaff > 0` tras el primer frame. |
| Atención al cliente | Al aumentar `shop.visits`, el cajero cambia a acción `serve` durante 2,2 s. |
| Animaciones | Trabajo de pie, comer sentado (`y=0.30`, piernas `-1.25`), sentarse en casa y dormir acostado. |
| Regresión | `final2`, misión, ambientes, casa, cancha, conversación, stock y menú/ajustes sin errores. |

### Limitaciones reales de este bloque

- No hay puertas animadas de apertura/cierre; los accesos son huecos funcionales.
- Los clientes de comercio siguen siendo visitantes simulados; no hacen cola ni hablan con el
  jugador. La atención se representa con la animación del cajero y el ciclo de visitas existente.
- No todos los interiores se han revisado visualmente uno por uno; se verificaron casa, hospital,
  escuela y los comercios con personal.
- No se ha probado en Android físico ni se ha medido FPS en GPU real.
- No hay streaming/descarga de NPC por sector; los 22 NPC y sus interiores se mantienen en memoria,
  aunque los grupos inactivos se ocultan.
- El jugador puede entrar a las viviendas de los NPC, pero no hay interacción doméstica propia
  dentro de ellas (solo la casa del jugador tiene cama, nevera y armario funcionales).

## Estado por fase


| Fase | Estado | Verificado |
| --- | --- | --- |
| 1. Mundo y ciudad | Parcial alto | Calles, aceras, contenes, cruces, pasos de cebra, edificios OSM con fachadas, parques, cancha, agua, árboles, farolas, bancos, papeleras y postes; interiores de hospital y escuela. Faltan más variedad de alturas, cableado y mobiliario de calle. |
| 2. Habitantes e IA | Implementado (núcleo) | 22 NPC con identidad, personalidad, vivienda y trabajo asignados, horarios, rutas A* sin atravesar edificios, ciclo casa-trabajo-casa, interiores de vivienda, hospital y escuela, puestos dentro de comercios, animaciones de caminar/entrar/sentarse/comer/trabajar/atender/dormir, saludos, confianza, memoria y persistencia. Faltan colas de clientes y diálogos encadenados. |
| 3. Tráfico y transporte | Implementado | Grafo, intersecciones, semáforos, carriles, separación, frenado, estacionados, paradas con pasajeros que suben y bajan, faros nocturnos, colisión dinámica y minimapa. Faltan estacionamientos dedicados y servicio de taxi/público. |
| 4. Viviendas y vida cotidiana | Parcial alto | Casa del jugador completa; 22 casas de NPC explorables con muebles, colisiones y rutinas de dormir/comer/sentarse. Faltan almacenamiento doméstico separado y puertas animadas. |
| 5. Negocios y economía | Implementado | 40 comercios con interior, horarios, stock, precios en RD$, empleados reales en puestos interiores, clientes, caja, reposición, demanda por hora, ingresos y persistencia. El empleado decorativo se sustituye por el NPC autónomo. |
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
- **Fase 2**: el núcleo de rutinas casa-trabajo está implementado y probado. Quedan interiores de
  viviendas de NPC, trabajo interior detrás del mostrador y conversaciones encadenadas.
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

1. **Fase 2 pulida**: colas de clientes, conversaciones encadenadas y más tareas por oficio.
2. **Fase 5**: revisar los 40 comercios uno por uno, añadir productos y tareas específicas.
3. **Fase 3**: estacionamientos dedicados y servicio de taxi/público con pasajeros.
4. **Fase 6**: más misiones, historias y eventos de barrio.
5. **Fase 8**: APK Android con Capacitor, LOD/texturas y prueba en dispositivo real.
6. **Publicación**: sigue bloqueada por `403`; requiere un token con permiso de escritura.
