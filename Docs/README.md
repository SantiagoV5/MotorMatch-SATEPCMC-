# Documentacion de MotorMatch

Esta carpeta concentra la documentacion profesional del proyecto. Fue generada a partir de la estructura real del repositorio, incluyendo `backend/src/modules`, `backend/prisma/schema.prisma`, scripts npm, Docker, Kubernetes y frontend.

## Navegacion

- [API REST](api/README.md): endpoints reales, autenticacion, cuerpos, respuestas, errores y notas OpenAPI friendly.
- [Base de datos](database/README.md): entidades Prisma, relaciones, enums, indices, ERD y escalabilidad.
- [Sistema de recomendaciones](recommendation-system/README.md): scoring, ponderaciones, formulas, pseudocodigo y mejoras.
- [Guia de usuario](user-guide/README.md): pasos para usuarios finales y placeholders de capturas.
- [Despliegue](deployment/README.md): backend, frontend, Supabase, Docker, Kubernetes, seguridad y CI/CD.
- [Mantenimiento](maintenance/README.md): estrategia documental, QA, pre-despliegue y roadmap.

## Guias existentes preservadas

- [Docker cheatsheet](DOCKER_CHEATSHEET.md)
- [Guia Docker](GUIA_DOCKER.md)
- [Quickstart](QUICKSTART.md)
- [Solucion Docker](SOLUCION_DOCKER.md)
- [Guia kubernetes](GUIA_KUBERNETES.md)

## Convenciones

- Las rutas se documentan con el prefijo real `/api`.
- Los ejemplos usan JSON representativo, no contratos inventados.
- Cuando una funcionalidad no tiene endpoint dedicado, se indica explicitamente.
- Los TODO corresponden a informacion que debe completarse manualmente o a piezas no existentes en el repo.

## Actualizacion recomendada

Actualiza estos documentos cuando cambie alguno de estos archivos:

- `backend/src/app.js`
- `backend/src/modules/**/*.routes.js`
- `backend/src/modules/**/*.validation.js`
- `backend/prisma/schema.prisma`
- `backend/src/modules/recommendations/recommendation.algorithm.js`
- `backend/src/workers/priceAlerts.worker.js`
- `Frontend/src/App.jsx`
- `Frontend/src/services/apiClient.js`
- `docker-compose*.yml`
- `k8s/**`
