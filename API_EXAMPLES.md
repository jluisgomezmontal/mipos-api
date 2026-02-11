# Ejemplos de API - MiPOS

## 🔐 Autenticación

### 1. Registrar Tenant + Owner

```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "tenant": {
    "name": "Cafetería El Buen Sabor",
    "businessName": "El Buen Sabor S.A. de C.V.",
    "email": "contacto@buensabor.com",
    "phone": "+52 55 1234 5678",
    "taxId": "EBS123456789",
    "address": {
      "street": "Av. Reforma 123",
      "city": "Ciudad de México",
      "state": "CDMX",
      "country": "México",
      "zipCode": "06600"
    }
  },
  "owner": {
    "email": "admin@buensabor.com",
    "password": "Admin123!",
    "firstName": "María",
    "lastName": "González"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": {
      "_id": "65f1234567890abcdef12345",
      "name": "Cafetería El Buen Sabor",
      "businessName": "El Buen Sabor S.A. de C.V.",
      "email": "contacto@buensabor.com",
      "isActive": true
    },
    "user": {
      "_id": "65f1234567890abcdef67890",
      "email": "admin@buensabor.com",
      "firstName": "María",
      "lastName": "González",
      "role": "OWNER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 2. Login

```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@buensabor.com",
  "password": "Admin123!"
}
```

### 3. Refresh Token

```bash
POST http://localhost:5000/api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Crear Usuario (Cajero)

```bash
POST http://localhost:5000/api/v1/auth/users
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "cajero1@buensabor.com",
  "password": "Cajero123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "CASHIER"
}
```

## 🏪 Sucursales

### 1. Crear Sucursal

```bash
POST http://localhost:5000/api/v1/branches
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Sucursal Centro",
  "code": "CENTRO",
  "address": {
    "street": "Calle Madero 45",
    "city": "Ciudad de México",
    "state": "CDMX",
    "country": "México",
    "zipCode": "06000"
  },
  "phone": "+52 55 9876 5432",
  "email": "centro@buensabor.com"
}
```

### 2. Listar Sucursales

```bash
GET http://localhost:5000/api/v1/branches
Authorization: Bearer {access_token}
```

## 📦 Productos

### 1. Crear Producto

```bash
POST http://localhost:5000/api/v1/products
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "sku": "CAFE-ESP-001",
  "name": "Café Espresso",
  "description": "Café espresso italiano premium",
  "category": "Bebidas Calientes",
  "price": 45.00,
  "cost": 15.00,
  "taxRate": 16,
  "barcode": "7501234567890",
  "attributes": {
    "size": "120ml",
    "origin": "Colombia",
    "roast": "Medium"
  },
  "trackInventory": true
}
```

### 2. Buscar Productos

```bash
GET http://localhost:5000/api/v1/products?search=café&category=Bebidas&page=1&limit=20
Authorization: Bearer {access_token}
```

### 3. Buscar por Código de Barras

```bash
GET http://localhost:5000/api/v1/products/barcode/7501234567890
Authorization: Bearer {access_token}
```

## 📊 Inventario

### 1. Entrada de Inventario

```bash
POST http://localhost:5000/api/v1/inventory/movements
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "productId": "65f1234567890abcdef11111",
  "branchId": "65f1234567890abcdef22222",
  "type": "IN",
  "quantity": 100,
  "reason": "Compra a proveedor",
  "reference": "PO-2024-001"
}
```

### 2. Salida de Inventario

```bash
POST http://localhost:5000/api/v1/inventory/movements
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "productId": "65f1234567890abcdef11111",
  "branchId": "65f1234567890abcdef22222",
  "type": "OUT",
  "quantity": 10,
  "reason": "Producto dañado"
}
```

### 3. Ajuste de Inventario

```bash
POST http://localhost:5000/api/v1/inventory/movements
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "productId": "65f1234567890abcdef11111",
  "branchId": "65f1234567890abcdef22222",
  "type": "ADJUSTMENT",
  "quantity": 95,
  "reason": "Inventario físico"
}
```

### 4. Consultar Inventario

```bash
GET http://localhost:5000/api/v1/inventory?branchId=65f1234567890abcdef22222
Authorization: Bearer {access_token}
```

