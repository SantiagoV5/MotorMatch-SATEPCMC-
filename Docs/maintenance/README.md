# Mantenimiento, QA y roadmap

[Volver al indice](../README.md)

## Mantener la documentacion actualizada

Actualiza la documentacion en la misma PR donde cambie el codigo. Para evitar desalineacion:

| Si cambia | Actualizar |
| --- | --- |
| `backend/src/modules/**/*.routes.js` | `docs/api/README.md` |
| `backend/src/modules/**/*.validation.js` | cuerpos, query params y errores en API |
| `backend/prisma/schema.prisma` | `docs/database/README.md` |
| `backend/src/modules/recommendations/recommendation.algorithm.js` | `docs/recommendation-system/README.md` |
| `backend/src/workers/priceAlerts.worker.js` | database, deployment y API de alertas |
| `Frontend/src/App.jsx` | guia de usuario y README |
| `docker-compose*.yml` | README y deployment |
| `k8s/**` | deployment |

## Estrategia futura Swagger/OpenAPI

1. Crear `docs/api/openapi.yaml`.
2. Definir schemas base desde Prisma:
   - `User`
   - `Motorcycle`
   - `Questionnaire`
   - `Recommendation`
   - `Favorite`
   - `Comparison`
   - `PriceAlert`
   - `NotificationHistory`
3. Definir request DTOs desde Joi:
   - `registerSchema`
   - `loginSchema`
   - `updateUserSchema`
   - `questionnaireSchema`
   - `createAlertSchema`
   - `createReviewSchema`
4. Montar Swagger UI en desarrollo:

```text
GET /api/docs
```

5. No publicar Swagger en produccion sin proteccion si expone detalles internos.

## Checklist QA funcional

- [ ] Registro crea usuario sin token.
- [ ] Verificacion de email devuelve JWT.
- [ ] Login bloquea usuarios no verificados.
- [ ] Recuperacion de contrasena expira correctamente.
- [ ] `GET /api/motorcycles` filtra por marca, precio, cilindraje y texto.
- [ ] `GET /api/motorcycles/brands` devuelve marcas ordenadas.
- [ ] Favoritos no duplica registros.
- [ ] Comparacion exige 2 o 3 motos.
- [ ] Cuestionario genera maximo 10 recomendaciones.
- [ ] Recomendaciones quedan ordenadas por score descendente.
- [ ] Feedback no permite duplicar por generacion.
- [ ] Alertas limitan 10 activas por usuario.
- [ ] Alertas no permiten duplicados activos/pausados por moto.
- [ ] Worker respeta cooldown de 48 horas.
- [ ] Historial de notificaciones pagina correctamente.
- [ ] Resenas validan rating y longitud.
- [ ] Soporte envia correo o reporta error controlado.

## Checklist QA tecnico

- [ ] `npm install` backend funciona en limpio.
- [ ] `npm install` frontend funciona en limpio.
- [ ] `npm run db:generate` exitoso.
- [ ] `npm run build` frontend exitoso.
- [ ] Docker Compose levanta backend, frontend y db.
- [ ] `/api/health` responde en Docker.
- [ ] Vite proxy no duplica `/api`.
- [ ] Nginx sirve rutas SPA con refresh directo.
- [ ] Kubernetes probes responden.
- [ ] No hay secrets en commits.

## Checklist pre-despliegue

- [ ] Dominio definido.
- [ ] HTTPS configurado.
- [ ] Variables de entorno reales cargadas.
- [ ] Base de datos productiva separada de desarrollo.
- [ ] Backups habilitados.
- [ ] Migraciones revisadas.
- [ ] Seed productivo aprobado.
- [ ] SMTP productivo probado.
- [ ] CORS limitado al dominio real.
- [ ] Rate limiting agregado o riesgo aceptado.
- [ ] Worker de alertas ejecutandose una sola vez.
- [ ] Plan de rollback documentado.

## TODO manual detectado

- Completar screenshots reales en `docs/assets/screenshots/`.
- Crear migraciones Prisma versionadas.
- Revisar `backend/scripts/updatePrices.js`, actualmente vacio.
- Revisar `backend/scripts/importBikes.js` y `enrichBike.js`: usan nombres de campos historicos que deben validarse contra el schema actual antes de ejecutarlos en datos reales.
- Agregar GitHub Actions en `.github/workflows/`.
- Agregar rate limiting y Helmet.
- Definir estrategia de worker independiente si se despliega con replicas.
- Agregar pruebas reales; existen archivos de test vacios o minimos.

## Roadmap futuro

### Producto

- Mejorar filtros de catalogo por consumo, peso y altura de asiento.
- Agregar vista de alertas in-app no leidas.
- Permitir editar precio objetivo y tipo de notificacion al reactivar alertas.
- Agregar recomendaciones por contexto: ciudad, carretera, trabajo, pasajero.
- Agregar explicacion visual del puntaje por categoria.

### Backend

- Publicar OpenAPI.
- Versionar DTOs.
- Separar worker de alertas.
- Agregar colas.
- Agregar tests de integracion para auth, cuestionario, favoritos y alertas.
- Evitar SQL raw donde Prisma ya pueda cubrir el modelo actualizado.

### Frontend

- Completar estados de carga y error por feature.
- Agregar tests de componentes principales.
- Mejorar accesibilidad.
- Agregar snapshots visuales para vistas clave.

### Datos

- Definir fuente confiable para actualizacion de precios.
- Guardar historico de precios por moto.
- Agregar calidad de datos: campos obligatorios, rangos y auditoria.
- Crear estrategia de limpieza para notificaciones antiguas.

### Infraestructura

- CI/CD completo.
- Ambientes `dev`, `staging`, `prod`.
- Observabilidad con metricas y alertas.
- Secret management formal.
- Backups y restauracion probada.
