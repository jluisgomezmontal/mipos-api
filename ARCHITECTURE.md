# Arquitectura de MiPOS Backend

## 📐 Decisiones Técnicas y Arquitectónicas

### 1. Arquitectura en Capas (Layered Architecture)

#### ¿Por qué?
- **Separación de responsabilidades**: Cada capa tiene un propósito específico
- **Mantenibilidad**: Cambios en una capa no afectan a las demás
- **Testabilidad**: Cada capa puede ser testeada independientemente
- **Escalabilidad**: Facilita la evolución del sistema

#### Capas Implementadas

```
Routes → Middlewares → Controllers → Services → Models → Database
```

**Routes (Rutas)**
- Define los endpoints de la API
- Mapea HTTP methods a controladores
- Aplica middlewares específicos de ruta
- **Responsabilidad**: Configuración de endpoints

**Middlewares**
- Autenticación y autorización
- Validación de datos (Zod)
- Inyección de contexto de tenant
- Manejo de errores
- **Responsabilidad**: Procesamiento de request/response

**Controllers (Controladores)**
- Reciben requests HTTP
- Extraen datos del request
- Llaman a los servicios
- Formatean respuestas
- **Responsabilidad**: Capa de presentación

**Services (Servicios)**
- Contienen la lógica de negocio
- Orquestan operaciones complejas
- Manejan transacciones
- Validan reglas de negocio
- **Responsabilidad**: Lógica de negocio

**Models (Modelos)**
- Definen esquemas de Mongoose
- Validaciones a nivel de base de datos
- Métodos de instancia y estáticos
- Hooks (pre/post)
- **Responsabilidad**: Estructura de datos

### 2. Multitenancy a Nivel Documento

#### ¿Por qué Document-Level en lugar de Database-Level?

**Ventajas**:
- ✅ **Escalabilidad**: Un solo cluster de MongoDB
- ✅ **Costo-efectivo**: No requiere múltiples bases de datos
- ✅ **Mantenimiento simple**: Una sola conexión, un solo schema
- ✅ **Queries eficientes**: Índices compuestos con tenantId
- ✅ **Backup unificado**: Un solo proceso de respaldo

**Implementación**:
```javascript
// Todos los modelos incluyen tenantId
{
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  }
}

// Índices compuestos para aislamiento
schema.index({ tenantId: 1, email: 1 }, { unique: true });
```

**Middleware de Aislamiento**:
```javascript
// Inyecta tenantId automáticamente en todas las queries
export const injectTenantContext = (req, res, next) => {
  req.tenantId = req.user.tenantId;
  next();
};
```

### 3. Autenticación con JWT

#### ¿Por qué JWT en lugar de Sessions?

**Ventajas**:
- ✅ **Stateless**: No requiere almacenamiento en servidor
- ✅ **Escalable**: Funciona en arquitecturas distribuidas
- ✅ **Mobile-friendly**: Ideal para apps móviles
- ✅ **Microservicios**: Fácil de compartir entre servicios

**Implementación de Dual Token**:
```javascript
// Access Token: Corta duración (15 min)
// Refresh Token: Larga duración (7 días)

{
  accessToken: "eyJhbGc...",  // Para requests API
  refreshToken: "eyJhbGc..."  // Para renovar access token
}
```

**Flujo de Autenticación**:
1. Usuario hace login → Recibe access + refresh token
2. Cada request incluye access token en header
3. Access token expira → Frontend usa refresh token
4. Refresh token genera nuevo access token

### 4. Validación con Zod

#### ¿Por qué Zod en lugar de Joi o Yup?

**Ventajas**:
- ✅ **TypeScript-first**: Inferencia de tipos automática
- ✅ **Composable**: Fácil reutilización de schemas
- ✅ **Performance**: Más rápido que alternativas
- ✅ **Developer Experience**: Errores claros y específicos

**Ejemplo**:
```javascript
export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    price: z.number().min(0),
  }),
});
```

### 5. Manejo de Inventario con Transacciones

#### ¿Por qué MongoDB Transactions?

**Problema**: Al crear una venta, debemos:
1. Crear el registro de venta
2. Descontar inventario
3. Crear movimientos de inventario

**Solución**: Transacciones ACID
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Operación 1: Crear venta
  const sale = await Sale.create([saleData], { session });
  
  // Operación 2: Ajustar inventario
  await inventoryService.adjustInventoryForSale(..., session);
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Garantiza**:
- ✅ Atomicidad: Todo o nada
- ✅ Consistencia: Inventario siempre correcto
- ✅ Aislamiento: No hay race conditions
- ✅ Durabilidad: Cambios permanentes

### 6. Snapshot Pattern para Ventas

#### ¿Por qué guardar snapshot de productos?

**Problema**: Si cambiamos el precio de un producto, las ventas históricas mostrarían el nuevo precio.

**Solución**: Guardar snapshot del producto al momento de la venta
```javascript
{
  productId: ObjectId("..."),
  productSnapshot: {
    sku: "PROD-001",
    name: "Producto A",
    price: 25.99,      // Precio al momento de la venta
    cost: 15.00,       // Costo al momento de la venta
    taxRate: 16
  },
  quantity: 2,
  unitPrice: 25.99
}
```

**Beneficios**:
- ✅ Historial preciso de ventas
- ✅ Reportes consistentes
- ✅ Auditoría completa
- ✅ Cálculos de ganancia correctos

### 7. Soft Delete

#### ¿Por qué no eliminar físicamente?

