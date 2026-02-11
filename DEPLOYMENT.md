# Guía de Despliegue - MiPOS Backend

## 🚀 Opciones de Despliegue

### 1. Railway (Recomendado para MVP)

#### Ventajas
- ✅ Deploy automático desde GitHub
- ✅ MongoDB Atlas integrado
- ✅ SSL/HTTPS automático
- ✅ Escalado sencillo
- ✅ Free tier generoso

#### Pasos

1. **Crear cuenta en Railway**
   - Ir a [railway.app](https://railway.app)
   - Conectar con GitHub

2. **Crear nuevo proyecto**
   ```bash
   # Desde Railway Dashboard
   New Project → Deploy from GitHub repo → Seleccionar miPOS
   ```

3. **Configurar variables de entorno**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mipos
   JWT_SECRET=your-production-secret-min-32-chars
   JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. **Deploy**
   - Railway detecta automáticamente Node.js
   - Usa el script `npm start` del package.json
   - URL generada: `https://mipos-backend-production.up.railway.app`

### 2. Render

#### Pasos

1. **Crear Web Service**
   - Ir a [render.com](https://render.com)
   - New → Web Service
   - Conectar repositorio

2. **Configuración**
   ```
   Name: mipos-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Variables de entorno** (igual que Railway)

### 3. Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create mipos-backend

# Configurar variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### 4. DigitalOcean App Platform

1. Conectar repositorio GitHub
2. Seleccionar branch `main`
3. Configurar:
   - Type: Web Service
   - Build Command: `npm install`
   - Run Command: `npm start`
4. Agregar variables de entorno
5. Deploy

### 5. AWS EC2 (Producción Avanzada)

#### Requisitos
- Instancia EC2 (t2.micro para empezar)
- Ubuntu 22.04 LTS
- Nginx como reverse proxy
- PM2 para process management

#### Pasos

```bash
# Conectar a EC2
ssh -i key.pem ubuntu@ec2-ip

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Clonar repositorio
git clone https://github.com/your-repo/mipos.git
cd mipos/backend

# Instalar dependencias
npm install --production

# Configurar variables de entorno
nano .env
# (pegar configuración de producción)

# Iniciar con PM2
pm2 start src/server.js --name mipos-backend
pm2 save
pm2 startup

# Configurar Nginx
sudo nano /etc/nginx/sites-available/mipos

# Contenido:
server {
    listen 80;
    server_name api.mipos.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Activar sitio
sudo ln -s /etc/nginx/sites-available/mipos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.mipos.com
```

## 🗄️ MongoDB Atlas Setup

### Crear Cluster

1. **Ir a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**

2. **Crear cluster gratuito**
   - Provider: AWS
   - Region: Más cercana a tu servidor
   - Tier: M0 (Free)

3. **Configurar acceso**
   ```
   Database Access → Add New Database User
   Username: mipos_admin
   Password: (generar seguro)
   Role: Atlas Admin
   ```

4. **Whitelist IP**
   ```
   Network Access → Add IP Address
   - Para desarrollo: 0.0.0.0/0 (cualquier IP)
   - Para producción: IP específica del servidor
   ```

5. **Obtener Connection String**
   ```
   Connect → Connect your application
   mongodb+srv://mipos_admin:<password>@cluster0.xxxxx.mongodb.net/mipos?retryWrites=true&w=majority
   ```

## 🔒 Seguridad en Producción

### Variables de Entorno Seguras

```bash
# Generar secretos seguros
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Checklist de Seguridad

- [ ] JWT secrets de al menos 64 caracteres
- [ ] BCRYPT_ROUNDS = 12 (producción)
- [ ] CORS_ORIGIN configurado con dominio específico
- [ ] MongoDB con autenticación habilitada
- [ ] MongoDB IP whitelist configurada
- [ ] HTTPS/SSL habilitado
- [ ] Rate limiting activo
- [ ] Helmet headers configurados
- [ ] Variables de entorno en archivo seguro (no en código)
- [ ] .env en .gitignore
- [ ] Logs sin información sensible

## 📊 Monitoreo

### PM2 Monitoring

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs mipos-backend

# Monitoreo en tiempo real
pm2 monit

# Restart
pm2 restart mipos-backend

# Stop
pm2 stop mipos-backend
```

### Logging en Producción

Considerar integrar:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: APM y logs
- **New Relic**: Performance monitoring

## 🔄 CI/CD con GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run tests
      run: |
        cd backend
        npm test
    
    - name: Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway up
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🧪 Testing Pre-Deploy

```bash
# Verificar que todo funciona localmente
npm run dev

# Probar endpoints críticos
curl http://localhost:5000/api/v1/health

# Verificar conexión a MongoDB
# (debería mostrar "MongoDB Connected")
```

## 📈 Escalado

### Horizontal Scaling

1. **Load Balancer** (Nginx/AWS ALB)
2. **Múltiples instancias** del backend
3. **Session storage** en Redis (si se necesita)
4. **MongoDB Replica Set** para alta disponibilidad

### Vertical Scaling

- Aumentar RAM/CPU de la instancia
- Optimizar queries de MongoDB
- Implementar caché (Redis)

## 🔧 Troubleshooting

### Error: Cannot connect to MongoDB

```bash
# Verificar connection string
echo $MONGODB_URI

# Verificar IP whitelist en MongoDB Atlas
# Verificar usuario/password
```

### Error: Port already in use

```bash
# Encontrar proceso
lsof -i :5000

# Matar proceso
kill -9 <PID>
```

### Error: Module not found

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📝 Checklist de Deploy

- [ ] Variables de entorno configuradas
- [ ] MongoDB Atlas configurado
- [ ] Secretos JWT generados
- [ ] CORS configurado correctamente
- [ ] SSL/HTTPS habilitado
- [ ] Health check endpoint funcionando
- [ ] Logs configurados
- [ ] Backup de base de datos configurado
- [ ] Monitoreo activo
- [ ] Documentación actualizada

## 🎯 Recomendaciones Finales

1. **Empezar simple**: Railway o Render para MVP
2. **Monitorear desde día 1**: Configurar logs y alertas
3. **Backups automáticos**: MongoDB Atlas los incluye
4. **Documentar todo**: Mantener este archivo actualizado
5. **Versionar**: Usar tags de Git para releases
6. **Testing**: Implementar tests antes de escalar

---

**¿Necesitas ayuda?** Abre un issue en el repositorio.
