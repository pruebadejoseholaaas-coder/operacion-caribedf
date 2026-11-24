# Auditoría técnica — Operación Caribe

Fecha: 2026-11-22  
Rama de trabajo: `mundo-abierto-trafico-minimapa`  
Base auditada: `ade6566`  
Pull Request: https://github.com/pruebadejoseholaaas-coder/operacion-caribedf/pull/1

## 1. Resumen ejecutivo

Operación Caribe **no es un prototipo vacío**: es un juego web 3D funcional construido con
Three.js y Vite, con una ciudad basada en OpenStreetMap, tráfico, NPC, comercios, interiores,
casa del jugador, misiones, trabajos, clima, audio y persistencia. La compilación de producción
funciona y el juego arranca en Chromium headless con WebGL por software.

El estado real es **prototipo avanzado**, no un juego terminado. Hay sistemas completos y
verificados, sistemas parciales y elementos todavía decorativos. La versión de este bloque es
**0.8.0** y añade tres frentes nuevos: economía de comercios, transporte público integrado con
habitantes y una primera capa de optimización/automatización.

## 2. Arquitectura real

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `src/main.js` | Arranque, bucle, controles, cámara, interacción, guardado | Funcional |
| `src/world.js` | Ciudad OSM, calles, edificios, aceras, vegetación, clima | Funcional |
| `src/traffic.js` | Grafo de calles, vehículos, semáforos, estacionados, paradas, pasajeros | Funcional, con límites |
| `src/citizens.js` | Rutinas, rutas, estados, interiores, compras, transporte, LOD | Funcional, verificado headless |
| `src/interiors.js` | 22 viviendas NPC, hospital, escuela, comercios, colisiones interiores | Funcional, verificado headless |
| `src/businesses.js` | 40 comercios, stock, ventas, reposición, colas, panel F | Funcional, verificado headless |
| `src/economy.js` | Preferencias, demanda horaria, colas, precios y costos | Nuevo, probado con `node:test` |
| `src/jobs.js` | Turnos, reparto, misión, recompensas y reputación | Funcional |
| `src/house.js` | Casa del jugador, cama, nevera, cocina, luces, inventario doméstico | Funcional |
| `src/missions.js` | Misión principal encadenada y marcadores | Funcional |
| `src/climate.js` | Cielo, lluvia, charcos, nubes, viento, noche | Funcional |
| `src/audio.js` | Audio procedural, motores, ambiente, radio | Funcional |
| `src/minimap.js` / `src/map.js` | Minimapa circular y mapa completo | Funcional |
| `src/ui.js` / `src/phone.js` | HUD, menú, teléfono, inventario, ajustes | Funcional |
| `tests/` | Pruebas unitarias y estáticas | Nuevo |
| `.github/workflows/pr-checks.yml` | Build + tests en cada PR | Nuevo |

## 3. Estado por sistema (verificado en código y ejecución)

### Funciona y está verificado

- Arranque, selección de rol, HUD, menú, ajustes y créditos.
- Ciudad, calles, aceras, edificios, vegetación, farolas y clima.
- Tráfico con grafo, carriles, semáforos, frenado, separación, estacionados y reciclaje.
- 40 comercios con fachada, interiores, stock, precios en RD$, reposición y panel F.
- 22 viviendas NPC con interiores, rutinas de casa/trabajo, sueño, hospital y escuela.
- Casa del jugador con cama, nevera, cocina, luces, inventario y guardado.
- Trabajos por turnos, reparto, misión principal, recompensas y reputación.
- Minimapa, mapa, teléfono, inventario, clima, noche, audio y radio.
- Persistencia de economía, stock, costos, ventas, interiores y NPC.

### Implementado en este bloque y verificado headless

- **Economía de comercios**: preferencias de consumo, demanda por hora, cola única por
  cliente, venta real, stock, costo, reposición, ventas de ciudadanos y persistencia.
- **Clientes NPC reales**: los habitantes entran al comercio, esperan en cola, compran,
  reciben un producto y salen; no son visitantes decorativos.
- **Transporte público**: paradas con línea y próxima guagua, NPC que esperan y abordan,
  viaje simulado y regreso a su rutina; el jugador puede tomar una guagua en una parada
  y avanzar a la siguiente parada.
- **Optimización**: actualización LOD de NPC por distancia, ocultado de NPC lejanos,
  actualización de tráfico por distancia, interiores ocultos fuera de vista.
- **Pruebas**: `npm test` con 7 pruebas y workflow de GitHub Actions para PR.

### Parcial o con límites conocidos

- **Tráfico vs. NPC**: los vehículos frenan entre sí y respetan semáforos, pero no hay
  colisión física vehículo-peatón. No se debe afirmar que el tráfico esquiva peatones.
- **Transporte del jugador**: el viaje es una transición con fundido a la parada siguiente,
  no una simulación de asiento dentro del autobús.