### 5. Productos con Stock Bajo

```bash
GET http://localhost:5000/api/v1/inventory?lowStock=true
Authorization: Bearer {access_token}
```

## 🧾 Ventas

### 1. Crear Venta Simple

```bash
POST http://localhost:5000/api/v1/sales
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "branchId": "65f1234567890abcdef22222",
  "items": [
    {
      "productId": "65f1234567890abcdef11111",
      "quantity": 2,
      "unitPrice": 45.00
    },
    {
      "productId": "65f1234567890abcdef33333",
      "quantity": 1,
      "unitPrice": 35.00
    }
  ]
}
```

### 2. Crear Venta con Descuento

```bash
POST http://localhost:5000/api/v1/sales
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "branchId": "65f1234567890abcdef22222",
  "items": [
    {
      "productId": "65f1234567890abcdef11111",
      "quantity": 3,
      "unitPrice": 45.00,
      "discount": 5.00
    }
  ],
  "discount": 10.00,
  "customerInfo": {
    "name": "Carlos Ramírez",
    "email": "carlos@example.com",
    "phone": "+52 55 1111 2222"
  },
  "notes": "Cliente frecuente - descuento especial"
}
```

### 3. Consultar Ventas del Día

```bash
GET http://localhost:5000/api/v1/sales/today?branchId=65f1234567890abcdef22222
Authorization: Bearer {access_token}
```

### 4. Consultar Ventas por Rango de Fechas

```bash
GET http://localhost:5000/api/v1/sales?startDate=2024-02-01&endDate=2024-02-10&status=PAID
Authorization: Bearer {access_token}
```

### 5. Cancelar Venta

```bash
PATCH http://localhost:5000/api/v1/sales/65f1234567890abcdef44444/cancel
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "CANCELLED",
  "cancellationReason": "Cliente solicitó cancelación"
}
```

## 💳 Pagos

### 1. Pago en Efectivo

```bash
POST http://localhost:5000/api/v1/payments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "saleId": "65f1234567890abcdef44444",
  "method": "CASH",
  "amount": 125.00,
  "reference": "Efectivo recibido"
}
```

### 2. Pago con Tarjeta

```bash
POST http://localhost:5000/api/v1/payments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "saleId": "65f1234567890abcdef44444",
  "method": "CARD",
  "amount": 125.00,
  "reference": "VISA-****1234",
  "metadata": {
    "cardType": "VISA",
    "last4": "1234",
    "authCode": "ABC123"
  }
}
```

### 3. Pago Parcial

```bash
POST http://localhost:5000/api/v1/payments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "saleId": "65f1234567890abcdef44444",
  "method": "CASH",
  "amount": 50.00,
  "reference": "Pago parcial 1"
}
```

### 4. Consultar Pagos de una Venta

```bash
GET http://localhost:5000/api/v1/payments/sale/65f1234567890abcdef44444
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sale payments retrieved successfully",
  "data": {
    "payments": [
      {
        "_id": "65f1234567890abcdef55555",
        "method": "CASH",
        "amount": 50.00,
        "status": "COMPLETED"
      },
      {
        "_id": "65f1234567890abcdef66666",
        "method": "CARD",
        "amount": 75.00,
        "status": "COMPLETED"
      }
    ],
    "summary": {
      "saleTotal": 125.00,
      "totalPaid": 125.00,
      "remainingBalance": 0,
      "isPaid": true
    }
  }
}
```

### 5. Reembolsar Pago

```bash
POST http://localhost:5000/api/v1/payments/65f1234567890abcdef55555/refund
Authorization: Bearer {access_token}
```

## 📈 Reportes

### 1. Reporte de Ventas por Período

