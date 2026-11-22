# Auditoría de Operación Caribe

**Fecha:** 2026-11-22
**Repositorio:** `pruebadejoseholaaas-coder/operacion-caribedf`
**Rama auditada:** `mundo-abierto-trafico-minimapa`
**Commit local auditado:** `32071787babce6a7fd915100ba1471c9d44513d5`
**Base remota:** `main` = `3e488eb9852945a0a2d8e4133a634ba7ba7287aa`

> **Alcance y método:** esta auditoría se hizo leyendo el código real, el historial de Git, el árbol de la rama `main`, los parches, el bundle y la API de GitHub. También se ejecutaron pruebas de navegador contra el servidor de desarrollo. **No se modificó, eliminó, reorganizó, confirmó ni publicó ningún archivo del juego.** El único archivo creado es este informe.

---

## 1. Resumen ejecutivo

- Hay **8 commits locales** sobre `main`, todos en la rama `mundo-abierto-trafico-minimapa`.
- El árbol de trabajo está **limpio**: no hay cambios sin confirmar en el código.
- **Ninguno de los 8 commits está publicado en GitHub.** El remoto solo tiene `main` en `3e488eb`, que es la versión base 0.1.
- **No existe Pull Request** en el repositorio.
- La web publicada de GitHub Pages sigue mostrando **“prototipo 0.1”**.
- El error de publicación es real: la integración devuelve `403 Resource not accessible by integration` al crear ramas o hacer push. El usuario tiene permisos de administración, pero el token de la integración no tiene escritura.
- Se crearon **8 parches** y un **bundle** fuera del repositorio. Ambos reconstruyen exactamente el árbol de la rama (verificado).
- Se añadieron **5 archivos nuevos** (`src/traffic.js`, `src/minimap.js`, `src/house.js`, `src/ui.js`, `src/jobs.js`) y se modificaron **9 archivos**. No se eliminó ningún archivo.
- La rama acumula **2.195 inserciones y 138 eliminaciones** en 14 archivos.
- El trabajo nuevo más importante es: tráfico con grafo/intersecciones/semáforos, minimapa, casa con interior, teléfono/inventario, trabajos por turnos, reputación, clientes de comercio y correcciones de colocación/colisiones.
- Sin embargo, la auditoría encontró **varios fallos reales** que el informe de progreso no refleja:
  1. **Guardar y recargar dentro de la casa deja al jugador atrapado** en las coordenadas del interior (1000, 1000) con el interior oculto.
  2. **El botón táctil `bE` no ejecuta la interacción contextual**: solo sube/baja del motoconcho. En móvil no se puede entrar a la casa, dormir, usar la nevera ni empezar un turno.
  3. **El stock de los comercios se reinicia a 12 al recargar**, mientras el dinero y el inventario del jugador sí se guardan. Es una fuente infinita de productos.
  4. **Los pasajeros del transporte público no intercambian de verdad**: el mismo pasajero que sube es el que baja en la misma parada. No hay destinos ni tarifas.
  5. **La detección de “dentro del comercio” falla en las esquinas** por una rotación invertida; la luz y el ajuste de cámara se desactivan en parte del interior.
  6. **Los vehículos en movimiento y los NPC no tienen colisión** con el jugador. Solo los vehículos estacionados, edificios, casa y mobiliario de comercios tienen colisión.
  7. **No hay farolas encendidas, ventanas iluminadas, charcos, nubes, viento, audio ambiental, música ni radio con audio.**
  8. **No hay menú principal, ajustes gráficos ni APK/Android.**
- La documentación de progreso **sobreestima** las fases 3, 4 y 5 al marcarlas como “Implementado”: el núcleo funciona, pero faltan varios subpuntos del plan maestro.

---

## 2. Estado del repositorio y de la publicación

### 2.1 Rama y commits

| Elemento | Valor |
| --- | --- |
| Rama actual | `mundo-abierto-trafico-minimapa` |
| Commit actual | `3207178` |
| Commits sobre `main` | **8** |
| `main` local | `3e488eb` |
| `main` remoto | `3e488eb` |
| Rama remota de trabajo | **No existe** |
| Pull Requests | **Ninguno** |
| Árbol de trabajo | **Limpio** |
| Archivos sin seguimiento relevantes | Solo `.agent_tmp/` (ignorado) y este informe |

### 2.2 Commits locales

| # | Commit | Tema |
| --- | --- | --- |
| 1 | `d38d713` | Tráfico real, minimapa y colocación correcta de comercios |
| 2 | `398e5de` | Casa del jugador, teléfono, inventario y encargos |
| 3 | `be91d5b` | Pasajeros en las paradas de transporte público |
| 4 | `e4da0c6` | Icono, versión 0.3.0 y eliminación del 404 del favicon |
| 5 | `b891cf0` | Documentación del estado de publicación y del 403 |
| 6 | `06f70ac` | Trabajos por turnos con pago en RD$ y reputación |
| 7 | `824a62f` | Interiores de comercios con clientes que entran, compran y salen |
| 8 | `3207178` | Documentación final y versión 0.4.0 |

### 2.3 Qué está publicado en GitHub

| Comprobación | Resultado |
| --- | --- |
| `git ls-remote --heads origin` | Solo `refs/heads/main` en `3e488eb` |
| API de ramas | Solo `main` |
| API de Pull Requests | Lista vacía |
| GitHub Pages | `https://pruebadejoseholaaas-coder.github.io/operacion-caribedf/` |
| Versión de la web publicada | **“prototipo 0.1”** |
| Último workflow de Pages | Éxito sobre `3e488eb` |

**Conclusión:** el trabajo local 0.4 **no está publicado**. La web pública sigue siendo la versión base. El `403` impide crear la rama remota y el PR desde la integración actual.

---

## 3. Archivos creados, modificados y eliminados

### 3.1 Resumen

| Tipo | Cantidad |
| --- | --- |
| Archivos añadidos | 5 |
| Archivos modificados | 9 |
| Archivos eliminados | **0** |
| Archivos totales del proyecto | 19 rastreados por Git |

### 3.2 Detalle

