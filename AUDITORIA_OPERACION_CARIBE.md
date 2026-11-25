# Auditoría Operación Caribe — v0.9.0 en desarrollo

Fecha: 2026-11-22
Rama: `mundo-abierto-trafico-minimapa`
PR: [#1](https://github.com/pruebadejoseholaaas-coder/operacion-caribedf/pull/1) contra `main` (Draft)
Cierre anterior: 0.8.0 en `5b9285c`

Este documento ya no es un simple redireccionamiento. Resume el estado comprobado contra el
código y la ejecución real. La auditoría larga sigue en [`AUDITORIA.md`](AUDITORIA.md) y el
registro de bloques en [`OPERACION_CARIBE_PROGRESS.md`](OPERACION_CARIBE_PROGRESS.md).

## Estado real

Operación Caribe es un juego web 3D con Three.js/Vite y una ciudad basada en OSM. Tiene menú,
mundo, tráfico, NPC, comercios, interiores, casa, trabajos, misiones, clima, audio y guardado.
No es un juego terminado ni un prototipo vacío: es un prototipo avanzado con sistemas reales y
varios límites conocidos.

La versión 0.9.0 en desarrollo cierra tres frentes:

1. **Transporte público con rutas propias** (`src/transit.js`, `src/traffic.js`):
   - tres líneas: Ruta Colonial, Ruta Universitaria y Ruta Malecón;
   - cada parada conoce su línea y su siguiente parada;
   - las guaguas eligen el camino por el grafo hacia la siguiente parada de su línea;
   - al menos una guagua por línea mediante refuerzo de flota;
   - pasajeros con destino, abordaje, estado `riding` y descenso en la parada destino;
   - el jugador avanza a la siguiente parada de la misma línea, no a una parada arbitraria.
2. **Seguridad vial** (`src/trafficRules.js`, `src/traffic.js`):
   - los vehículos reducen velocidad en cruces;
   - ceden el paso a peatones que están delante en su carril;
   - se añadió recuperación para vehículos detenidos demasiado tiempo;
   - se conserva la separación entre vehículos, semáforos y reciclaje de lejanos.
3. **Vida cotidiana y espacio público** (`src/barrio.js`, `src/citizens.js`, `src/businesses.js`):
   - Plaza Los Almendros reubicada en un solar urbano accesible, con bancos, árboles, farolas, kiosco y letrero;
   - algunos habitantes usan la plaza como destino de ocio y se validaron visitas reales a bancos;
   - atención de comercios abiertos aunque el empleado NPC aún no haya llegado (el local tiene
     su puesto de atención; no se simula un cliente como si fuera empleado);
   - los habitantes que están dentro de su vivienda usan su dirección lógica para buscar
     comercios cercanos, no la posición del interior instanciado;
   - se corrigió la prioridad de los oficios al asignar trabajo, para que la lista de
     preferencia del oficio mande sobre el orden del catálogo.

## Verificación ejecutada

- `npm test`: **24 pruebas, 24 correctas, 0 fallos**.
- `npm run build`: correcto, bundle principal ~822.42 kB JS (gzip ~235.68 kB).
- Chromium headless con SwiftShader, sin errores de página:
  - el jugador toma una guagua y aparece en la siguiente parada de la misma línea;
  - la telemetría muestra líneas, paradas, pasajeros con destino y al menos una guagua por línea;
  - una prueba de tráfico coloca un peatón delante de un vehículo y comprueba que baja la
    velocidad y aumenta el contador de cesiones;
  - simulación de habitantes antes del turno: 12 ventas reales de ciudadanos en 2 comercios,
    0 rutas inseguras y 0 NPC bloqueados;
  - las 22 viviendas NPC usadas por las rutinas están a menos de 150 m de un comercio
    (mínimo medido 11.4 m en la muestra; la afirmación anterior de que la zona residencial
    quedaba aislada era incorrecta).
- Regresión revisada: menú, casa, comercios, interiores, trabajos, misiones, clima, minimapa,
  audio y guardado siguen arrancando sin error en las pruebas ejecutadas.

## Límites que siguen abiertos

- No se probó en Android físico ni en GPU real; la evidencia es headless/SwiftShader.
- Los vehículos frenan y ceden ante peatones, pero no existe colisión física vehículo-peatón.
- El descenso de pasajeros está implementado y probado en código/simulación, pero la prueba
  visual de un viaje completo de punta a punta queda pendiente.
- La Plaza Los Almendros es explorable y ya recibe visitas de habitantes con casa cercana; la
  frecuencia depende de la hora y del turno, y no todos los NPC la eligen. Queda ampliar sus
  actividades (dominó, música, conversaciones sentadas).
- No todos los edificios tienen interior; están cubiertos viviendas NPC, hospital, escuela,
  comercios y la casa del jugador.
- La versión 0.9.0 es una entrega de trabajo; no se declara el juego terminado.

## Próxima tarea exacta

Comparar el solar con las fotografías reales cuando estén disponibles, añadir más actividades
a la plaza y validar en un Android físico el APK/rendimiento.
