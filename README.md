# Operación Caribe

Juego 3D de mundo abierto, inspirado en los grandes atracos, ambientado en la República Dominicana. Se juega en el navegador y más adelante como APK de Android.

> **Estado:** prototipo 0.4. Zona Colonial de Santo Domingo con calles reales (OpenStreetMap), 40 comercios explorables con clientes, habitantes con rutinas, tráfico con semáforos y pasajeros, minimapa, clima dinámico, casa propia, teléfono, inventario, encargos de entrega, trabajos por turnos y reputación.
>
> El estado detallado y verificado de cada fase está en [`OPERACION_CARIBE_PROGRESS.md`](OPERACION_CARIBE_PROGRESS.md).

## Jugar en local

```bash
npm install
npm run dev
```

Abre la dirección que muestre la terminal. Desde el celular, en la misma red Wi-Fi, usa la dirección de red que aparece.

**Controles:** WASD o flechas para moverte, Shift para correr, arrastrar para girar la cámara, E para interactuar (moto, casa, cama, nevera...), F para entrar a un comercio, M para abrir el mapa, I para la mochila, P para el teléfono, T para saludar, Q para usar la habilidad del rol. En móvil: joystick y botones en pantalla; toca el minimapa para abrir el mapa.

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
- [ ] Misiones encadenadas e historias de personajes
- [ ] Audio ambiental y pruebas en Android
- [ ] Fase 2: sistema de roles (Programador, Planificador, Conductor...)
- [ ] Fase 3: primer asalto con motor de tramas y giros aleatorios
- [ ] Fase 4: modo online libre (multijugador, sin misiones)
- [ ] Fase 5: APK con Capacitor
- [ ] Fase 6: expansión (más regiones de RD, el Caribe, otros países)

## Estructura

```
index.html        Interfaz (HUD, joystick, minimapa)
src/main.js       Bucle principal y jugador
src/world.js      Carga del mapa real por sectores
src/traffic.js    Grafo de calles, tráfico y semáforos
src/businesses.js 40 comercios y economía
src/minimap.js    Minimapa y mapa completo
src/house.js      Casa del jugador e interior
src/ui.js         Teléfono, mochila, avisos y HUD
src/style.css     Estilos
.github/          Publicación automática
```

## Propiedad intelectual

El juego se inspira en el género de atracos, pero usa **personajes, máscara, nombres y logos originales**. No incluye material con derechos de autor de terceros. Si añades modelos, música o texturas, revisa que su licencia permita uso comercial y anótalas en `CREDITS.md`.