| Archivo | Estado | Líneas actuales | Cambio real |
| --- | --- | ---: | --- |
| `src/traffic.js` | **Añadido** | 514 | Sistema nuevo de tráfico: grafo, intersecciones, semáforos, carriles, separación, estacionados, paradas y pasajeros. Reemplaza el tráfico simple que estaba dentro de `main.js`. |
| `src/minimap.js` | **Añadido** | 235 | Minimapa circular y mapa completo con calles, edificios, parques, comercios, NPC, casa, objetivo, encargos, turnos, paradas y vehículos. |
| `src/house.js` | **Añadido** | 306 | Casa exterior e interior explorable: sala, comedor, cocina, dormitorio, baño, puerta, luces, cama, nevera, armario, almacenamiento, colisiones y guardado de luces. |
| `src/ui.js` | **Añadido** | 161 | HUD de dinero/energía/reloj, mochila, teléfono, avisos, fundido y botones de trabajos. |
| `src/jobs.js` | **Añadido** | 339 | Encargos de entrega, tres turnos (colmado, reparto, taller), temporizador, pago, reputación, marcadores y resumen para el teléfono. |
| `src/main.js` | Modificado | 522 | Integración de tráfico, minimapa, casa, UI y trabajos; cámara con colisión; interacción contextual; guardado ampliado; eliminación del tráfico inline antiguo. |
| `src/businesses.js` | Modificado | 817 | Colocación en solares libres, casa como zona evitada, techo, luz interior, clientes que entran/compran/salen, ingresos, colisiones de mobiliario y corrección de colisiones en locales rotados. |
| `src/world.js` | Modificado | 433 | Expone huellas de edificios, recoloca aparición, moto y objetivo fuera de edificios. El resto de la generación OSM ya existía. |
| `src/style.css` | Modificado | 87 | Estilos de minimapa, mapa completo, mochila, teléfono, estadísticas, avisos, fundido y botones móviles. |
| `index.html` | Modificado | 38 | Añade minimapa, mapa, mochila, teléfono, estadísticas, avisos, fundido, botones `I`/`P`, favicon y textos de control. |
| `package.json` | Modificado | 12 | Versión `0.1.0 → 0.4.0`; servidor de desarrollo en el puerto 12000. Sin dependencias nuevas. |
| `.gitignore` | Modificado | 14 | Añade `.agent_tmp/`. `dist/` ya estaba ignorado. |
| `README.md` | Modificado | 66 | Estado 0.4, controles, estructura y checklist actualizada. |
| `OPERACION_CARIBE_PROGRESS.md` | **Añadido** | 192 | Informe de progreso acumulado. |

### 3.3 Archivos importantes que **no** se tocaron

- `public/world/world.json` (mapa OSM).
- `public/mundo.html`.
- `vite.config.js`.
- `.github/workflows/deploy.yml`.
- `CREDITS.md`.
- `public/world/.gitkeep`.

### 3.4 Cambios por commit (estadística)

| Commit | Archivos principales | Inserción/borrado |
| --- | --- | --- |
| `d38d713` | `traffic.js` (nuevo), `minimap.js` (nuevo), `main.js`, `businesses.js`, `world.js`, docs | +914 / −115 |
| `398e5de` | `house.js` (nuevo), `ui.js` (nuevo), `main.js`, `businesses.js`, `minimap.js`, `index.html`, `style.css`, docs | +701 / −42 |
| `be91d5b` | `traffic.js`, `minimap.js`, `main.js`, docs | +118 / −14 |
| `e4da0c6` | `index.html`, `package.json` | +3 / −2 |
| `b891cf0` | `OPERACION_CARIBE_PROGRESS.md` | +12 / 0 |
| `06f70ac` | `jobs.js` (nuevo), `main.js`, `ui.js`, `minimap.js`, `style.css` | +429 / −51 |
| `824a62f` | `businesses.js` | +69 / −10 |
| `3207178` | docs, `README`, `index.html`, `package.json` | +65 / −20 |

---

## 4. Qué existía antes y qué es nuevo

### 4.1 Estado base (`main` = 3e488eb)

La versión base **no era un proyecto vacío**. Ya tenía:

| Sistema base | Qué existía realmente |
| --- | --- |
| Mundo | Carga de OpenStreetMap, calles, aceras, contenes, marcas, edificios con fachadas y alturas, árboles, palmeras, parques, farolas, postes, papeleras, bancos y carga por sectores. |
| Comercios | 40 comercios definidos en `CATALOG`, con interiores, empleado, un cliente que se movía en bucle, stock, precios, horarios, compra y economía persistente. Los 40 locales usaban coordenadas fijas en `SITES`. |
| Habitantes | 22 NPC (12 en móvil) con nombre, oficio, personalidad, horario, ruta por acera, pausas, saludos, conversaciones y confianza. |
| Tráfico | Un catálogo de **50 vehículos** y un bucle simple: los vehículos recorrían segmentos rectos, frenaban al azar, cambiaban de modelo en el sitio y se teletransportaban al final del segmento. Sin grafo, sin intersecciones y sin semáforos. |
| Roles | Cuatro roles con habilidad `Q`: Programador, Conductor, Planificador e Infiltrado. |
| Clima | Ciclo de sol/nublado/lluvia/niebla, cielo, sol, niebla y partículas de lluvia. |
| Jugador | Movimiento, cámara, colisiones, motoconcho, misión de encuentro, guardado básico. |
| Interfaz | HUD de misión, panel de comercio, selección de rol, botón de voces y joystick/botones móviles. |

### 4.2 Qué es nuevo de esta rama

| Sistema nuevo | Archivo | Comentario |
| --- | --- | --- |
| Tráfico real | `src/traffic.js` | **Archivo nuevo**, pero el tráfico simple ya existía inline. No es “desde cero” en el sentido del catálogo y la idea, sí en el sistema de circulación. |
| Minimapa y mapa completo | `src/minimap.js` | **Nuevo de verdad**. No existía. |
| Casa del jugador | `src/house.js` | **Nuevo de verdad**. No existía. |
| Teléfono, mochila y HUD de estadísticas | `src/ui.js` | **Archivo nuevo**, aunque el HUD de misión y el panel de comercio ya existían. |
| Trabajos y reputación | `src/jobs.js` | **Nuevo de verdad**. No existía. |
| Clientes de comercio | `src/businesses.js` | Nuevo: antes había un solo cliente decorativo en bucle; ahora hay clientes que entran, compran y salen. |
| Colocación y colisiones | `src/world.js`, `src/businesses.js` | Corrección de los 40 locales fijos, aparición, moto, objetivo y colisiones de mobiliario. |
| Cámara con colisión | `src/main.js` | Nueva función `cameraClearance`. |
| Guardado ampliado | `src/main.js` | Energía, ropa, luces de casa, trabajos y reputación. |

### 4.3 Verificación del problema previo de los comercios

Se extrajo `SITES` del `main` base y se comparó con las 1.244 huellas de edificios del mapa:

- **40 locales base.**
- **16 de 40 estaban dentro de un edificio.** La afirmación del informe anterior era correcta.
- En la rama actual: **40/40 comercios fuera de edificios** y **casa fuera de edificios**.
- El objetivo actual está fuera de edificios y sobre una vía.
- La aparición está fuera de edificios. La moto está fuera de edificios y a 2,8 m del eje de la vía (aparcada junto al contención).

