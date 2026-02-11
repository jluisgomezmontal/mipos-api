# MiPOS Backend - Sistema POS Multitenant

Sistema POS (Point of Sale) multitenant completo construido con Node.js, Express.js y MongoDB. Diseñado con arquitectura en capas, siguiendo principios de Clean Architecture y buenas prácticas de desarrollo.

## 🚀 Características Principales

### 🏢 Multitenancy
- **Aislamiento total a nivel documento**: Cada tenant (negocio) tiene sus datos completamente aislados
- **Inyección automática de tenantId**: Middleware que asegura que todas las consultas incluyan el contexto del tenant
- **Gestión de tenants**: Registro, configuración y administración de múltiples negocios

### 🔐 Autenticación y Autorización
- **JWT (JSON Web Tokens)**: Access tokens y refresh tokens
- **Sistema de roles**: OWNER, ADMIN, CASHIER
- **Middleware de autorización**: Control granular de permisos por endpoint
- **Bcrypt**: Hashing seguro de contraseñas

### 📦 Gestión de Productos
- **CRUD completo** de productos
- **Atributos dinámicos**: Soporte para propiedades personalizadas por producto
- **Búsqueda avanzada**: Por SKU, código de barras, nombre o categoría
- **Agnóstico al tipo de negocio**: Flexible para cualquier industria

### 🏪 Multi-Sucursal
- **Gestión de sucursales**: Múltiples ubicaciones por tenant
- **Inventario por sucursal**: Control independiente de stock
- **Reportes por sucursal**: Análisis de rendimiento individual

### 📊 Inventario Inteligente
- **Tracking en tiempo real**: Stock actualizado automáticamente
- **Movimientos de inventario**: IN, OUT, ADJUSTMENT, SALE
- **Alertas de stock bajo**: Configuración de mínimos y máximos
- **Historial completo**: Auditoría de todos los movimientos
- **Transacciones atómicas**: Garantía de consistencia con MongoDB sessions

### 🧾 Sistema de Ventas (POS)
- **Creación de ventas**: Con múltiples productos
- **Snapshot de productos**: Preserva precios históricos
- **Cálculo automático**: Subtotales, impuestos, descuentos
- **Estados de venta**: PENDING, PAID, CANCELLED
- **Numeración automática**: Generación de números de venta únicos
- **Descuento de inventario automático**: Al crear una venta

### 💳 Gestión de Pagos
- **Múltiples métodos**: CASH, CARD, TRANSFER
- **Pagos parciales**: Soporte para múltiples pagos por venta
- **Estados de pago**: PENDING, COMPLETED, FAILED, REFUNDED
- **Integración preparada**: Para Stripe, MercadoPago, etc.
- **Reembolsos**: Sistema de devoluciones

### 📈 Reportes y Analytics
- **Ventas por período**: Diarias, semanales, mensuales
- **Productos más vendidos**: Top N productos
- **Ingresos por sucursal**: Comparativa de rendimiento
- **Métodos de pago**: Análisis de preferencias
- **Dashboard**: Estadísticas en tiempo real

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.x
- **Base de datos**: MongoDB con Mongoose
- **Validación**: Zod
- **Autenticación**: JWT (jsonwebtoken)
- **Seguridad**: Bcrypt, Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Compresión**: Compression

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuración (DB, env)
│   ├── models/           # Modelos de Mongoose
│   ├── controllers/      # Controladores (capa de presentación)
│   ├── services/         # Lógica de negocio
│   ├── routes/           # Definición de rutas
│   ├── middlewares/      # Middlewares personalizados
│   ├── validators/       # Schemas de validación con Zod
│   ├── utils/            # Utilidades y helpers
│   ├── app.js            # Configuración de Express
│   └── server.js         # Punto de entrada
├── .env.example          # Variables de entorno de ejemplo
├── package.json
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js >= 18.x
- MongoDB >= 6.x
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio e instalar dependencias**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/mipos

JWT_SECRET=tu-secreto-jwt-muy-seguro-de-al-menos-32-caracteres
JWT_REFRESH_SECRET=tu-secreto-refresh-muy-seguro-de-al-menos-32-caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_ROUNDS=10

CORS_ORIGIN=http://localhost:3000
```

3. **Iniciar el servidor**

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm start
```

## 📚 API Endpoints

### Autenticación (`/api/v1/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar tenant + owner | No |
| POST | `/login` | Iniciar sesión | No |
| POST | `/refresh-token` | Refrescar access token | No |
| GET | `/me` | Obtener perfil del usuario | Sí |
| POST | `/users` | Crear usuario | OWNER/ADMIN |
| GET | `/users` | Listar usuarios | OWNER/ADMIN |
| PATCH | `/users/:id` | Actualizar usuario | OWNER/ADMIN |
| DELETE | `/users/:id` | Eliminar usuario | OWNER |

### Productos (`/api/v1/products`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/` | Crear producto | OWNER/ADMIN |
| GET | `/` | Listar productos | Sí |
| GET | `/:id` | Obtener producto | Sí |
| GET | `/sku/:sku` | Buscar por SKU | Sí |
| GET | `/barcode/:barcode` | Buscar por código de barras | Sí |
| PATCH | `/:id` | Actualizar producto | OWNER/ADMIN |
| DELETE | `/:id` | Eliminar producto | OWNER/ADMIN |

