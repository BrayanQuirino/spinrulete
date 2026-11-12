# SpinRulete

Ruleta aleatoria en español, hecha con React y JavaScript. Pega una opción por línea para agregar o reemplazar la lista. Toca la rueda o usa el botón para girar. El sonido se puede silenciar desde la ruleta. Cada entrada ocupa un sector y tiene la misma probabilidad. Las opciones se guardan en el navegador.

## Desarrollo local

Requiere Node.js 24 y npm.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

## Código

| Ruta | Responsabilidad |
| --- | --- |
| `src/roulette/roulette.jsx` | Estado de la lista, coordinación del giro y anuncio del resultado |
| `src/roulette/options_editor.jsx` | Importación por líneas y lista editable |
| `src/roulette/option_lines.js` | Lectura de líneas pegadas desde distintas plataformas |
| `src/roulette/roulette_audio.js` | Clics al cruzar sectores y sonido de resultado con Web Audio |
| `src/roulette/wheel.jsx` | Dibujo de sectores y etiquetas en Canvas |
| `src/roulette/wheel_math.js` | Ángulos, colores y límites del editor |
| `src/roulette/storage.js` | Persistencia local y recuperación de datos |
| `src/styles.css` | Diseño responsive y estados de interacción |
| `index.html` | Contenido principal indexable y metadatos |
| `vite.config.js` | Rutas del build, canonical y sitemap |

Se usa `snake_case` para funciones y variables. Los componentes React usan PascalCase. El editor admite hasta 50 opciones de 80 caracteres. Los textos largos se abrevian en la rueda y se muestran completos en la lista y el resultado.

## Publicación y ramas

`main` es la rama de publicación de esta primera versión. Para retomar el flujo habitual, `develop_brayan` es desarrollo, `test` es validación y `main` es estable.

1. Crea un repositorio público vacío en GitHub.
2. Conecta el remoto y sube `main`. Si recibiste el proyecto como un Git bundle, clónalo primero con `git clone spinrulete.bundle spinrulete` y entra a la carpeta.
3. Ve a **Settings → Pages → Build and deployment → Source** y elige **GitHub Actions**.
4. Si el primer push ocurrió antes de activar Pages, ejecuta manualmente **Deploy SpinRulete to GitHub Pages** desde **Actions**.

```sh
git remote set-url origin https://github.com/BrayanQuirino/spinrulete.git
git push -u origin main
```

Si el proyecto local carece de remoto `origin`, usa `git remote add origin URL`.

El workflow compila y publica `dist/` con la URL real que devuelve Pages. Tras el despliegue, verifica el sitio en [Google Search Console](https://search.google.com/search-console/welcome) y envía la URL de `sitemap.xml`.
