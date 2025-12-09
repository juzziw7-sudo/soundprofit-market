# 🎯 GUÍA FINAL - DESPLIEGUE COMPLETO

## ✅ LO QUE YA ESTÁ HECHO:
- ✅ Código completo y profesional
- ✅ Smart Contract creado (98% artista / 2% admin)
- ✅ Billetera admin configurada: `0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402`
- ✅ Base de datos lista para producción
- ✅ Repositorio Git inicializado
- ✅ Commit creado

## 🔐 PASO 1: CREAR TOKEN DE GITHUB (Solo una vez)

1. **Abre:** https://github.com/settings/tokens/new
2. **Llena el formulario:**
   - Note: `SoundProfit Deploy`
   - Expiration: `No expiration`
   - Scopes: Marca SOLO `repo` ✓
3. **Click:** "Generate token" (botón verde)
4. **COPIA EL TOKEN** (se ve como `ghp_xxxxxxxxxxxxx`)

## 📤 PASO 2: SUBIR A GITHUB

Abre PowerShell y ejecuta:

```powershell
cd c:\Users\USUARIO\.gemini\antigravity\scratch\soundprofit_market
git push -u origin main
```

Cuando te pida credenciales:
- **Username:** `juzziw7-sudo`
- **Password:** Pega el token que copiaste

## 🚀 PASO 3: DESPLEGAR EN RENDER

1. **Abre:** https://dashboard.render.com
2. **Click:** "New +" → "Blueprint" (o "Anteproyecto")
3. **Conecta GitHub** y selecciona: `soundprofit-market`
4. **Branch:** Selecciona `main` (ahora sí aparecerá)
5. **Click:** "Apply" o "Create"

Render creará automáticamente:
- ✅ Base de datos PostgreSQL
- ✅ Servidor web Node.js
- ✅ Variables de entorno (incluyendo tu billetera)

## ⏱️ PASO 4: ESPERAR (2-3 minutos)

Verás logs en pantalla. Cuando termine:
- ✅ "Build successful"
- ✅ "Live"

## 🌐 PASO 5: ¡TU LINK ESTÁ LISTO!

Copia el link que aparece (algo como):
`https://soundprofit-backend-xxxx.onrender.com`

**¡Ese es tu marketplace funcionando!**

---

## 🔄 PARA FUTUROS CAMBIOS:

Usa el script automatizado:
```powershell
.\deploy.ps1
```

---

## 💰 VERIFICAR COMISIONES:

Cada venta enviará automáticamente el 2% a:
`0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402`

Puedes verificar en: https://etherscan.io/address/0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402
