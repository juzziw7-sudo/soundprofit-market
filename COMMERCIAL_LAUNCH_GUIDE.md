# 🚀 SoundProfit Market - Guía de Lanzamiento Comercial

Tu plataforma está **100% lista** para el lanzamiento. Sigue estos pasos exactos para desplegarla y empezar a vender.

---

## 1. Despliegue en la Nube (Render.com)
Esta es la forma más rápida y profesional.

1.  **Sube tu código a GitHub** (Ya lo hemos hecho, tu repositorio está listo).
2.  Haz clic en el siguiente botón para desplegar automáticamente en Render:
    
    [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/juzziw7-sudo/soundprofit-market)

3.  En Render:
    -   Conecta tu cuenta de GitHub.
    -   Dale un nombre (ej: `soundprofit-market`).
    -   Render detectará el archivo `render.yaml` y configurará **Base de Datos** y **Servidor** automáticamente.
    -   Haz clic en **"Apply"** o **"Create Resources"**.

---

## 2. Configuración del "Smart Contract" (Pagos Blockchain)
Una vez que tu web esté en línea (Render te dará una URL tipo `https://soundprofit-market.onrender.com`):

1.  Abre tu nueva web y añade `/deploy.html` al final de la dirección.
    *   Ejemplo: `https://soundprofit-market.onrender.com/deploy.html`
2.  Sigue los 3 pasos en pantalla:
    *   **Paso 1:** Copia el código del contrato inteligente.
    *   **Paso 2:** Ve a [Remix IDE](https://remix.ethereum.org), pega el código y despliégalo usando MetaMask (red Ethereum, Polygon o Sepolia).
    *   **Paso 3:** Copia la dirección del contrato (ej: `0x123...`) y pégala en la casilla de tu web.
3.  ¡Listo! Tu plataforma ahora procesará pagos y enviará el **2% de comisión automáticamente** a tu billetera de administrador (`0x0bf3...`).

---

## 3. Panel de Administración
Tu plataforma incluye un panel de control completo.

-   **URL:** `https://tudominio.com/admin` (o via el menú de usuario)
-   **Funciones:**
    -   Ver ventas totales.
    -   Gestionar canciones y artistas.
    -   Resolver disputas.
    -   Ver tus comisiones acumuladas.

---

## 4. Aplicación Móvil (PWA)
Tu web ya es una App instalable.

1.  Abre la web en tu móvil (Chrome en Android, Safari en iOS).
2.  Te aparecerá la opción **"Instalar App"** o **"Añadir a Inicio"**.
3.  Se instalará con tu icono y funcionará como una app nativa.

---

## ✅ Resumen Técnico
-   **Backend:** Node.js + Express (Seguro, Rápido)
-   **Base de Datos:** PostgreSQL (Escalable)
-   **Blockchain:** Ethereum/EVM Compatible (Comisiones Automáticas)
-   **Seguridad:** Helmet, Rate Limitting, Sanitización de Inputs.

¡Tu imperio musical está listo! 🎵🚀
