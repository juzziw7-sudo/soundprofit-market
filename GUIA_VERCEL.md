# 🚀 GUÍA DE DESPLIEGUE GRATUITA (VERCEL + NEON)

Como Render pide tarjeta de crédito, usaremos esta alternativa **100% GRATIS** y sin tarjeta.

## PARTE 1: La Base de Datos (Neon)

1.  Entra a [Neon.tech](https://neon.tech)
2.  Regístrate (puedes usar tu cuenta de GitHub o Google).
3.  Crea un nuevo proyecto (dale el nombre `soundprofit`).
4.  Te mostrará un "Connection String" que se ve así:
    `postgres://usuario:password@ep-algo.us-east-2.aws.neon.tech/neondb?sslmode=require`
5.  **Copia ese link**. Esa es tu `DATABASE_URL`.

## PARTE 2: Subir cambios a GitHub

Como hice cambios para que esto funcione en Vercel, ejecuta esto en PowerShell:

```powershell
cd c:\Users\USUARIO\.gemini\antigravity\scratch\soundprofit_market
git add .
git commit -m "Configuracion para Vercel"
git push -u origin main
```
*(Si te pide contraseña, usa el mismo token de antes)*

## PARTE 3: Publicar en Vercel

1.  Entra a [Vercel.com](https://vercel.com)
2.  Regístrate con GitHub.
3.  Click en **"Add New..."** -> **"Project"**.
4.  Selecciona `soundprofit-market` (Import).
5.  En la configuración:
    *   **Framework Preset**: Déjalo en `Other`.
    *   **Environment Variables** (IMPORTANTE):
        *   Click en la flechita para abrir.
        *   Agrega una variable llamada `DATABASE_URL`.
        *   Pega el link que copiaste de Neon en el paso 1.
    *   Dale a **"Add"**.
6.  Click en **"Deploy"**.

## PARTE 4: Configurar la Base de Datos

Una vez que tengas tu link de Vercel (ej: `https://soundprofit.vercel.app`), necesitamos crear las tablas.

Como no podemos ejecutar el script localmente contra la nube fácilmente, he creado una ruta especial. Solo abre esta dirección en tu navegador una vez que Vercel termine:

`https://TU-LINK-DE-VERCEL.vercel.app/api/admin/init-db-force`

*(Esto creará las tablas automáticamente)*.

¡Y listo!