**Implementación**:
```javascript
// En lugar de:
await Product.findByIdAndDelete(id);

// Hacemos:
await Product.findByIdAndUpdate(id, { isActive: false });
```

**Ventajas**:
- ✅ **Recuperación**: Datos pueden restaurarse
- ✅ **Auditoría**: Historial completo
- ✅ **Integridad referencial**: No rompe relaciones
- ✅ **Reportes históricos**: Datos disponibles

### 8. Índices de Base de Datos

#### Estrategia de Indexación

**Índices Compuestos**:
```javascript
// Aislamiento de tenant + unicidad
schema.index({ tenantId: 1, email: 1 }, { unique: true });
schema.index({ tenantId: 1, sku: 1 }, { unique: true });

// Queries frecuentes
schema.index({ tenantId: 1, isActive: 1 });
schema.index({ tenantId: 1, createdAt: -1 });

// Búsqueda de texto
schema.index({ tenantId: 1, name: 'text', description: 'text' });
```

**Beneficios**:
- ✅ Queries rápidas (O(log n) en lugar de O(n))
- ✅ Unicidad garantizada por tenant
- ✅ Ordenamiento eficiente

### 9. Manejo Centralizado de Errores

#### Patrón Error Handler

```javascript
// Errores operacionales (esperados)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Middleware global
export const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    // Error esperado - enviar al cliente
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // Error inesperado - log y mensaje genérico
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};
```

**Ventajas**:
- ✅ Respuestas consistentes
- ✅ No expone detalles internos
- ✅ Logging centralizado
- ✅ Fácil debugging

### 10. Generación de Números de Venta

#### Patrón: YYYYMMDDNNNN

```javascript
async generateSaleNumber(tenantId) {
  const today = new Date();
  const datePrefix = `${year}${month}${day}`;  // 20240210
  
  const lastSale = await Sale.findOne({
    tenantId,
    saleNumber: new RegExp(`^${datePrefix}`)
  }).sort({ saleNumber: -1 });
  
  let sequence = 1;
  if (lastSale) {
    sequence = parseInt(lastSale.saleNumber.slice(-4)) + 1;
  }
  
  return `${datePrefix}${String(sequence).padStart(4, '0')}`;
  // Ejemplo: 202402100001
}
```

**Beneficios**:
- ✅ Único por tenant
- ✅ Ordenable cronológicamente
- ✅ Fácil de buscar por fecha
- ✅ Secuencial dentro del día

## 🔐 Seguridad en Profundidad

### Capas de Seguridad

1. **Network Level**
   - CORS configurado
   - Rate limiting
   - Helmet headers

2. **Application Level**
   - JWT authentication
   - Role-based authorization
   - Input validation (Zod)

3. **Data Level**
   - Tenant isolation
   - Bcrypt password hashing
   - NoSQL injection prevention

4. **Code Level**
   - Error handling
   - No sensitive data in logs
   - Environment variables

## 📊 Escalabilidad

### Estrategias Implementadas

1. **Horizontal Scaling**
   - Stateless API (JWT)
   - No session storage
   - Ready for load balancer

2. **Database Optimization**
   - Índices estratégicos
   - Queries optimizadas
   - Paginación por defecto

3. **Caching Ready**
   - Estructura preparada para Redis
   - DTOs para respuestas consistentes

4. **Monitoring Ready**
   - Structured logging
   - Health check endpoint
   - Error tracking preparado

## 🧪 Testabilidad

### Diseño para Testing

```javascript
// Services son funciones puras
class ProductService {
  async createProduct(tenantId, productData) {
    // Lógica testeable sin dependencias HTTP
  }
}

// Controllers delgados
class ProductController {
  async createProduct(req, res, next) {
    // Solo orquestación
    const product = await productService.createProduct(
      req.tenantId,
      req.body
    );
    successResponse(res, { product });
  }
}
```

## 📈 Métricas y Observabilidad

### Puntos de Observación

1. **Health Check**: `/api/v1/health`
2. **Request Logging**: Morgan
3. **Error Logging**: Console + preparado para servicios externos
4. **Performance**: Timestamps en responses

## 🔄 Flujo de Datos Completo

### Ejemplo: Crear una Venta

```
1. POST /api/v1/sales
   ↓
2. Security Middleware (helmet, cors, rate limit)
   ↓
3. Body Parser (express.json)
   ↓
4. authenticate() → Verifica JWT
   ↓
5. injectTenantContext() → Añade tenantId
   ↓
6. validate(createSaleSchema) → Valida con Zod
   ↓
7. saleController.createSale()
   ↓
8. saleService.createSale()
   ├─ Inicia transacción MongoDB
   ├─ Valida branch existe
   ├─ Valida productos existen
   ├─ Calcula totales
   ├─ Crea sale
   ├─ Ajusta inventario
   ├─ Crea movimientos
   └─ Commit transacción
   ↓
9. successResponse() → Formatea respuesta
   ↓
10. Response enviada al cliente
```

## 🎯 Conclusión

Esta arquitectura está diseñada para:
- ✅ **Mantenibilidad**: Código limpio y organizado
- ✅ **Escalabilidad**: Preparado para crecer
- ✅ **Seguridad**: Múltiples capas de protección
- ✅ **Performance**: Optimizado con índices y transacciones
- ✅ **Testabilidad**: Fácil de probar
- ✅ **Extensibilidad**: Fácil de añadir features

Es un sistema **production-ready** que sigue las mejores prácticas de la industria.
