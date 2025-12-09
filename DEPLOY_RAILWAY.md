# 🚂 Despliegue en Railway.app (RECOMENDADO - MÁS SIMPLE)

Railway.app es **mucho más simple** que Vercel para aplicaciones Node.js tradicionales.
**No requiere tarjeta de crédito** para el tier gratuito.

---

## 📋 PASOS PARA DESPLEGAR

### 1️⃣ Crear Base de Datos en Neon (Ya hecho ✅)

Tu connection string de Neon:
```
postgresql://neondb_owner:npg_I9ba4MqwOUjp@ep-blue-shadow-addhpaqk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

### 2️⃣ Desplegar en Railway

1. **Ve a:** [railway.app](https://railway.app)

2. **Haz clic en:** "Start a New Project"

3. **Selecciona:** "Deploy from GitHub repo"

4. **Autoriza Railway** a acceder a tu GitHub

5. **Selecciona el repositorio:** `soundprofit-market`

6. **Railway detectará automáticamente** que es una app Node.js

---

### 3️⃣ Configurar Variables de Entorno

En el dashboard de Railway, ve a **"Variables"** y agrega:

```
DATABASE_URL=postgresql://neondb_owner:npg_I9ba4MqwOUjp@ep-blue-shadow-addhpaqk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NODE_ENV=production

JWT_SECRET=tu_secreto_super_seguro_aqui_cambialo

ADMIN_WALLET_ADDRESS=0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402
```

**Haz clic en "Add"** después de cada variable.

---

### 4️⃣ Desplegar

Railway **desplegará automáticamente**. Espera 2-3 minutos.

Verás logs en tiempo real. Cuando veas:
```
🚀 Server running on port 3000
```

¡Tu app está lista!

---

### 5️⃣ Obtener tu URL

Railway te dará un dominio como:
```
https://soundprofit-market-production.up.railway.app
```

Copia ese link.

---

### 6️⃣ Inicializar Base de Datos

Abre en tu navegador:
```
https://TU-LINK-DE-RAILWAY.up.railway.app/api/admin/init-db-force
```

Deberías ver:
```json
{"success": true, "message": "Database initialized successfully!"}
```

---

### 7️⃣ ¡LISTO! 🎉

Tu app está funcionando en:
```
https://TU-LINK-DE-RAILWAY.up.railway.app
```

---

## 🔒 SEGURIDAD POST-DESPLIEGUE

Después de inicializar la DB, **elimina o protege** la ruta `/api/admin/init-db-force` en `backend_api/routes/admin.js`.

---

## 💡 VENTAJAS DE RAILWAY vs VERCEL

✅ **Más simple** para apps Node.js tradicionales  
✅ **No requiere** adaptación serverless  
✅ **Logs en tiempo real** más claros  
✅ **Sin restricciones** de tiempo de ejecución  
✅ **Gratis** sin tarjeta de crédito  

---

## 🆘 SOPORTE

Si tienes problemas:
1. Revisa los logs en Railway dashboard
2. Verifica que `DATABASE_URL` esté configurada correctamente
3. Asegúrate de que el puerto sea dinámico (`process.env.PORT`)
