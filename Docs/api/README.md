# API REST

[Volver al indice](../README.md)

## Resumen

La API real esta montada en `backend/src/app.js` bajo el prefijo `/api`. Express registra estos modulos:

| Modulo | Prefijo | Archivo de rutas |
| --- | --- | --- |
| Health | `/api/health` | `backend/src/app.js` |
| Autenticacion | `/api/auth` | `backend/src/modules/auth/auth.routes.js` |
| Usuarios | `/api/users` | `backend/src/modules/users/user.routes.js` |
| Motos | `/api/motorcycles` | `backend/src/modules/motorcycles/motorcycle.routes.js` |
| Favoritos | `/api/favorites` | `backend/src/modules/favorites/favorites.routes.js` |
| Comparacion / historial | `/api/comparisons` | `backend/src/modules/comparisons/comparisons.routes.js` |
| Cuestionario | `/api/questionnaire` | `backend/src/modules/questionnaire/questionnaire.routes.js` |
| Recomendaciones | `/api/questionnaire/my/recommendations` | no hay ruta `/api/recommendations` dedicada |
| Feedback de recomendaciones | `/api/feedback` | `backend/src/modules/feedback/feedback.routes.js` |
| Alertas de precio | `/api/price-alerts` | `backend/src/modules/priceAlerts/priceAlerts.routes.js` |
| Notificaciones / historial | `/api/price-alerts/history` | `backend/src/modules/priceAlerts/priceAlerts.routes.js` |
| Simulador de costos / historial | `/api/cost-simulator` | `backend/src/modules/costSimulator/costSimulator.routes.js` |
| Analitica de mercado | `/api/market-analysis` | `backend/src/modules/marketAnalysis/marketAnalysis.routes.js` |
| Analytics de compartir | `/api/analytics` | `backend/src/modules/analytics/share.routes.js` |
| Resenas | `/api/reviews` | `backend/src/modules/reviews/review.routes.js` |
| Soporte | `/api/support` | `backend/src/modules/support/support.routes.js` |

## Autenticacion JWT

Las rutas protegidas usan `Authorization: Bearer <token>`. El token se emite al verificar email o al iniciar sesion.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

Errores comunes:

| Codigo | Respuesta |
| --- | --- |
| `401` | `{ "message": "No autorizado - token requerido" }` |
| `401` | `{ "message": "Sesion expirada, vuelve a iniciar sesion" }` |
| `401` | `{ "message": "Token invalido" }` |
| `400` | `{ "message": "Datos invalidos", "details": [...] }` |
| `409` | `{ "message": "Ya existe un registro con esos datos (duplicado)" }` |
| `500` | `{ "message": "Error interno del servidor" }` |

> Nota: los mensajes reales tienen acentos en codigo fuente; esta documentacion los deja en ASCII para evitar problemas de encoding.

## Health

### `GET /api/health`

Comprueba que el backend esta vivo.

- Autenticacion: no requerida.
- Body: no aplica.

Respuesta:

```json
{
  "status": "ok",
  "env": "development"
}
```

Codigos: `200`.

## Autenticacion

### `POST /api/auth/register`

Crea una cuenta y envia correo de verificacion. No emite JWT hasta verificar email.

- Autenticacion: no requerida.
- Body:

```json
{
  "name": "Ana Perez",
  "email": "ana@example.com",
  "password": "password123"
}
```

Validacion real:

- `name`: string 2-80 requerido.
- `email`: email requerido.
- `password`: string 8-128 requerido.

Respuesta `201`:

```json
{
  "message": "Cuenta creada. Revisa tu correo electronico para confirmar tu registro.",
  "user": {
    "id": 1,
    "name": "Ana Perez",
    "email": "ana@example.com",
    "createdAt": "2026-05-03T00:00:00.000Z"
  }
}
```

Errores: `400`, `409`, `500`.

### `GET /api/auth/verify-email?token=...`

Verifica el email y devuelve JWT.

- Autenticacion: no requerida.
- Query params:

| Param | Tipo | Requerido |
| --- | --- | --- |
| `token` | string | si |