---

## 5. Clasificación de sistemas

Leyenda:

- **COMPLETADO Y VERIFICADO:** implementado y con evidencia de funcionamiento.
- **IMPLEMENTADO PERO NO VERIFICADO:** código presente, sin prueba funcional suficiente en esta auditoría.
- **PARCIAL:** una parte funciona y otra falta, o funciona con limitaciones importantes.
- **NO IMPLEMENTADO:** no existe en el código actual.

| Sistema | Clasificación | Evidencia y límites |
| --- | --- | --- |
| Mundo y ciudad | **PARCIAL** | Calles, aceras, contenes, edificios, fachadas, árboles, parques y mobiliario existen. Faltan barrios diferenciados, canchas/plazas, cables/señales, interiores de hospital/escuela y una auditoría de objetos flotantes. |
| Habitantes e IA | **PARCIAL** | Rutinas por hora, saludos, conversaciones, confianza y memoria. Las rutas son segmentos de acera de ida y vuelta, no rutas casa-trabajo-comercio. No hay animaciones de sentarse/comprar/trabajar ni reacciones al clima. |
| Tráfico y circulación | **COMPLETADO Y VERIFICADO** | Grafo de 579 nodos, 121 semáforos, carriles, giros, separación, frenado, 16 vehículos, 22 estacionados, 0 fuera de la vía y 45 frenadas en rojo en la prueba. |
| Transporte público | **PARCIAL** | 10 paradas, 20 pasajeros, autobuses/guaguas/carros públicos se detienen y hay animación de subida/bajada. **El mismo pasajero que sube es el que baja**, no hay destinos ni tarifas. |
| Colisiones de tráfico | **PARCIAL** | Los estacionados tienen colisión y los vehículos frenan ante el jugador. Los vehículos en movimiento no tienen collider: el jugador puede atravesarlos. |
| Casa: interior y acciones | **COMPLETADO Y VERIFICADO** | Entrar, luces, dormir hasta las 6:30, nevera, armario, mochila, salir y colisiones. Probado con `house_test`. |
| Casa: guardado | **PARCIAL / FALLO CRÍTICO** | Guarda luces y posición, pero **si se guarda dentro de la casa, al recargar el jugador queda en (1000, 1000) con el interior oculto**. Ver sección 8.1. |
| Comercios: interiores y clientes | **COMPLETADO Y VERIFICADO** | 40 comercios, entrada caminando, techo, luz, colisiones, clientes que entran/compran/salen y ingresos. Ciclo `idle → entering → buying → leaving` probado. |
| Comercios: economía y persistencia | **PARCIAL** | Compra, precios y stock funcionan. **El stock y los ingresos del local se reinician al recargar**; no hay abastecimiento ni caja registradora animada. |
| Trabajos y reputación | **COMPLETADO Y VERIFICADO** | Colmado 4/4 (+RD$ 360), taller 4/4 (+RD$ 469), reparto 3/3 (+RD$ 473), reputación 12 y persistencia tras recargar. |
| Misiones e historias | **PARCIAL / NO IMPLEMENTADO** | Hay un objetivo de encuentro y encargos repetibles. No hay misiones encadenadas, historias de personajes, eventos de barrio ni actividades deportivas. |
| Minimapa y mapa completo | **COMPLETADO Y VERIFICADO** | Minimapa circular, mapa completo, jugador, calles, comercios, casa, objetivo, encargo, turno, paradas, vehículos y brújula. Probado en escritorio y móvil. |
| Teléfono | **PARCIAL** | Trabajos, estado del turno, reputación y mapa funcionan. Los contactos y mensajes son textos fijos; “llamar” solo muestra un aviso. |
| Mochila e inventario | **COMPLETADO Y VERIFICADO** | Compra, inventario real, botón “Comer”, energía y persistencia de dinero/inventario. |
| Clima base | **IMPLEMENTADO PERO NO VERIFICADO** | Código de sol/nublado/lluvia/niebla, cielo, sol, niebla y partículas de lluvia. No se forzó el clima en esta auditoría ni se comprobó visualmente la lluvia. |
| Iluminación nocturna | **PARCIAL** | Sol/luz hemisférica y luces de casa/comercio. **Las farolas son decorativas y las ventanas no se iluminan de noche.** |
| Audio | **PARCIAL / NO IMPLEMENTADO** | Solo síntesis de voz para diálogos NPC. No hay audio ambiental, motores, comercios, música ni radio con audio. La “radio” del Programador es texto. |
| Menú principal y ajustes | **NO IMPLEMENTADO** | Solo existe la pantalla de selección de rol. No hay menú, guardado manual, carga, ajustes gráficos ni opciones de audio. |
| Guardado y carga completos | **PARCIAL** | Guarda dinero, inventario, posición, moto, cámara, rol, misión, reloj, clima, confianza NPC, energía, ropa, luces, trabajos y reputación. **No guarda:** estado “dentro de casa”, stock/ingresos de comercios, turno/encargo activo, tráfico, posiciones NPC ni estado de la casa. |
| Optimización | **PARCIAL** | Instancing en el mundo, 16 vehículos en PC / 9 en móvil, reciclaje y culling. Sin LOD, compresión de texturas ni medición en GPU/Android real. |
| Android / APK | **NO IMPLEMENTADO** | No hay Capacitor, carpeta `android/` ni APK. |
| Pruebas de regresión | **PARCIAL** | Hay scripts Puppeteer en `.agent_tmp/` (ignorado), pero **no están en el repositorio** ni en CI. El workflow solo compila y publica `main`. |
| Publicación | **NO PUBLICADO** | El remoto solo tiene `main` 0.1. Los 8 commits locales no están subidos. |

---

## 6. Auditoría de las 8 fases

### Fase 1 — Mundo y ciudad

