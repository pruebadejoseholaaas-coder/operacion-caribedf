# Operación Caribe

Juego 3D de mundo abierto, inspirado en los grandes atracos, ambientado en la República Dominicana. Se juega en el navegador y más adelante como APK de Android.

> **Estado:** prototipo 0.1. Calle de la Zona Colonial, personaje 3D, peatones y motoconcho.

## Jugar en local

```bash
npm install
npm run dev
```

Abre la dirección que muestre la terminal. Desde el celular, en la misma red Wi-Fi, usa la dirección de red que aparece.

**Controles:** WASD o flechas para moverte, Shift para correr, arrastrar para girar la cámara, E para subir o bajar del motoconcho. En móvil: joystick y botones en pantalla.

## Publicar en la web (GitHub Pages)

1. Sube el proyecto a un repositorio en GitHub (rama `main`).
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. Cada `git push` a `main` compila y publica el juego automáticamente.

## Hoja de ruta

- [x] Fase 1: prototipo web (calle, personaje, peatones, vehículo)
- [ ] Fase 2: sistema de roles (Programador, Planificador, Conductor...)
- [ ] Fase 3: primer asalto con motor de tramas y giros aleatorios
- [ ] Fase 4: modo online libre (multijugador, sin misiones)
- [ ] Fase 5: APK con Capacitor
- [ ] Fase 6: expansión (más regiones de RD, el Caribe, otros países)

## Estructura

```
index.html        Interfaz (HUD, joystick)
src/main.js       Lógica del juego
src/style.css     Estilos
.github/          Publicación automática
```

## Propiedad intelectual

El juego se inspira en el género de atracos, pero usa **personajes, máscara, nombres y logos originales**. No incluye material con derechos de autor de terceros. Si añades modelos, música o texturas, revisa que su licencia permita uso comercial y anótalas en `CREDITS.md`.