Respuesta `200`:

```json
{
  "message": "Correo verificado exitosamente. Ya puedes iniciar sesion.",
  "token": "jwt",
  "user": {
    "id": 1,
    "name": "Ana Perez",
    "email": "ana@example.com",
    "createdAt": "2026-05-03T00:00:00.000Z"
  }
}
```

Errores: `400` token requerido, invalido, usado o expirado.

### `POST /api/auth/login`

Inicia sesion si el email ya fue verificado.

Body:

```json
{
  "email": "ana@example.com",
  "password": "password123"
}
```

Respuesta `200`:

```json
{
  "message": "Sesion iniciada exitosamente",
  "token": "jwt",
  "user": {
    "id": 1,
    "name": "Ana Perez",
    "email": "ana@example.com",
    "createdAt": "2026-05-03T00:00:00.000Z"
  }
}
```

Errores: `400`, `401`, `403`.

### `POST /api/auth/resend-verification`

Reenvia correo de verificacion.

Body:

```json
{ "email": "ana@example.com" }
```

Respuesta `200`:

```json
{ "message": "Correo de verificacion reenviado. Revisa tu bandeja de entrada." }
```

Errores: `400`, `404`.

### `POST /api/auth/forgot-password`

Genera enlace de recuperacion con expiracion de 10 minutos.

Body:

```json
{ "email": "ana@example.com" }
```

Respuesta `200`:

```json
{ "message": "Revisa tu correo para acceder al enlace de recuperacion." }
```

Errores: `404`, `500`.

### `GET /api/auth/validate-reset-token?token=...`

Valida si un token de recuperacion sigue activo.

Respuesta `200`:

```json
{ "valid": true }
```

Errores: `400`, `410`.

### `POST /api/auth/reset-password`

Actualiza la contrasena.

Body:

```json
{
  "token": "reset-token",
  "password": "newPassword123"
}
```

Respuesta:

```json
{ "message": "Contrasena actualizada exitosamente." }
```

Errores: `400`, `410`.

## Usuarios

Todas las rutas requieren JWT.

### `GET /api/users/me`

Obtiene perfil autenticado.

Respuesta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ana Perez",
    "fullName": "Ana Perez",
    "email": "ana@example.com",
    "phone": "3001234567",
    "city": "Bogota",
    "heightCm": 170,
    "preferredBrands": ["YAMAHA", "HONDA"],
    "budgetRange": { "min": 0, "max": 12000000 },
    "monthlyMileage": 800,
    "createdAt": "2026-05-03T00:00:00.000Z",
    "updatedAt": "2026-05-03T00:00:00.000Z"
  }
}
```

### `PUT /api/users/me`

Actualiza perfil.

Body:

```json
{
  "fullName": "Ana Perez",
  "phone": "3001234567",
  "city": "Bogota",
  "heightCm": 170,
  "preferredBrands": ["YAMAHA", "HONDA"],
  "monthlyMileage": 800
}
```

Validacion:

- `fullName`: 2-200 requerido.
- `phone`: 7-20 caracteres, acepta numeros, espacios, `+`, `-`, parentesis.
- `city`: 2-100 requerido.
- `heightCm`: entero 140-220 requerido.
- `preferredBrands`: arreglo con al menos una marca.
- `monthlyMileage`: entero 0-100000 opcional.

Respuesta `200`: `{ "success": true, "message": "Perfil actualizado correctamente.", "data": { ... } }`.

### `PATCH /api/users/me/mileage`

Actualiza solo kilometraje mensual.

Body:

```json
{ "monthlyMileage": 1000 }
```

Respuesta `200`: perfil actualizado.

## Motos

### `GET /api/motorcycles`

Lista motos activas.

- Autenticacion: no requerida.
- Query params reales:

| Param | Tipo | Descripcion |
| --- | --- | --- |
| `brand` | string | marca exacta, case insensitive |
| `minPrice` | number | precio minimo |
| `maxPrice` | number | precio maximo |
| `minCc` | number | cilindraje minimo |
| `maxCc` | number | cilindraje maximo |
| `search` | string | busca en marca, modelo y descripcion |
| `limit` | number | limite de resultados, default `100` |

Sorting real: `brand asc`, `engineCc asc`.

Ejemplo:

```http
GET /api/motorcycles?brand=YAMAHA&minPrice=5000000&maxCc=250&search=fz&limit=20
```

Respuesta:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 10,
      "brand": "YAMAHA",
      "model": "FZ",
      "year": 2024,
      "engineCc": 150,
      "powerHp": "13.0",
      "price": "9800000",
      "currency": "COP",
      "imageUrl": "https://...",
      "description": "Moto urbana",
      "seatHeightCm": 79,
      "weightKg": "135.00",
      "fuelTankLiters": "13.00",
      "consumptionKmpl": "40.00",
      "segment": "Economica",
      "priceFormatted": "$ 9.800.000"
    }
  ]
}
```