| Subpunto | Clasificación | Detalle |
| --- | --- | --- |
| Calles, aceras, contenes | **COMPLETADO Y VERIFICADO** | Generados desde OSM; visibles en capturas. |
| Cruces e intersecciones | **PARCIAL** | El grafo de tráfico tiene intersecciones reales, pero no hay pasos de cebra ni cruces peatonales marcados. |
| Barrios y zonas diferenciadas | **PARCIAL** | Estilos `residential/commercial/industrial/green` y paletas; no hay barrios con identidad propia. |
| Parques, plazas y canchas | **PARCIAL** | Parques con árboles y bancos. No hay canchas ni plazas comunitarias. |
| Fachadas y arquitectura | **COMPLETADO Y VERIFICADO** | Texturas de fachada, alturas OSM o variables, tinacos, balcones y andamios. |
| Postes, cables, señales y mobiliario | **PARCIAL** | Farolas, postes, papeleras y bancos. No hay cables ni señales de tráfico verticales. |
| Objetos flotantes o mal colocados | **PARCIAL** | Se corrigieron aparición, moto, objetivo y comercios. No se auditó todo el mobiliario. |
| Vegetación | **COMPLETADO Y VERIFICADO** | Árboles, palmeras y árboles de parque. |
| Callejones y calles secundarias | **PARCIAL** | Los que trae OSM; no se añadieron callejones propios. |
| Edificios de distintas alturas y estilos | **COMPLETADO Y VERIFICADO** | Altura OSM o 6,4 + variación; estilos y colores distintos. |
| Interiores de edificios importantes | **PARCIAL** | Casa y 40 comercios. Hospital y escuela son cajas sin interior. |

**Estado de la fase 1: PARCIAL.**

### Fase 2 — Habitantes e IA

| Subpunto | Clasificación | Detalle |
| --- | --- | --- |
| Personalidades y características | **COMPLETADO Y VERIFICADO** | Nombre, oficio, personalidad, sociabilidad, horario y estado de ánimo. |
| Nombres, oficios y hogares | **PARCIAL** | Nombres y oficios sí; **no hay hogar asignado**. |
| Horarios y rutinas diarias | **PARCIAL** | Cambian a dormir/trabajar/descansar y la velocidad, pero no cambian de destino. |
| Rutas casa-comercio-trabajo | **NO IMPLEMENTADO** | Las rutas son segmentos de acera fijos, ida y vuelta. |
| Conversaciones contextuales | **COMPLETADO Y VERIFICADO** | Líneas por oficio, personalidad, rutina y saludo. |
| Relaciones, amistades y confianza | **PARCIAL** | Confianza jugador-NPC 0–5 y estado de ánimo; no hay relaciones entre NPC. |
| Memoria de interacciones | **COMPLETADO Y VERIFICADO** | La confianza se guarda y cambia el saludo. |
| Reacciones a hora, clima y eventos | **PARCIAL** | Reaccionan a la hora; no al clima ni a eventos. |
| Animaciones de caminar, conversar, sentarse, comprar, trabajar | **PARCIAL** | Caminar, idle, teléfono, saludo y mirada. No hay sentarse/comprar/trabajar para los residentes. |
| Actividades dentro de hogares y comercios | **PARCIAL** | Empleados y clientes de comercio; no hay actividad en hogares NPC. |
| Evitar movimiento repetitivo | **PARCIAL** | Pausas y conversaciones aleatorias, pero las rutas siguen siendo ping-pong. |

**Estado de la fase 2: PARCIAL.**

### Fase 3 — Tráfico, vehículos y transporte

| Subpunto | Clasificación | Detalle |
| --- | --- | --- |
| Red de calles conectada | **COMPLETADO Y VERIFICADO** | 579 nodos, aristas y grafo planar. |
| Vehículos continuos | **COMPLETADO Y VERIFICADO** | 16 en PC, 9 en móvil; reciclaje. |
| Rutas que respetan las calles | **COMPLETADO Y VERIFICADO** | Movimiento por aristas, no en línea recta libre. |
| Giros e intersecciones | **COMPLETADO Y VERIFICADO** | `chooseNext`, cambios de arista y giros detectados. |
| Carriles y sentidos | **COMPLETADO Y VERIFICADO** | Desplazamiento lateral según sentido. |
| Semáforos funcionales | **COMPLETADO Y VERIFICADO** | 121 semáforos; 45 frenadas en rojo en la prueba. |
| Respeto a señales | **PARCIAL** | Solo semáforos; no hay señales de pare/ceda. |
| Frenado y separación | **COMPLETADO Y VERIFICADO** | Distancia mínima 4,3 m; frenado ante el jugador. |
| Prevención de colisiones | **PARCIAL** | Separación entre vehículos; los vehículos en movimiento no colisionan con el jugador. |
| Vehículos estacionados | **COMPLETADO Y VERIFICADO** | 22 estacionados con collider. |
| Aparición y desaparición | **COMPLETADO Y VERIFICADO** | Reciclaje lejano y reaparición cercana. |
| Comportamiento por tipo | **PARCIAL** | Longitud/velocidad y parada de buses/guaguas/carros públicos. Taxis y motos no tienen servicio propio. |
| Motos, pasolas, carros públicos, taxis, guaguas, autobuses | **PARCIAL** | Los 50 modelos existen. Solo buses/guaguas/carros públicos se detienen en paradas. |
| Pasajeros y transporte público | **PARCIAL** | 20 pasajeros esperan. **El mismo pasajero sube y baja**; no hay destinos ni tarifas. |
| Paradas de transporte | **COMPLETADO Y VERIFICADO** | 10 paradas visibles y en el minimapa. |
| Estacionamientos | **NO IMPLEMENTADO** | Solo estacionamiento en la calle. |
| Catálogo de 50 vehículos | **COMPLETADO Y VERIFICADO** | 50 modelos en `traffic.js`. |
| Optimización de vehículos activos | **COMPLETADO Y VERIFICADO** | 16/9, culling y reciclaje. |
| Tráfico de día y de noche | **PARCIAL** | Circulan siempre; no hay faros encendidos de noche. |
| Minimapa circular estilo GTA | **COMPLETADO Y VERIFICADO** | Minimapa circular con rotación. |
| Jugador, calles, destinos y negocios en el minimapa | **COMPLETADO Y VERIFICADO** | Jugador, calles, comercios, casa, objetivo, encargo, turno, paradas y vehículos. |

**Estado de la fase 3: PARCIAL.** La circulación está completada y verificada; el transporte público, las colisiones y los estacionamientos no.

### Fase 4 — Viviendas y vida cotidiana

| Subpunto | Clasificación | Detalle |
| --- | --- | --- |
| Casa propia con fachada e interior | **COMPLETADO Y VERIFICADO** | Exterior en la ciudad e interior separado en (1000, 1000). |
| Sala, cocina, comedor, dormitorio y baño | **COMPLETADO Y VERIFICADO** | Construidos y amueblados. |
| Muebles y decoración dominicana | **COMPLETADO Y VERIFICADO** | Sofá, abanico, comedor, cocina, cama, armario, plantas. |
| Puertas funcionales | **COMPLETADO Y VERIFICADO** | `E` entra y sale; colisiones interiores. |
| Luces encendibles/apagables | **COMPLETADO Y VERIFICADO** | Interruptor y bombillas. |
| Dormir y avanzar el tiempo | **COMPLETADO Y VERIFICADO** | Hasta las 6:30; energía 100. |
| Comer y recuperar energía | **COMPLETADO Y VERIFICADO** | Nevera consume comida comprada. No hay cocina interactiva. |
| Inventario doméstico | **PARCIAL** | Usa el inventario general del jugador; no hay despensa separada. |
| Almacenamiento de objetos | **PARCIAL** | La caja abre la mochila; no es un contenedor independiente. |
| Cambiar ropa | **COMPLETADO Y VERIFICADO** | Armario cambia el color de la ropa. |
| Guardar estado de la vivienda | **PARCIAL / FALLO** | Guarda luces, pero **guardar dentro de la casa rompe la carga**. |
| Viviendas de NPC con acceso y rutinas | **NO IMPLEMENTADO** | No existen. |