- **Compras de habitantes**: los trabajadores compran después de su turno; los habitantes
  de la zona residencial alejada no tienen comercios a menos de 150 m, por lo que no compran
  antes de trabajar. Es una limitación geográfica real, no un fallo de la cola.
- **Interiores**: son explorables y tienen colisiones, pero no todos los edificios de la
  ciudad tienen interior. Solo viviendas NPC, hospital, escuela y comercios.
- **Android**: no se ha probado en un teléfono físico. Solo hay evidencia en Chromium
  headless con SwiftShader. El rendimiento en GPU real sigue pendiente.
- **Contenido**: hay sistemas decorativos (carteles, detalles de fachada, algunos vehículos
  ambientales) que no deben presentarse como simulación completa.

## 4. Correcciones realizadas

1. **Caché de interiores de comercio**: `shopRecord()` comprobaba `shopData.has(shop.data.id)`
   pero guardaba con la clave `shop-<id>`. Cada llamada creaba un registro nuevo y reiniciaba
   `actualStaff`; por eso varios comercios mostraban 0 o 1 empleado aunque hubiera varios NPC
   dentro. Se corrigió la clave y ahora los turnos se contabilizan bien.
2. **Salida de clientes**: `exitNpc()` y `restoreNpc()` ahora solo modifican `actualStaff`
   cuando el NPC es empleado (`insideKind === 'shop'`), no cuando es cliente.
3. **Clientes en cola**: se añadió entrada/salida de clientes NPC con ruta por puerta,
   pasillo y puesto de cola; se evita que el cliente se quede dentro al recargar.
4. **Persistencia**: se guardan y restauran `citizenSales`, `costs`, `profit`, stock,
   preferencia, estado de compra y estado de transporte.
5. **Recuperación de estados**: al cargar una partida, un NPC en `toStop`, `waitingBus` o
   `ridingBus` vuelve a una ruta segura; un cliente sin comercio válido sale del interior.

## 5. Evidencia de pruebas

```bash
npm run build
# ✓ built in ~1.55s
# dist/assets/index-CNGuVuKy.js  807.34 kB │ gzip: 230.18 kB

npm test
# 7 tests, 7 pass, 0 fail
```

Pruebas headless con Chromium + SwiftShader:

- Comercios: **109 ventas de ciudadanos** en una simulación de 3 horas, **7 comercios**
  con ventas de ciudadanos, **0 rutas inseguras**, **0 NPC bloqueados**, cola máxima 0 al
  finalizar la muestra (los clientes terminan su compra).
- Persistencia: antes y después de recargar, el mismo comercio conserva stock, costo,
  ganancia, ventas de ciudadanos y empleados.
- Transporte: se observaron estados `toStop` y `ridingBus`; los NPC vuelven a `leisure`
  o a su ruta y no quedan atrapados.
- Guagua del jugador: al pulsar E en una parada, el jugador aparece en la parada siguiente
  y recibe el aviso de la línea.
- Móvil: prueba de interiores a 390×844 sin errores de página.
- Regresión: menú, misiones, trabajos, casa, clima, audio, minimapa e interiores siguen
  funcionando con 0 errores de consola en las pruebas ejecutadas.

## 6. Estado de las fases nuevas

| Fase nueva | Implementación | Compilación | Funcionamiento | Integración |
|---|---|---|---|---|
| 1. Economía y comercios | Sí | Sí | Verificado headless | No rompe trabajos, panel F ni guardado |
| 2. Transporte público | Sí, con viaje simple del jugador | Sí | Verificado headless | Usa paradas y tráfico existentes |
| 3. Vida urbana y optimización | Parcial: LOD, clima, visibilidad, pruebas | Sí | Verificado headless | Mantiene rutinas e interiores |

No se declara ninguna fase como “terminada al 100 %” en Android físico. La validación
visual y de rendimiento en GPU real está pendiente.

## 7. Próximas tareas prioritarias

1. Probar el APK en un Android físico y medir FPS, memoria y consumo.
2. Validar visualmente interiores, colas, guaguas y clima en una GPU real.
3. Añadir una parada o comercio en la zona residencial para que esos habitantes también
   compren antes del trabajo.
4. Mejorar el viaje del jugador en guagua para que sea una experiencia dentro del vehículo,
   no solo una transición.
5. Añadir colisión o reacción de vehículos ante peatones, con pruebas de regresión.
6. Completar interiores de más edificios y actividades de ocio en parques/plazas.
7. Seguir ampliando pruebas automatizadas de persistencia y de rutas.

## 8. Conclusión

El proyecto tiene una base real y ejecutable. Este bloque no reemplazó sistemas existentes:
añadió economía, clientes NPC, transporte integrado, LOD, pruebas y CI sobre la arquitectura
actual. La afirmación correcta es: **tres fases nuevas implementadas y verificadas en
navegador headless; validación en Android y GPU real pendiente**.