### `GET /api/motorcycles/brands`

Lista marcas activas.

Respuesta:

```json
{
  "success": true,
  "count": 2,
  "data": ["AKT", "YAMAHA"]
}
```

### `GET /api/motorcycles/:id`

Obtiene detalle completo normalizado.

Errores: `404` si no existe.

## Favoritos

Todas las rutas requieren JWT.

### `GET /api/favorites/ids`

Devuelve solo IDs de motos favoritas.

Respuesta:

```json
{
  "success": true,
  "count": 2,
  "data": [10, 15]
}
```

### `GET /api/favorites`

Devuelve favoritos con datos de moto.

Respuesta:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "favoriteId": 5,
      "id": 10,
      "brand": "YAMAHA",
      "model": "FZ",
      "segment": "Economica",
      "priceFormatted": "$ 9.800.000",
      "addedToFavoritesAt": "2026-05-03T00:00:00.000Z"
    }
  ]
}
```

### `POST /api/favorites/:motorcycleId`

Agrega favorito. Es idempotente por `ON CONFLICT DO NOTHING`.

Respuesta `201`:

```json
{
  "success": true,
  "message": "Moto agregada a favoritos",
  "data": {
    "id": 5,
    "createdAt": "2026-05-03T00:00:00.000Z",
    "motorcycleId": 10
  }
}
```

Errores: `400` id invalido, `404` moto inexistente.

### `DELETE /api/favorites/:motorcycleId`

Elimina favorito.

Respuesta:

```json
{
  "success": true,
  "message": "Moto eliminada de favoritos",
  "data": {}
}
```

Errores: `404` si no estaba en favoritos.

## Comparacion e historial

Todas las rutas requieren JWT.

### `POST /api/comparisons`

Guarda una comparacion de 2 o 3 motos.

Body:

```json
{ "bikeIds": [10, 15, 20] }
```

Respuesta `201`:

```json
{ "data": { "saved": true } }
```

Errores: `400` si no hay entre 2 y 3 IDs.

### `GET /api/comparisons`

Lista las 20 comparaciones mas recientes.

Paginacion: no implementada; el servicio usa `LIMIT 20`.

Respuesta:

```json
{
  "data": [
    {
      "id": 1,
      "comparisonDate": "2026-05-03T00:00:00.000Z",
      "comparisonType": "general",
      "winnerBikeId": null,
      "bikes": [
        { "id": 10, "brand": "YAMAHA", "model": "FZ", "imageUrl": "...", "engineCc": 150 },
        { "id": 15, "brand": "HONDA", "model": "CB", "imageUrl": "...", "engineCc": 160 }
      ]
    }
  ]
}
```

### `DELETE /api/comparisons/:id`

Elimina una comparacion propia.

Respuesta: `{ "data": { "deleted": true } }`.

### `DELETE /api/comparisons`

Elimina todo el historial propio.

Respuesta: `{ "data": { "deleted": true } }`.

## Cuestionario

Todas las rutas requieren JWT.

### `POST /api/questionnaire`

Guarda o actualiza el cuestionario del usuario, elimina recomendaciones previas vinculadas al cuestionario y genera top 10 nuevas recomendaciones.

Body:

```json
{
  "budget": 12000000,
  "includesSoat": true,
  "includesRegistration": false,
  "usageType": "ciudad",
  "frequency": "diario",
  "hasPassenger": false,
  "passengerFrequency": null,
  "heightCm": 170,
  "weightKg": 70,
  "comfortWithHeavy": false
}
```

Validacion:

- `usageType`: `ciudad`, `carretera`, `mixto`, `offroad`, `trabajo`, `deporte`.
- `frequency`: `diario`, `semanal`, `fines_de_semana`, `ocasional`.
- `passengerFrequency`: `siempre`, `a_veces`, `nunca`.
- `heightCm`: entero 140-220 requerido.

Respuesta:

```json
{
  "questionnaire": {
    "id": 3,
    "userId": 1,
    "budget": "12000000",
    "usageType": "ciudad",
    "heightCm": 170
  },
  "recommendations": [
    {
      "id": 25,
      "compatibilityScore": 92,
      "reasons": ["Precio dentro de tu presupuesto", "Cilindraje ideal para uso urbano"],
      "warnings": [],
      "motorcycle": {
        "id": 10,
        "brand": "YAMAHA",
        "model": "FZ",
        "engineCc": 150,
        "price": "9800000"
      }
    }
  ]
}
```

### `GET /api/questionnaire/my`

Indica si el usuario tiene cuestionario.

Respuesta:

```json
{
  "exists": true,
  "questionnaire": {
    "id": 3,
    "completedAt": "2026-05-03T00:00:00.000Z"
  }
}
```

### `GET /api/questionnaire/my/profile`

Perfil resumido del cuestionario para comparacion.

Respuesta:

```json
{
  "exists": true,
  "profile": {
    "id": 3,
    "budget": "12000000",
    "heightCm": 170,
    "usageType": "ciudad",
    "completedAt": "2026-05-03T00:00:00.000Z"
  }
}
```

### `GET /api/questionnaire/my/recommendations`

Ruta real para consultar recomendaciones guardadas. No existe `/api/recommendations`.

Respuesta:

```json
{
  "recommendations": [
    {
      "id": 25,
      "compatibilityScore": 92,
      "reasons": ["Precio dentro de tu presupuesto"],
      "warnings": [],
      "motorcycle": {
        "id": 10,
        "brand": "YAMAHA",
        "model": "FZ",
        "year": 2024,
        "engineCc": 150,
        "price": "9800000",
        "currency": "COP"
      }
    }
  ],
  "questionnaire": {
    "id": 3,
    "budget": "12000000",
    "usageType": "ciudad",
    "heightCm": 170
  }
}
```

Sorting real: `compatibilityScore desc`, maximo 10.

## Feedback de recomendaciones

Todas las rutas requieren JWT.

### `GET /api/feedback/my?questionnaireId=3`

Consulta si el usuario ya califico esa generacion de recomendaciones.

Respuesta:

```json
{
  "success": true,
  "data": null
}
```

### `POST /api/feedback`

Crea feedback unico por usuario, cuestionario y firma de recomendaciones.

Body:

```json
{
  "questionnaireId": 3,
  "isUseful": true,
  "improvement": "Me gustaria filtrar por consumo."
}
```

Respuesta `201`:

```json
{
  "success": true,
  "message": "Gracias por tu feedback! Nos ayuda a mejorar.",
  "data": {
    "id": 1,
    "userId": 1,
    "questionnaireId": 3,
    "isUseful": true
  }
}
```

Errores: `404`, `400`, `409`.

### `GET /api/feedback/stats`

Estadisticas globales de feedback.

Respuesta:

```json
{
  "success": true,
  "data": {
    "total": 10,
    "useful": 8,
    "notUseful": 2,
    "satisfactionPercent": 80
  }
}
```

## Alertas de precio y notificaciones

Todas las rutas requieren JWT.

### `POST /api/price-alerts`

Crea alerta si la moto existe, no hay duplicado activo/pausado y el usuario tiene menos de 10 alertas activas.

Body:

```json
{
  "motorcycleId": 10,
  "targetPrice": 9000000,
  "notificationType": "BOTH"
}
```

`notificationType`: `EMAIL`, `IN_APP`, `BOTH`.

Respuesta `201`:

```json
{
  "success": true,
  "message": "Alerta de precio creada exitosamente.",
  "data": {
    "id": 1,
    "userId": 1,
    "motorcycleId": 10,
    "targetPrice": "9000000",
    "notificationType": "BOTH",
    "status": "ACTIVE",
    "motorcycle": {
      "id": 10,
      "brand": "YAMAHA",
      "model": "FZ",
      "year": 2024,
      "price": "9800000",
      "imageUrl": "https://..."
    }
  }
}
```

Errores: `403` limite, `404` moto inexistente, `409` duplicado.

### `GET /api/price-alerts?page=1&limit=10`

Lista alertas no eliminadas.

Paginacion real:

| Param | Default | Max |
| --- | --- | --- |
| `page` | `1` | sin max especifico |
| `limit` | `10` | `50` por Joi |

Respuesta:

```json
{
  "success": true,
  "message": "Listado de alertas obtenido.",
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

Sorting real: `createdAt desc`.

### `GET /api/price-alerts/:id`

Detalle de alerta propia.

Errores: `403` si no pertenece, `404` si no existe, `400` si esta eliminada.

### `PATCH /api/price-alerts/:id/pause`

Cambia estado a `PAUSED`.

Respuesta: alerta actualizada.

### `PATCH /api/price-alerts/:id/reactivate`

Cambia estado a `ACTIVE` si no supera el limite de 10 activas.

La validacion permite body opcional con:

```json
{
  "targetPrice": 8500000,
  "notificationType": "EMAIL"
}
```

Nota de implementacion: el servicio actual solo reactiva el estado y no aplica cambios a `targetPrice` ni `notificationType`.

### `DELETE /api/price-alerts/:id`

Soft delete: cambia estado a `DELETED`.

Respuesta:

```json
{
  "success": true,
  "message": "La alerta ha sido eliminada permanentemente.",
  "data": { "id": 1, "status": "DELETED" }
}
```

### `GET /api/price-alerts/history?page=1&limit=10`

Historial de notificaciones.

Respuesta:

```json
{
  "success": true,
  "message": "Historial de notificaciones obtenido.",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "alertId": 1,
      "motorcycleId": 10,
      "previousPrice": "9000000",
      "newPrice": "8800000",
      "type": "BOTH",
      "isRead": false,
      "sentAt": "2026-05-03T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Historial adicional: simulador de costos

### `GET /api/cost-simulator/info`

Publico. Devuelve informacion de calculos para tooltips.

### `GET /api/cost-simulator/calculate`

Publico con autenticacion opcional.

Query params:

| Param | Tipo | Requerido |
| --- | --- | --- |
| `motorcycleId` | number | si |
| `soatCost` | number | no |
| `registrationCost` | number | no |
| `vehicleTaxCost` | number | no |
| `userId` | number | no |
| `monthlyIncome` | number | no |

### `POST /api/cost-simulator/save`

Calcula y guarda solo si hay usuario autenticado. La ruta usa `optionalAuth`.

Body:

```json
{
  "motorcycleId": 10,
  "soatCost": 900000,
  "registrationCost": 500000,
  "vehicleTaxCost": 300000
}
```

### `GET /api/cost-simulator/history`

Requiere JWT. Query real: `limit`, `offset`.

### `GET /api/cost-simulator/:id`

Requiere JWT. Devuelve simulacion propia.

### `DELETE /api/cost-simulator/:id`

Requiere JWT. Elimina simulacion propia.

## Analitica de mercado

Rutas publicas:

- `GET /api/market-analysis/brands`
- `GET /api/market-analysis/segments`
- `GET /api/market-analysis/top-motorcycles`
- `GET /api/market-analysis/summary`

Respuesta base:

```json
{
  "success": true,
  "data": []
}
```

`summary` retorna:

```json
{
  "success": true,
  "data": {
    "brands": [],
    "segments": [],
    "topMotorcycles": [],
    "lastUpdated": "2026-05-03T00:00:00.000Z"
  }
}
```

## Analytics de compartir

### `POST /api/analytics/share`

Requiere JWT. Registra evento de compartir por WhatsApp.

Body:

```json
{
  "source": "comparison",
  "itemCount": 2,
  "messageLength": 350
}
```

Respuesta `201`:

```json
{ "success": true }
```

Errores: `400` si falta `source`.

## Resenas

### `GET /api/reviews?motorcycleId=10&page=1&limit=5`

Autenticacion opcional. Devuelve resumen, resenas, resena del usuario actual si hay token y paginacion.

Query:

- `motorcycleId`: requerido.
- `page`: default 1.
- `limit`: default 5, max 20.

Respuesta:

```json
{
  "success": true,
  "data": {
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 2
    },
    "reviews": [],
    "currentUserReview": null,
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalReviews": 2,
      "hasMore": false
    }
  }
}
```

### `POST /api/reviews`

Requiere JWT.

Body:

```json
{
  "motorcycleId": 10,
  "rating": 5,
  "comment": "Muy buena moto para ciudad y consumo bajo."
}
```

Validacion: `rating` 1-5, `comment` 20-500.

Errores: `400` palabra bloqueada, `404` moto no existe, `409` duplicado por indice unico.

### `PUT /api/reviews/:id`

Requiere JWT. Permite actualizar `rating`, `comment` o ambos.

### `DELETE /api/reviews/:id`

Requiere JWT. Elimina resena propia.

## Soporte

### `POST /api/support`

Publico. Envia email de soporte.

Body:

```json
{
  "name": "Ana Perez",
  "email": "ana@example.com",
  "message": "Necesito ayuda con una alerta.",
  "sourcePage": "/price-alerts"
}
```

Respuesta `201`:

```json
{
  "success": true,
  "message": "Tu mensaje fue enviado. Volviendo a MotorMatch...",
  "data": {
    "name": "Ana Perez",
    "email": "ana@example.com",
    "sourcePage": "/price-alerts"
  }
}
```

## Paginacion, filtros y sorting

| Endpoint | Paginacion | Filtros | Sorting real |
| --- | --- | --- | --- |
| `GET /api/motorcycles` | `limit` solamente | `brand`, `minPrice`, `maxPrice`, `minCc`, `maxCc`, `search` | `brand asc`, `engineCc asc` |
| `GET /api/price-alerts` | `page`, `limit` | usuario autenticado, status no `DELETED` | `createdAt desc` |
| `GET /api/price-alerts/history` | `page`, `limit` | usuario autenticado | `sentAt desc` |
| `GET /api/reviews` | `page`, `limit` | `motorcycleId` | `createdAt desc` |
| `GET /api/cost-simulator/history` | `limit`, `offset` | usuario autenticado | definido en servicio |
| `GET /api/comparisons` | `LIMIT 20` fijo | usuario autenticado | `comparison_date desc` |
| `GET /api/questionnaire/my/recommendations` | `take 10` fijo | usuario autenticado | `compatibilityScore desc` |

## Estructura OpenAPI friendly

Para migrar a Swagger/OpenAPI:

1. Crear `docs/api/openapi.yaml`.
2. Usar esta convencion de tags:
   - `Auth`
   - `Users`
   - `Motorcycles`
   - `Favorites`
   - `Comparisons`
   - `Questionnaire`
   - `Recommendations`
   - `PriceAlerts`
   - `Notifications`
   - `CostSimulator`
   - `MarketAnalysis`
   - `Reviews`
   - `Support`
3. Definir `BearerAuth`:

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

4. Convertir cada seccion de este documento a `paths`.
5. Derivar `schemas` desde `backend/prisma/schema.prisma` y `*.validation.js`.

TODO: agregar generacion automatica con `swagger-jsdoc` o mantener `openapi.yaml` versionado.