**Estado de la fase 4: PARCIAL.** El interior y las acciones están completos y verificados; el guardado tiene un fallo crítico y faltan viviendas NPC.

### Fase 5 — Negocios y economía

| Subpunto | Clasificación | Detalle |
| --- | --- | --- |
| Revisar los 40 negocios | **COMPLETADO Y VERIFICADO** | 40/40 colocados fuera de edificios. |
| Fachadas e interiores | **PARCIAL** | Interiores detallados, pero comparten base y no todos los objetos son únicos. |
| Productos e inventarios | **COMPLETADO Y VERIFICADO** | 4 productos por local, stock 12. |
| Precios en RD$ | **COMPLETADO Y VERIFICADO** | Precios y formato `RD$`. |
| Empleados con tareas | **PARCIAL** | El empleado se mueve entre estaciones; no simula tareas reales. |
| Clientes que entran, compran y salen | **COMPLETADO Y VERIFICADO** | Ciclo completo y ingresos. |
| Horarios de apertura/cierre | **COMPLETADO Y VERIFICADO** | Abre/cierra según el reloj. |
| Caja registradora y pagos | **PARCIAL** | Panel de compra; no hay caja física ni animación. |
| Compras del jugador | **COMPLETADO Y VERIFICADO** | Descuenta dinero, añade inventario. |
| Abastecimiento | **NO IMPLEMENTADO** | No hay reposición. |
| Actividad variable según hora | **PARCIAL** | Abierto/cerrado y clientes solo si está abierto; no hay demanda por hora. |
| Establecimientos adicionales | **COMPLETADO Y VERIFICADO** | 40 tipos distintos. |
| Persistencia de stock/ingresos | **NO IMPLEMENTADO** | El stock vuelve a 12 y los ingresos a 0 al recargar. |

**Estado de la fase 5: PARCIAL.** El núcleo de comercios y clientes está verificado; faltan abastecimiento, caja y persistencia.

### Fase 6 — Trabajos, actividades y misiones

| Subpunto | Clasificación | Detalle |
| --- | --- | --- |
| Trabajos legales | **COMPLETADO Y VERIFICADO** | Colmado, reparto y taller. |
| Misiones principales y secundarias | **PARCIAL** | Un objetivo de encuentro; no hay cadena de misiones. |
| Encargos de habitantes | **PARCIAL** | Encargo de entrega desde el teléfono; no lo pide un NPC concreto. |
| Recados y entregas | **COMPLETADO Y VERIFICADO** | 3 paquetes en reparto; entrega individual. |
| Recompensas económicas | **COMPLETADO Y VERIFICADO** | Pagos en RD$. |
| Reputación | **COMPLETADO Y VERIFICADO** | 0–100, multiplicador de pago y guardado. |
| Actividades recreativas y deportivas | **NO IMPLEMENTADO** | No hay canchas, deportes ni minijuegos. |
| Eventos de barrio | **NO IMPLEMENTADO** | No hay eventos. |
| Historias de personajes | **NO IMPLEMENTADO** | No hay tramas. |
| Objetivos | **PARCIAL** | Encuentro, encargo y turno; no hay objetivos encadenados. |
| Progreso guardado | **PARCIAL** | Dinero, reputación, trabajos y misión; el turno/encargo activo se pierde. |
| Actividades según hora y lugar | **PARCIAL** | Comercios y turnos dependen del horario; no hay eventos programados. |

**Estado de la fase 6: PARCIAL.**

### Fase 7 — Ambiente, sonido y realismo

| Subpunto | Clasificación | Detalle |
| --- | --- | --- |
| Cielo dinámico | **IMPLEMENTADO PERO NO VERIFICADO** | Código de cielo/sol; no se forzó el ciclo en esta auditoría. |
| Amanecer y atardecer | **IMPLEMENTADO PERO NO VERIFICADO** | Cálculo por hora; no verificado visualmente ahora. |
| Noche con iluminación coherente | **PARCIAL** | Sol/luz hemisférica y luces de casa/comercio; farolas y ventanas no. |
| Farolas funcionales | **NO IMPLEMENTADO** | Son mallas decorativas sin luz. |
| Ventanas iluminadas | **NO IMPLEMENTADO** | No hay emisión nocturna. |
| Lluvia ocasional | **IMPLEMENTADO PERO NO VERIFICADO** | Partículas de lluvia en el código; no se comprobó visualmente. |
| Calles mojadas y charcos | **NO IMPLEMENTADO** | No hay materiales mojados ni charcos. |
| Nubes dinámicas | **NO IMPLEMENTADO** | No hay nubes. |
| Viento | **NO IMPLEMENTADO** | No hay viento. |
| Árboles con movimiento | **NO IMPLEMENTADO** | Los árboles son estáticos. |
| Sonidos ambientales por zona/hora | **NO IMPLEMENTADO** | No hay audio ambiental. |
| Motores y tráfico | **NO IMPLEMENTADO** | No hay audio de motores. |
| Conversaciones | **PARCIAL** | Síntesis de voz para NPC; no es audio posicional. |
| Sonidos de comercios | **NO IMPLEMENTADO** | No hay. |
| Música original o con licencia | **NO IMPLEMENTADO** | No hay música. |
| Radio con emisoras ficticias | **NO IMPLEMENTADO** | Solo hay un feed de texto para el rol Programador. |
| Efectos visuales y partículas | **PARCIAL** | Lluvia; no hay polvo, humo ni salpicaduras. |
| Sin nieve | **COMPLETADO Y VERIFICADO** | No hay nieve. |

**Estado de la fase 7: PARCIAL.** La mayor parte del ambiente y todo el audio siguen pendientes.

### Fase 8 — Interfaz, optimización y versión final

