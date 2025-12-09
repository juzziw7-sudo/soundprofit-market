# 🚀 GUÍA RÁPIDA PARA OBTENER TU LINK

¡Todo está listo! El código está "empaquetado" y listo para subirse.
Para obtener tu link funcionando en internet (y que la gente pueda entrar), necesitamos hacer esto:

## PASO 1: Subir el código a GitHub
1. Entra a [GitHub.com](https://github.com) y crea un "New Repository" (Nuevo Repositorio).
2. Ponle de nombre: `soundprofit-market`.
3. Copia el **Link HTTPS** que te dan (se verá como `https://github.com/TU_USUARIO/soundprofit-market.git`).
4. Abre la terminal aquí y ejecuta estos comando (reemplaza el link por el tuyo):

```bash
git remote add origin https://github.com/TU_USUARIO/soundprofit-market.git
git branch -M main
git push -u origin main
```

## PASO 2: Publicar en Render (Donde vive la app)
1. Entra a [dashboard.render.com](https://dashboard.render.com).
2. Haz clic en **"New +"** y selecciona **"Blueprint"**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio `soundprofit-market` que acabamos de subir.
4. Dale a "Apply". Render detectará automáticamente el archivo `render.yaml` que ya creé para ti.
5. **IMPORTANTE**: Render te pedirá confirmación. Solo dale "Approve" o "Create".

## PASO 3: ¡Listo!
Render te dará un link tipo `https://soundprofit-market.onrender.com`.
¡Ese es tu link comercial!

---
**Nota de Seguridad**: Tu billetera `0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402` ya está configurada en el código. Cada venta enviará automáticamente el 2% a esa dirección.
