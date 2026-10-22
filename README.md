# Imperio Romano · Grupo 4

Web cinematográfica en Astro: un salón de columnas en 3D (Three.js) que la cámara recorre con el scroll,
más capítulos fijados con GSAP ScrollTrigger y scroll suave con Lenis.

## Correr en local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera /dist listo para subir (Netlify, Vercel, GitHub Pages)
```

Requiere Node 18.17+ (probado con Node 22).

## Estructura

```
src/
  data/content.js        ← TODO el texto del PDF (editá acá nombres, fechas, citas)
  pages/index.astro      ← arma la página
  components/            ← Loader, Hud, Hero, Daniel, Linea, Zoom, Mapa, Creditos
  scripts/main.js        ← animaciones de scroll (GSAP + Lenis)
  scripts/hall.js        ← escena 3D del salón de columnas (Three.js)
  scripts/audio.js       ← sonido ambiente generado (Web Audio, sin archivos)
  styles/global.css      ← tokens de color y tipografía al inicio del archivo
  assets/imperio-117.svg ← mapa vectorial extraído del PDF, separado por etapas
public/assets/daniel2.jpg ← ilustración de la estatua aportada por el grupo
```

## Ajustes rápidos

- Velocidad de cada capítulo: el `end: '+=520%'` de cada `ScrollTrigger` en `main.js` (más % = más lento).
- Clima/colores del salón 3D por capítulo: el array `MOODS` en `hall.js`.
- Encuadre de la estatua por reino: `focus: [x, y, zoom]` en `content.js`.
- Encuadre del mapa por paso: `vb: [x, y, ancho, alto]` en `mapaPasos` (`content.js`).