| Subpunto | Clasificación | Detalle |
| --- | --- | --- |
| Menú principal profesional | **NO IMPLEMENTADO** | Solo selección de rol. |
| Minimapa | **COMPLETADO Y VERIFICADO** | Circular, con marcadores. |
| Mapa completo | **COMPLETADO Y VERIFICADO** | Abre con `M`/minimapa y cierra con `Esc`/botón. |
| Teléfono | **PARCIAL** | Trabajos, mapa y reputación; contactos/mensajes simulados. |
| Inventario | **COMPLETADO Y VERIFICADO** | Mochila, compra y comida. |
| Configuración gráfica | **NO IMPLEMENTADO** | No hay ajustes. |
| Controles táctiles | **PARCIAL** | Joystick verificado; `bE` solo funciona para el motoconcho, no para casa/trabajos. |
| Guardado y carga completos | **PARCIAL / FALLO** | Ver sección 8.1. |
| Corrección de colisiones | **PARCIAL** | Jugador contra edificios, estacionados, casa y mobiliario; no contra vehículos en movimiento ni NPC. |
| Optimización de modelos/texturas | **PARCIAL** | Instancing y low-poly; sin LOD ni compresión. |
| Carga/descarga de sectores | **COMPLETADO Y VERIFICADO** | `world.update` por chunks; culling de comercios/vehículos. |
| Optimización CPU/GPU | **PARCIAL** | 16/9 vehículos y culling; sin medición real. |
| Adaptación a pantallas | **COMPLETADO Y VERIFICADO** | Probado a 1280×720 y 390×844. |
| Optimización Android | **NO IMPLEMENTADO** | No hay build Android. |
| Pruebas de regresión | **PARCIAL** | Scripts ad-hoc fuera del repositorio; CI solo build/deploy. |
| Corrección de errores | **PARCIAL** | Muchos corregidos; quedan los de la sección 8. |
| Versión estable | **NO IMPLEMENTADO** | 0.4 local; 0.1 publicada. |

**Estado de la fase 8: PARCIAL.**

---

## 7. Pruebas ejecutadas

### 7.1 Pruebas que pasaron

| Prueba | Resultado |
| --- | --- |
| Build de producción a `/tmp` | **Correcto**: 742,76 kB JS (208,11 kB gzip) + 8,94 kB CSS. |
| Carga en Chromium headless | **Sin `pageerror` ni 404** en las pruebas finales. |
| Tráfico (`traffic_sim`) | 16 vehículos, 22 estacionados, 579 nodos, 121 semáforos, 10 paradas, 20 pasajeros, **0 fuera de la vía**, salto máximo 0,9 m, distancia mínima 4,3 m, 45 frenadas en rojo, 3 cambios de arista, 1 giro. |
| Pasajeros (`pax_test`) | 20 pasajeros; un autobús se detiene; un pasajero pasa a `alighting`; 19 pasajeros en ese instante. |
| Casa (`house_test`) | Entrar, apagar luces, dormir (06:30, energía 100), cambiar ropa, nevera sin comida, mochila vacía, salir. **Sin errores**. |
| Comercio (`shop_enter`) | `insideShop` verdadero dentro, cliente en estado `buying`, colisión del mostrador expulsa al jugador. |
| Colocación (`audit_inside`) | 40 comercios, **0 dentro de edificios**, casa fuera. |
| Colocación base (`base_sites_check`) | 40 locales base, **16 dentro de edificios** (confirma el problema previo). |
| Aparición/objetivo (`audit_spawn_goal`) | Aparición, moto y objetivo fuera de edificios; objetivo sobre vía. |
| Turnos (`shift_test`) | Colmado 4/4 (+RD$ 360), taller 4/4 (+RD$ 469), reparto 3/3 (+RD$ 473), reputación 12, RD$ 3.802, persistencia tras recargar. |
| Móvil: joystick (`audit_joystick`) | El jugador se movió de (1,03, −18,07) a (3,66, −13,89). |
| Móvil: teléfono (`mobile_jobs`) | 3 ofertas visibles, tarjeta de 755 px dentro de 844 px, sin solapamientos. |
| Parches y bundle | Los 8 parches aplican y producen el árbol `d7dde10`; el bundle apunta a `3207178` y produce el mismo árbol. |

### 7.2 Pruebas que fallaron o que revelaron fallos

| Prueba | Qué pasó | Estado |
| --- | --- | --- |
| `shop_test` inicial | `ReferenceError: W is not defined` y luego `D is not defined` en `businesses.update`. | **Corregido** en el código con las dimensiones exteriores. |
| Build tras añadir `setView` | `Expected ";" but found ")"` en `window.__oc`. | **Corregido**; el build actual pasa. |
| Primer `shift_test` | El servidor de desarrollo no estaba levantado (`ERR_CONNECTION_REFUSED`). | **Corregido** reiniciando el servidor. |
| `house_test` actual | El script es antiguo: hace clic en la primera oferta de turno y luego intenta leer `state.job.x/z`, que no existe en un turno; eso produce `NaN m`. | **Fallo del script de prueba, no del juego.** Las acciones de la casa pasaron. |
| Móvil `bE` (`audit_mobile_e`) | Con el jugador en la puerta de la casa, tocar `bE` no entra: `inside` sigue en `false`. | **Fallo real de controles táctiles.** `bE` llama a `toggle()` (moto), no a `interact()`. |
| Guardado dentro de casa (`audit_house_save`) | Antes: dentro, (1000, 1000). Después de recargar: `inside=false`, (1000, 1000), interior oculto. | **Fallo crítico de guardado/carga.** |
| Stock tras recargar (`audit_stock`) | Compra: stock 11, dinero 2465, arroz ×1. Recarga: stock **12**, dinero 2465, arroz ×1. | **Fallo real de persistencia**: stock infinito. |
| Esquinas de comercio (`audit_shop_corners`) | En (0,0), (0,±2,8), (±3,0) detecta interior; en (±3,±2,8) **no** detecta interior. | **Fallo real de detección** por rotación invertida. |

### 7.3 Lo que no se pudo verificar

- Rendimiento real en GPU y en Android. El headless usa SwiftShader y ronda los 3,5 fps; no representa el rendimiento final.
- Audio: la síntesis de voz depende de las voces del navegador; no se verificó audiblemente.
- Clima: no se forzó lluvia/niebla en esta auditoría; solo se inspeccionó el código.
- Jugabilidad completa de principio a fin: no hay una sesión larga de juego; las pruebas son por sistemas.

---

## 8. Fallos y funcionalidades que no funcionan como se afirma

### 8.1 Crítico: guardar dentro de la casa rompe la carga

**Evidencia:**

```
Antes de recargar: inside=true, posición (1000, 1000)
Después de recargar: inside=false, posición (1000, 1000)
Interior: oculto
Casa real: (-58,2, -18,3)
```