### Sucursales (`/api/v1/branches`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/` | Crear sucursal | OWNER/ADMIN |
| GET | `/` | Listar sucursales | Sí |
| GET | `/:id` | Obtener sucursal | Sí |
| PATCH | `/:id` | Actualizar sucursal | OWNER/ADMIN |
| DELETE | `/:id` | Eliminar sucursal | OWNER |

### Inventario (`/api/v1/inventory`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar inventario | Sí |
| GET | `/:productId/:branchId` | Obtener inventario específico | Sí |
| POST | `/movements` | Crear movimiento | OWNER/ADMIN |
| GET | `/movements` | Listar movimientos | Sí |
| PATCH | `/:productId/:branchId` | Actualizar configuración | OWNER/ADMIN |

### Ventas (`/api/v1/sales`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/` | Crear venta | Sí |
| GET | `/` | Listar ventas | Sí |
| GET | `/today` | Ventas del día | Sí |
| GET | `/:id` | Obtener venta | Sí |
| PATCH | `/:id/cancel` | Cancelar venta | OWNER/ADMIN |

### Pagos (`/api/v1/payments`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/` | Procesar pago | Sí |
| GET | `/` | Listar pagos | Sí |
| GET | `/sale/:saleId` | Pagos por venta | Sí |
| GET | `/:id` | Obtener pago | Sí |
| POST | `/:id/refund` | Reembolsar pago | OWNER/ADMIN |

### Reportes (`/api/v1/reports`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/sales` | Reporte de ventas | OWNER/ADMIN |
| GET | `/top-products` | Productos más vendidos | OWNER/ADMIN |
| GET | `/revenue-by-branch` | Ingresos por sucursal | OWNER/ADMIN |
| GET | `/payment-methods` | Reporte de métodos de pago | OWNER/ADMIN |
| GET | `/dashboard` | Estadísticas del dashboard | Sí |

## 🔒 Seguridad

### Implementaciones de Seguridad

1. **Helmet**: Headers HTTP seguros
2. **CORS**: Control de origen cruzado
3. **Rate Limiting**: Protección contra ataques de fuerza bruta
4. **Mongo Sanitize**: Prevención de inyección NoSQL
5. **Bcrypt**: Hashing de contraseñas con salt rounds configurables
6. **JWT**: Tokens firmados con secretos seguros
7. **Validación de entrada**: Zod en todos los endpoints
8. **Manejo de errores**: Centralizado y seguro (no expone stack traces en producción)

### Mejores Prácticas Implementadas

- Variables de entorno para secretos
- Validación estricta de schemas
- Transacciones de MongoDB para operaciones críticas
- Soft delete (isActive: false) en lugar de eliminación física
- Índices de base de datos para rendimiento
- Logging estructurado
- Graceful shutdown

## 🏗️ Arquitectura

### Patrón de Capas

```
┌─────────────────────────────────────┐
│         Routes (Rutas)              │  ← Definición de endpoints
├─────────────────────────────────────┤
│      Middlewares (Validación)       │  ← Autenticación, Autorización, Validación
├─────────────────────────────────────┤
│     Controllers (Controladores)     │  ← Manejo de req/res
├─────────────────────────────────────┤
│       Services (Servicios)          │  ← Lógica de negocio
├─────────────────────────────────────┤
│        Models (Modelos)             │  ← Esquemas de Mongoose
├─────────────────────────────────────┤
│      Database (MongoDB)             │  ← Persistencia
└─────────────────────────────────────┘
```

### Flujo de una Request

1. **Request** → Llega al servidor Express
2. **Middlewares globales** → Security, parsing, logging
3. **Router** → Identifica la ruta correspondiente
4. **Middlewares de ruta** → Autenticación, autorización, validación
5. **Controller** → Recibe la request, llama al service
6. **Service** → Ejecuta lógica de negocio, interactúa con modelos
7. **Model** → Consulta/modifica la base de datos
8. **Response** → Formato estandarizado de respuesta
9. **Error Handler** → Captura y formatea errores

## 🧪 Ejemplos de Uso

### Registrar un Tenant

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "tenant": {
    "name": "Mi Tienda",
    "businessName": "Mi Tienda S.A.",
    "email": "contacto@mitienda.com",
    "taxId": "123456789"
  },
  "owner": {
    "email": "admin@mitienda.com",
    "password": "Password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }
}
```

### Crear una Venta

```bash
POST /api/v1/sales
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "branchId": "65f1234567890abcdef12345",
  "items": [
    {
      "productId": "65f1234567890abcdef67890",
      "quantity": 2,
      "unitPrice": 25.99
    }
  ],
  "discount": 5.00,
  "notes": "Cliente frecuente"
}
```

### Procesar un Pago

```bash
POST /api/v1/payments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "saleId": "65f1234567890abcdef11111",
  "method": "CARD",
  "amount": 46.98,
  "reference": "CARD-12345"
}
```

## 🔄 Formato de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // ... datos
  }
}
```

### Respuesta con Paginación
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    // ... datos
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🚧 Próximas Mejoras

- [ ] Tests unitarios y de integración (Jest)
- [ ] Documentación con Swagger/OpenAPI
- [ ] Integración real con Stripe/MercadoPago
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Sistema de notificaciones
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Backup automático de base de datos
- [ ] Caché con Redis
- [ ] Métricas y monitoreo (Prometheus/Grafana)
- [ ] CI/CD pipeline

## 📄 Licencia

MIT

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ para la comunidad POS**
#   m i p o s - a p i  
 