```bash
GET http://localhost:5000/api/v1/reports/sales?startDate=2024-02-01&endDate=2024-02-10
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sales report generated successfully",
  "data": {
    "period": {
      "startDate": "2024-02-01",
      "endDate": "2024-02-10"
    },
    "summary": {
      "totalSales": 150,
      "totalRevenue": 18750.50,
      "totalDiscount": 500.00,
      "totalTax": 2400.08,
      "averageSaleValue": 125.00
    },
    "salesByStatus": {
      "PAID": 140,
      "PENDING": 10
    },
    "salesByBranch": {
      "Sucursal Centro": {
        "count": 100,
        "revenue": 12500.00
      },
      "Sucursal Norte": {
        "count": 50,
        "revenue": 6250.50
      }
    },
    "dailySales": {
      "2024-02-01": { "count": 15, "revenue": 1875.00 },
      "2024-02-02": { "count": 18, "revenue": 2250.00 }
    }
  }
}
```

### 2. Productos Más Vendidos

```bash
GET http://localhost:5000/api/v1/reports/top-products?startDate=2024-02-01&endDate=2024-02-10&limit=10
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Top products report generated successfully",
  "data": {
    "topProducts": [
      {
        "productId": "65f1234567890abcdef11111",
        "sku": "CAFE-ESP-001",
        "name": "Café Espresso",
        "quantitySold": 250,
        "totalRevenue": 11250.00,
        "totalCost": 3750.00,
        "totalProfit": 7500.00
      },
      {
        "productId": "65f1234567890abcdef33333",
        "sku": "CAFE-LAT-001",
        "name": "Café Latte",
        "quantitySold": 180,
        "totalRevenue": 6300.00,
        "totalCost": 2160.00,
        "totalProfit": 4140.00
      }
    ]
  }
}
```

### 3. Ingresos por Sucursal

```bash
GET http://localhost:5000/api/v1/reports/revenue-by-branch?startDate=2024-02-01&endDate=2024-02-10
Authorization: Bearer {access_token}
```

### 4. Reporte de Métodos de Pago

```bash
GET http://localhost:5000/api/v1/reports/payment-methods?startDate=2024-02-01&endDate=2024-02-10
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Payment methods report generated successfully",
  "data": {
    "paymentMethods": [
      {
        "method": "CARD",
        "count": 85,
        "totalAmount": 10625.00
      },
      {
        "method": "CASH",
        "count": 60,
        "totalAmount": 7500.00
      },
      {
        "method": "TRANSFER",
        "count": 5,
        "totalAmount": 625.50
      }
    ]
  }
}
```

### 5. Dashboard Stats

```bash
GET http://localhost:5000/api/v1/reports/dashboard?branchId=65f1234567890abcdef22222
Authorization: Bearer {access_token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "today": {
      "sales": 25,
      "revenue": 3125.00,
      "paymentsReceived": 3000.00
    },
    "thisMonth": {
      "sales": 450,
      "revenue": 56250.00
    }
  }
}
```

## 🔍 Filtros y Paginación

### Productos con Paginación

```bash
GET http://localhost:5000/api/v1/products?page=2&limit=20&sort=-createdAt
Authorization: Bearer {access_token}
```

### Ventas Filtradas

```bash
GET http://localhost:5000/api/v1/sales?branchId=65f&status=PAID&startDate=2024-02-01&page=1&limit=50
Authorization: Bearer {access_token}
```

## ⚠️ Manejo de Errores

### Error de Validación

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email format"
    },
    {
      "field": "body.password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Error de Autenticación

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Error de Autorización

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Error de Recurso No Encontrado

```json
{
  "success": false,
  "message": "Product not found"
}
```

### Error de Conflicto

```json
{
  "success": false,
  "message": "Product with this SKU already exists"
}
```

## 🔑 Headers Requeridos

Todos los endpoints (excepto `/register`, `/login`, `/refresh-token`) requieren:

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## 📝 Notas Importantes

1. **Multitenancy**: Todos los datos están aislados por tenant. El `tenantId` se extrae automáticamente del JWT.

2. **Paginación**: Por defecto `page=1` y `limit=20`. Máximo recomendado: `limit=100`.

3. **Fechas**: Usar formato ISO 8601: `2024-02-10` o `2024-02-10T14:30:00Z`.

4. **Inventario**: Se descuenta automáticamente al crear una venta.

5. **Transacciones**: Ventas e inventario usan transacciones MongoDB para garantizar consistencia.

6. **Soft Delete**: Los recursos eliminados se marcan como `isActive: false`.