`saveGame()` guarda la posición del jugador, pero no guarda el estado `inside` de la casa. Al recargar, el jugador aparece en las coordenadas del interior (1000, 1000), el interior está oculto y no hay puerta accesible. Queda varado lejos de la ciudad.

**Impacto:** alto. Cualquier jugador que guarde/cierre dentro de la casa pierde la sesión.

### 8.2 Alto: el botón táctil `bE` no hace la interacción contextual

En `src/main.js`:

```js
$('bE').addEventListener('click', toggle);
```

`toggle()` solo sube/baja del motoconcho. La interacción completa está en `interact()`, que en escritorio se llama con `E` y maneja casa, trabajos y moto. En móvil, por tanto:

- No se puede entrar a la casa.
- No se puede dormir, usar la nevera, el armario o la caja.
- No se puede empezar un turno, atender un cliente, reparar o entregar.

**Impacto:** alto para el objetivo Android/táctil.

### 8.3 Alto: el stock de los comercios se reinicia al recargar

`createBusinessSystem()` inicializa `stock: data.products.map(() => 12)` en cada carga y no lo guarda. El dinero y el inventario sí se guardan en `operacion-caribe-economy-v1`.

**Impacto:** se puede comprar, recargar y volver a comprar indefinidamente; el stock no representa una economía real.

### 8.4 Medio: los pasajeros del transporte público no intercambian de verdad

En `traffic.js`, el pasajero que sube (`b.pax`) es el mismo que baja en la misma parada:

- `b.pax = p` al subir.
- En `b.t > .95`, se usa `const p = b.pax` y se pone `p.state = 'alighting'` con destino `p.home` (la misma parada).

No hay un pasajero distinto bajando, ni destinos, ni tarifas. La animación existe, pero el sistema es visual.

### 8.5 Medio: detección de interior de comercio incorrecta en las esquinas

En `businesses.update`:

```js
const c = Math.cos(-s.g.rotation.y), sn = Math.sin(-s.g.rotation.y);
const lx = dx * c - dz * sn;
const lz = dx * sn + dz * c;
```

La rotación usada invierte el signo. La prueba en las cuatro esquinas interiores (±3, ±2,8) devuelve `insideShop=false`. La luz y el ajuste de cámara se desactivan en esas zonas. El centro y los ejes funcionan.

### 8.6 Medio: vehículos en movimiento y NPC sin colisión con el jugador

Solo los vehículos estacionados hacen `colliders.push(...)`. Los vehículos en movimiento frenan ante el jugador, pero no tienen collider. Los NPC tampoco. El jugador puede atravesarlos.

### 8.7 Medio: el turno/encargo activo no se guarda

Se guardan dinero, reputación y trabajos completados, pero no el turno ni el encargo en curso. Al recargar se pierde el progreso de la tarea.

### 8.8 Medio: ambiente y audio incompletos

- Farolas decorativas, sin luz.
- Ventanas sin iluminación nocturna.
- Sin charcos, calles mojadas, nubes, viento ni árboles animados.
- Sin audio ambiental, motores, comercios, música ni radio con audio.
- Solo hay síntesis de voz para NPC y un feed de texto de “radio” para el Programador.

### 8.9 Medio: teléfono parcialmente simulado

- Contactos: al pulsar solo aparece un aviso “Llamando a…”. No hay llamada.
- Mensajes: textos fijos; no hay bandeja ni conversación.
- Mapa y trabajos sí funcionan.

### 8.10 Bajo: otros detalles

- El marcador del turno puede quedar en la última posición del cliente aunque esté oculto (`shiftMarker()` no comprueba `marker.visible`).
- La oferta elige el local más cercano de su tipo; si ese local está cerrado, el botón se deshabilita aunque otro local del mismo tipo esté abierto.
- El reloj del teléfono no se actualiza en vivo mientras el panel está abierto; el HUD sí.
- `README.md` dice “F para entrar a un comercio”. En realidad `F` abre el panel de compra; para entrar hay que caminar por la puerta.
- El README mezcla la “hoja de ruta” antigua de 6 fases (atraco, roles, online, APK) con el plan maestro de 8 fases. La “Fase 2: sistema de roles” aparece sin marcar, pero los roles ya existen.
- `CREDITS.md` solo acredita Three.js. No acredita los datos de OpenStreetMap (ODbL) que usa `public/world/world.json`.
- `OPERACION_CARIBE_PROGRESS.md` marca las fases 3, 4 y 5 como “Implementado” aunque el plan maestro tiene subpuntos pendientes (transporte real, estacionamientos, viviendas NPC, abastecimiento, caja, persistencia).
- El informe de progreso afirma que “otro pasajero desciende”; el código usa el mismo pasajero.
- El informe de progreso dice que los botones móviles “responden”; el botón `bE` no responde para casa/trabajos.

### 8.11 Lista de “programado pero no funciona realmente”

| Función | Estado real |
| --- | --- |
| Guardar dentro de la casa | Se guarda, pero la carga deja al jugador varado. |
| Botón táctil `bE` para casa/trabajos | Solo motoconcho. |
| Stock de comercios | Se reinicia al recargar. |
| Pasajero que baja del autobús | Es el mismo que subió. |
| Interior de comercio en esquinas | La luz/cámara se desactivan. |
| Colisión con vehículos en movimiento | No existe. |
| Colisión con NPC | No existe. |
| Farolas y ventanas de noche | Decorativas. |
| Charcos, nubes, viento, árboles animados | No existen. |
| Audio ambiental, motores, música, radio | No existen. |
| Contactos/mensajes del teléfono | Solo avisos y textos fijos. |
| Menú principal, ajustes gráficos, carga manual | No existen. |
| APK Android | No existe. |
| Misiones encadenadas, historias, eventos | No existen. |
| Rutas casa-trabajo de NPC | No existen. |

---

## 9. Bundle, parches y recuperación

### 9.1 Qué existe

Carpeta externa al repositorio:

`/workspace/project/operacion-caribe-entrega/`

Contenido:

| Archivo | Tamaño | Contenido |
| --- | ---: | --- |
| `0001-...patch` | 78K | Tráfico real, minimapa y colocación |
| `0002-...patch` | 71K | Casa, teléfono, inventario y encargos |
| `0003-...patch` | 16K | Pasajeros |
| `0004-...patch` | 2,0K | Icono/versión 0.3 |
| `0005-...patch` | 2,3K | Documentación del 403 |
| `0006-...patch` | 35K | Trabajos por turnos |
| `0007-...patch` | 14K | Interiores de comercios |
| `0008-...patch` | 15K | Documentación y 0.4 |
| `operacion-caribe-0.4.bundle` | 48K | Los 8 commits |

### 9.2 Verificación de recuperación

