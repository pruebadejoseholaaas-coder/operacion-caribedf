# Operación Caribe

Juego 3D de mundo abierto, inspirado en los grandes atracos, ambientado en la República Dominicana. Se juega en el navegador y más adelante como APK de Android.

> **Estado:** prototipo 0.7. Zona Colonial de Santo Domingo con calles reales (OpenStreetMap), 40 comercios explorables con clientes y reposición, habitantes con casa y trabajo asignados, **interiores funcionales de viviendas, hospital y escuela**, rutas por aceras, horarios individuales, estados de actividad y persistencia; tráfico con semáforos, pasajeros y faros; minimapa, clima dinámico, noche con farolas y ventanas iluminadas; audio procedural, casa propia, menú principal, ajustes gráficos, teléfono, inventario, encargos, trabajos por turnos, misión encadenada y reputación.
>
> El estado detallado y verificado de cada fase está en [`OPERACION_CARIBE_PROGRESS.md`](OPERACION_CARIBE_PROGRESS.md).

## Jugar en local

```bash
npm install
npm run dev
```

Abre la dirección que muestre la terminal. Desde el celular, en la misma red Wi-Fi, usa la dirección de red que aparece.

**Controles:** WASD o flechas para moverte, Shift para correr, arrastrar para girar la cámara, E para interactuar (moto, casa, viviendas de NPC, hospital, escuela, cama, nevera, cocina, cancha, misión...), F para entrar a un comercio, M para abrir el mapa, I para la mochila, P para el teléfono, T para saludar, Q para usar la habilidad del rol, Esc para el menú. En móvil: joystick y botones en pantalla; toca el minimapa para abrir el mapa.

## Publicar en la web (GitHub Pages)

1. Sube el proyecto a un repositorio en GitHub (rama `main`).
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. Cada `git push` a `main` compila y publica el juego automáticamente.

## Hoja de ruta

- [x] Fase 1: prototipo web (calle, personaje, peatones, vehículo)
- [x] Ciudad real (OpenStreetMap), 40 comercios, tráfico con semáforos y minimapa
- [x] Casa del jugador con interior, teléfono, inventario y encargos de entrega
- [x] Transporte público con pasajeros que esperan, suben y bajan
- [x] Trabajos por turnos (colmado, reparto, taller) con reputación
- [x] Interiores de comercios con clientes que entran, compran y salen
- [x] Habitantes autónomos: casa y trabajo asignados, rutas por aceras, horarios, estados y persistencia
- [x] Interiores de viviendas de NPC, hospital y escuela; puestos de trabajo dentro de comercios
- [x] Animaciones de caminar, entrar, sentarse, comer, trabajar, atender y dormir
- [x] Misión encadenada «El recado de Doña Rosa»
- [x] Audio procedural, noche, lluvia, nubes, viento y radio
- [x] Menú principal, ajustes gráficos, volumen, FPS y guardado/carga
- [x] Cancha de baloncesto y actividad recreativa
- [ ] Historias de más personajes y eventos de barrio
- [ ] Pruebas en Android físico
- [ ] Fase 2 pulida: colas de clientes y diálogos encadenados
- [ ] Fase 1 ampliada: más variedad arquitectónica y mobiliario urbano
- [ ] Fase 3 ampliada: estacionamientos dedicados y taxi/público
- [ ] Fase 8: APK con Capacitor, LOD/texturas y prueba en dispositivo real

## Estructura

```
index.html        Interfaz (HUD, joystick, minimapa)
src/main.js       Bucle principal y jugador
src/world.js      Carga del mapa real por sectores
src/traffic.js    Grafo de calles, tráfico y semáforos
src/businesses.js 40 comercios y economía
src/minimap.js    Minimapa y mapa completo
src/house.js      Casa del jugador e interior
src/ambience.js   Farolas, ventanas, charcos, nubes y viento
src/audio.js      Audio procedural, radio y motor
src/menu.js       Menú principal, ajustes y créditos
src/missions.js   Misión encadenada de Doña Rosa
src/citizens.js   Habitantes autónomos, rutas, horarios y persistencia
src/interiors.js  Viviendas de NPC, hospital, escuela y puestos de comercio
src/ui.js         Teléfono, mochila, avisos y HUD
src/style.css     Estilos
.github/          Publicación automática
```

## Propiedad intelectual

El juego se inspira en el género de atracos, pero usa **personajes, máscara, nombres y logos originales**. No incluye material con derechos de autor de terceros. Si añades modelos, música o texturas, revisa que su licencia permita uso comercial y anótalas en `CREDITS.md`.
