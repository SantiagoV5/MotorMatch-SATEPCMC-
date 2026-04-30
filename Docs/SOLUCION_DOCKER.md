# Solucion: Error "unable to get image" en Docker

## El Problema  
Cuando Docker Desktop se cierra o no responde, obtienes este error:
```
unable to get image 'postgres:16-alpine': error during connect: 
Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/images/..."
The system cannot find the file specified.
```

## La Raiz del Problema
Docker Desktop no está corriendo. El "pipe" es un canal de comunicación entre tu PowerShell y Docker — si Docker Desktop está apagado, ese canal no existe.

## Solucion Permanente

### Opcion 1: Usar los Scripts (Recomendado)
Se creó un script `ensure-docker.ps1` que:
- Verifica si Docker está corriendo
- Si no está, lo inicia automáticamente
- Espera a que esté completamente listo
- Luego permite que continúe tu comando

**Todos tus scripts ahora lo usan automáticamente:**
```powershell
.\start.ps1      # Inicia Docker si está apagado, luego levanta los servicios
.\logs.ps1       # Inicia Docker si está apagado, luego muestra logs
.\stop.ps1       # Inicia Docker si está apagado, luego detiene servicios
```

**Ejemplo:**
```powershell
PS> .\start.ps1
✓ Docker ya está corriendo
Iniciando MotorMatch...
Modo DESARROLLO
Iniciando contenedores...
```

Si Docker estaba apagado:
```powershell
PS> .\start.ps1
Iniciando Docker Desktop...
⏳ Esperando a que Docker inicie...
✓ Docker está listo
Iniciando MotorMatch...
```

### Opcion 2: Ejecutar Manualmente (si es necesario)
Si necesitas ejecutar `docker compose` directamente sin pasar por los scripts:
```powershell
# Antes de cualquier comando docker, ejecuta:
.\ensure-docker.ps1

# Luego tus comandos normales:
docker compose up
docker compose logs -f
docker compose down
```

### Opcion 3: Habilitar Autostart de Docker Desktop (Opcional)
Para que Docker Desktop se inicie automáticamente cuando enciendes tu PC:

1. Abre Docker Desktop > Preferences (Configuración)
2. Ve a "General"
3. Marca "Start Docker Desktop when you log in"

## Archivos Creados/Modificados
- **ensure-docker.ps1** ← Script que verifica y reinicia Docker
- **start.ps1** ← Actualizado para usar ensure-docker.ps1
- **logs.ps1** ← Actualizado para usar ensure-docker.ps1  
- **stop.ps1** ← Actualizado para usar ensure-docker.ps1

## Resumen Rapido
```
┌─ ¿Docker Desktop está apagado?
│  ↓
├─ Usa cualquiera de tus scripts (start.ps1, logs.ps1, stop.ps1)
│  ↓
└─ Automáticamente se reinicia Docker y continúa el comando
```

**¡Nunca vuelvas a ver ese error!** 🎉
