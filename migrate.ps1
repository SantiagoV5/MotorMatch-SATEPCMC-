# ─────────────────────────────────────────────────────────────────────────────
# migrate.ps1 - Ejecuta migraciones de Prisma en el contenedor
# ─────────────────────────────────────────────────────────────────────────────
# 
# Uso:
#   .\migrate.ps1        # Ejecutar migraciones
#   .\migrate.ps1 -seed  # Importar motos desde CSV
#

param(
    [switch]$seed
)

Write-Host "🔄 Ejecutando migraciones de Prisma..." -ForegroundColor Green

if ($seed) {
    Write-Host "🌱 También importando datos de motos..." -ForegroundColor Cyan
    docker-compose exec backend npm run db:migrate
    Write-Host ""
    Write-Host "📊 Importando motos desde CSV..." -ForegroundColor Yellow
    docker-compose exec backend npm run import-bikes
    Write-Host "✅ Motos importadas correctamente" -ForegroundColor Green
} else {
    docker-compose exec backend npm run db:migrate
    Write-Host "✅ Migraciones completadas" -ForegroundColor Green
}

Write-Host "`n💡 Para ver la BD: .\prisma-studio.ps1" -ForegroundColor Yellow
