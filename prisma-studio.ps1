# ─────────────────────────────────────────────────────────────────────────────
# prisma-studio.ps1 - Abre Prisma Studio (visualizador de BD)
# ─────────────────────────────────────────────────────────────────────────────
# 
# Nota: Ejecutor está en el contenedor backend
#

Write-Host "🎨 Abriendo Prisma Studio..." -ForegroundColor Green
Write-Host "⏳ Cargando (esto puede tomar 10-15 segundos)..." -ForegroundColor Yellow

docker-compose exec backend npm run db:studio

Write-Host ""
Write-Host "✅ Prisma Studio cerrado" -ForegroundColor Green
