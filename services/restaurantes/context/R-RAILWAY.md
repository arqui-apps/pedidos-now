Aquí va la guía completa. Primero te explico la estrategia para tu caso específico (monorepo con múltiples microservicios), y luego el proceso de despliegue paso a paso.
¿Rama o carpeta? — La respuesta para tu caso
Con tu estructura (un solo repo con varios microservicios en /services/restaurantes), Railway te permite apuntar a un subdirectorio específico. No necesitas ramas separadas ni repos distintos. La opción correcta es conectar el repo y configurar el Root Directory como services/restaurantes en Railway.
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.25s;
    animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }
VvisualizeVvisualize show_widget
Guía paso a paso
1. Preparar tu microservicio
Asegúrate de que services/restaurantes/package.json tenga el script start:
json{
  "scripts": {
    "start": "node server.js"
  }
}
Y que server.js escuche en process.env.PORT:
jsconst PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
```

---

### 2. Crear el proyecto en Railway

1. Ve a [railway.app](https://railway.app) → **New Project**
2. Elige **Deploy from GitHub repo**
3. Conecta tu cuenta GitHub y selecciona `arqui-apps/pedidos-now`
4. Cuando te pregunte la rama, elige `main` (o `branch-restaurante` si quieres ambiente separado)

---

### 3. Configurar el Root Directory ← **lo más importante**

Una vez creado el servicio en Railway:

- Ve a tu servicio → **Settings**
- Busca **Root Directory**
- Escribe: `services/restaurantes`

Railway solo va a leer esa carpeta, instalar dependencias desde ahí y correr tu `start`. Ignorará todo lo demás del monorepo.

---

### 4. Agregar MySQL

Dentro del mismo proyecto de Railway:
- **Add Service → Database → MySQL**
- Railway te da automáticamente las variables `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT`
- Úsalas en tu código como `process.env.MYSQLHOST`, etc.

---

### 5. Variables de entorno

En **Settings → Variables** del servicio, agrega lo que necesites:
```
NODE_ENV=production
JWT_SECRET=tu_secreto
Las variables de MySQL Railway las inyecta solas si usas el mismo proyecto.

¿Rama o carpeta? — Conclusión
OpciónCuándo usarlaRoot Directory (recomendada)Tienes todo en 1 repo, solo 1 microservicio a desplegar por ahoraRama separadaQuieres ambientes diferentes (ej. staging en branch-restaurante, producción en main)Repo separadoEquipo grande donde cada microservicio es independiente
Para tu caso, Root Directory = services/restaurantes es la opción más limpia. Cada microservicio del equipo puede tener su propio servicio en Railway apuntando a su carpeta correspondiente, todos desde el mismo repo.ahora para subir la base de datos, como lo puedo hacer? y que necesito?11:57 AMBase de datos en Railway — Guía completa
Tienes dos escenarios según lo que vi en tu proyecto (MySQL con syncDatabase.js):

Opción A — Railway crea la DB desde cero (recomendada)
Railway levanta un contenedor MySQL vacío y tú sincronizas tu schema con Sequelize/código.
Pasos:
1. Agregar MySQL al proyecto

En tu proyecto Railway → Add Service → Database → MySQL
Railway genera automáticamente estas variables en tu servicio:

MYSQLHOST
MYSQLUSER  
MYSQLPASSWORD
MYSQLDATABASE
MYSQLPORT
2. Conectar tu microservicio a esa DB
En tu archivo de configuración de Sequelize (dentro de services/restaurantes/db/), usa las variables de Railway:
jsconst sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: 'mysql'
  }
);
3. Ejecutar syncDatabase.js automáticamente
En tu package.json cambia el script start para que sincronice antes de arrancar:
json{
  "scripts": {
    "start": "node syncDatabase.js && node server.js"
  }
}
Esto crea las tablas automáticamente en cada deploy. Si ya usas { force: false } en tu sync, no borrará datos existentes.

Opción B — Tienes datos existentes que quieres importar
Si ya tienes un dump .sql de tu base de datos local:
1. Exportar desde tu máquina local:
bashmysqldump -u root -p nombre_db > restaurantes_backup.sql
```

**2. Obtener las credenciales de Railway**

En Railway → tu servicio MySQL → **Connect** → copia los datos de conexión. Te da algo así:
```
Host: roundhouse.proxy.rlwy.net
Port: 12345
User: root
Password: xxxxxxxxxx
Database: railway
3. Importar el dump a Railway:
bashmysql -h roundhouse.proxy.rlwy.net -P 12345 -u root -p railway < restaurantes_backup.sql

¿Qué necesitas tener listo?
RequisitoDetallesyncDatabase.js correctoQue use process.env.MYSQL* y no credenciales hardcodeadas.env local vs RailwayEn local usas .env copy, en Railway usas Variables en SettingsMySQL client instaladoSolo si vas a importar dump (Opción B){ alter: true } o { force: false }Para no borrar datos en cada redeploy

⚠️ Error más común
Si tu db/ tiene algo así hardcodeado:
jshost: 'localhost',
password: '1234'
Eso rompe en Railway. Todo debe venir de process.env. ¿Quieres que revise cómo está tu archivo de configuración de DB para asegurarnos que esté listo?