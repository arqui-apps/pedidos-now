# Quick Reference: Deployment Fly.io + PostgreSQL

## 🚀 Deploy Rápido (5 Pasos)

### 1. Preparar Código

```bash
# Instalar dependencias PostgreSQL
npm install pg pg-hstore --save

# En server.js - Escuchar en 0.0.0.0
app.listen(PORT, '0.0.0.0', () => { ... });
```

### 2. Cambiar Tipos MySQL → PostgreSQL

```javascript
// En todos los modelos
DataTypes.TINYINT    → DataTypes.SMALLINT
DataTypes.DATETIME   → DataTypes.DATE
DataTypes.LONGTEXT   → DataTypes.TEXT
```

### 3. Configurar Fly.io

```bash
# Login e inicializar
flyctl auth login
flyctl launch

# Configurar secrets
flyctl secrets set NODE_ENV=production PORT=8080 DATABASE_URL="postgresql://..." JWT_SECRET="..."
```

### 4. fly.toml (Sin Cold Starts)

```toml
[http_service]
  internal_port = 8080
  auto_stop_machines = 'off'
  min_machines_running = 1
```

### 5. Deploy

```bash
git add . && git commit -m "Deploy Fly.io" && git push
flyctl deploy
```

---

## ⚠️ Errores Críticos (Y Soluciones)

| Error | Causa | Solución |
|-------|-------|----------|
| `instance refused connection on 0.0.0.0:8080` | No escucha en 0.0.0.0 | `app.listen(PORT, '0.0.0.0')` |
| `type "tinyint" does not exist` | Tipo MySQL | Cambiar a `SMALLINT` |
| `Máquina se detiene constantemente` | auto_stop activo | `auto_stop_machines = 'off'` + `min_machines_running = 1` |
| `Escucha en puerto 3000 no 8080` | PORT no configurado | `flyctl secrets set PORT=8080` |
| `Sincroniza DB cada vez` | sync() en producción | `if (NODE_ENV !== 'production') { sync() }` |

---

## 📋 Checklist Mínimo

**Código:**
- [ ] `pg` y `pg-hstore` instalados
- [ ] `app.listen(PORT, '0.0.0.0')`
- [ ] Dockerfile: `CMD ["node", "server.js"]`
- [ ] Tipos PostgreSQL en modelos

**Fly.io:**
- [ ] `PORT=8080` en secrets
- [ ] `NODE_ENV=production` en secrets
- [ ] `DATABASE_URL` en secrets
- [ ] `fly.toml` con `auto_stop_machines = 'off'`

**Verificación:**
- [ ] `flyctl status` → started
- [ ] `curl https://app.fly.dev/health` → 200 OK
- [ ] Logs sin errores: `flyctl logs`

---

## 🔧 Comandos Esenciales

```bash
# Deploy
flyctl deploy

# Ver logs
flyctl logs --app <app-name>

# Ver estado
flyctl status --app <app-name>

# Configurar secret
flyctl secrets set KEY=value --app <app-name>

# Ver secrets
flyctl secrets list --app <app-name>

# SSH a máquina
flyctl ssh console --app <app-name>

# Reiniciar
flyctl machine restart <id> --app <app-name>
```

---

**Documentación completa:** Ver `context/DEPLOYMENT-FLYIO.md`