| Comprobación | Resultado |
| --- | --- |
| `git bundle list-heads` | `3207178` |
| `git bundle verify` | Correcto; requiere `3e488eb` (main) |
| Aplicar los 8 parches sobre `main` en un clon temporal | Correcto |
| Árbol resultante de los parches | `d7dde10e1838febcf55a26b5300fc50a59a3402d` |
| Árbol de la rama | `d7dde10e1838febcf55a26b5300fc50a59a3402d` |
| `git fetch` del bundle en un clon temporal | `3207178` |
| Árbol del bundle | `d7dde10e1838febcf55a26b5300fc50a59a3402d` |

**Los parches y el bundle reconstruyen exactamente la rama.**

### 9.3 Cómo recuperar

Si el espacio de trabajo local se conserva:

```bash
cd /workspace/project/operacion-caribedf
git checkout mundo-abierto-trafico-minimapa
git log --oneline main..HEAD
```

Desde los parches, en un clon de `main`:

```bash
git checkout main
for p in /workspace/project/operacion-caribe-entrega/*.patch; do
  git am "$p"
done
```

Desde el bundle:

```bash
git fetch /workspace/project/operacion-caribe-entrega/operacion-caribe-0.4.bundle HEAD
git checkout -b mundo-abierto-trafico-minimapa FETCH_HEAD
```

El bundle **requiere** el commit base `3e488eb` (main). Si se recupera en otro clon, ese clon debe tener `main` en ese commit.

### 9.4 Cómo publicar cuando se resuelva el 403

Con una cuenta o token con permiso de escritura:

```bash
git push origin mundo-abierto-trafico-minimapa
```

Después, abrir un PR de `mundo-abierto-trafico-minimapa` hacia `main`.

No se debe publicar con el token actual de la integración: devuelve `403 Resource not accessible by integration`.

---

## 10. Qué está publicado y qué no

| Elemento | Estado |
| --- | --- |
| `main` remoto | `3e488eb` (base 0.1) |
| Rama `mundo-abierto-trafico-minimapa` remota | No existe |
| Pull Request | No existe |
| GitHub Pages | Publicado desde `main`; muestra “prototipo 0.1” |
| 8 commits locales | **No publicados** |
| Parches/bundle | Solo en el espacio local, fuera del repositorio |
| Código fuente local | 0.4, limpio y compilable |

**Nada del trabajo 0.2–0.4 está en GitHub.** La web pública no refleja el trabajo local.

---

## 11. Resumen de completitud por fase

| Fase | Estado global | Núcleo verificado | Pendiente principal |
| --- | --- | --- | --- |
| 1. Mundo y ciudad | **PARCIAL** | Calles, edificios, vegetación, mobiliario | Barrios, plazas/canchas, cables/señales, interiores importantes |
| 2. Habitantes e IA | **PARCIAL** | Rutinas, conversaciones, confianza | Rutas casa-trabajo, hogares, animaciones, clima/eventos |
| 3. Tráfico y transporte | **PARCIAL** | Grafo, semáforos, carriles, separación, minimapa | Transporte real, colisiones, estacionamientos, faros |
| 4. Viviendas | **PARCIAL** | Casa, interior, acciones | Guardado dentro de casa, cocina, almacenamiento real, casas NPC |
| 5. Negocios | **PARCIAL** | 40 locales, clientes, compras | Abastecimiento, caja, persistencia de stock, tareas de empleados |
| 6. Trabajos y misiones | **PARCIAL** | Turnos, encargos, reputación | Misiones encadenadas, historias, eventos, deportes |
| 7. Ambiente y sonido | **PARCIAL** | Clima base, lluvia (código) | Farolas, ventanas, charcos, nubes, viento, audio, música, radio |
| 8. Interfaz y optimización | **PARCIAL** | Minimapa, mapa, HUD, mochila, joystick | Menú, ajustes, `bE` móvil, guardado completo, Android, pruebas |

**Ninguna de las 8 fases está terminada al 100% según el plan maestro.** El sistema de tráfico (circulación) y la casa (interior/acciones) son los bloques más sólidos; el ambiente, el audio, las misiones y Android son los más incompletos.

---

## 12. Prioridades recomendadas (sin ejecutar en esta auditoría)

1. **Corregir el guardado dentro de la casa** (crítico).
2. **Hacer que `bE` llame a `interact()`** y actualizar su etiqueta contextual.
3. **Persistir stock e ingresos de comercios** (o reiniciar el stock de forma controlada).
4. **Corregir la rotación de `insideShop`**.
5. **Implementar un intercambio real de pasajeros** o rebajar la afirmación a simulación visual.
6. **Añadir colisión o respuesta física** para vehículos en movimiento y NPC.
7. **Persistir el turno/encargo activo** o cancelarlo explícitamente al recargar.
8. **Completar ambiente**: farolas, ventanas, charcos, nubes, viento y audio.
9. **Menú principal, ajustes y carga manual**.
10. **Android**: Capacitor/APK y prueba en dispositivo real.

---

## 13. Limitaciones de esta auditoría

- No se probó en una GPU real ni en un Android físico.
- El headless usa SwiftShader; los FPS no son representativos.
- No se verificó el audio de forma audible.
- No se forzó el ciclo de clima en esta sesión.
- Las pruebas son por sistemas, no una partida completa de principio a fin.
- Los scripts de prueba viven en `.agent_tmp/` (ignorado) y no forman parte del repositorio; no hay suite de regresión reproducible en CI.
- El informe se basa en el código y en la telemetría del propio juego, no en documentación anterior.

---

## 14. Conclusión

La rama local contiene una cantidad real de trabajo: tráfico con intersecciones y semáforos, minimapa, casa explorable, teléfono, inventario, trabajos por turnos, reputación y clientes de comercio. También corrige problemas importantes de colocación y añade una cámara con colisión.

Pero **no es cierto que las fases 3, 4 y 5 estén terminadas** según el plan maestro, y hay fallos concretos que afectan la experiencia:

- guardar dentro de la casa deja al jugador varado;
- el botón táctil principal no sirve para casa/trabajos;
- el stock de comercios es infinito al recargar;
- los pasajeros del autobús son una animación, no un sistema;
- la detección de interior de comercio falla en las esquinas;
- no hay colisión con vehículos en movimiento ni NPC;
- faltan farolas, ventanas, charcos, nubes, viento, audio, música, radio, menú, ajustes y Android.

**Publicación:** nada de esto está en GitHub. El remoto sigue en 0.1 y la web pública muestra 0.1. Los 8 commits, los 8 parches y el bundle están solo en el espacio local. El `403` sigue bloqueando la subida.

Este informe no modificó el juego; solo documenta su estado real.
