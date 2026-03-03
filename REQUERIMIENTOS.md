# Requerimientos de MotorMatch

Este documento contiene los pasos necesarios para instalar y configurar el entorno de desarrollo para MotorMatch, tanto en Windows como en Linux.

## 📋 Stack Tecnológico

- **Frontend:** React, HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Base de datos:** Firestore
- **Control de versiones:** Git

---

## 🪟 Instalación en Windows

### Paso 1: Instalar Git

1. Descarga Git desde [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Ejecuta el instalador y sigue los pasos por defecto
3. Verifica la instalación abriendo PowerShell o CMD:
   ```cmd
   git --version
   ```

### Paso 2: Instalar Node.js

1. Descarga Node.js desde [https://nodejs.org/](https://nodejs.org/) (versión LTS recomendada)
2. Ejecuta el instalador (.msi)
3. Sigue los pasos del instalador (deja las opciones por defecto)
4. Verifica la instalación abriendo PowerShell o CMD:
   ```cmd
   node --version
   npm --version
   ```

### Paso 3: Instalar Visual Studio Code (Recomendado)

1. Descarga VS Code desde [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Ejecuta el instalador
3. Instala las extensiones recomendadas:
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint
   - Thunder Client (para pruebas de API)

### Paso 4: Clonar el repositorio

1. Abre PowerShell o CMD
2. Navega a la carpeta donde deseas clonar el proyecto:
   ```cmd
   cd ruta\donde\deseas\el\proyecto
   ```
3. Clona el repositorio:
   ```cmd
   git clone https://github.com/tu-usuario/MotorMatch.git
   cd MotorMatch
   ```

### Paso 5: Instalar dependencias del Backend

1. Abre PowerShell o CMD en la carpeta `Backend`
   ```cmd
   cd Backend
   ```
2. Instala las dependencias:
   ```cmd
   npm install
   ```
3. Verifica que la instalación fue exitosa:
   ```cmd
   npm list
   ```

### Paso 6: Instalar dependencias del Frontend

1. Abre PowerShell o CMD en la carpeta `Frontend` (desde la raíz del proyecto)
   ```cmd
   cd Frontend
   ```
2. Instala las dependencias:
   ```cmd
   npm install
   ```
3. Verifica que la instalación fue exitosa:
   ```cmd
   npm list
   ```

### Paso 7: Configurar variables de entorno

#### Backend (.env)
1. Navega a la carpeta `Backend/src`
2. Crea un archivo `.env`
3. Agrega las siguientes variables:
   ```
   PORT=5000
   NODE_ENV=development
   FIREBASE_API_KEY=tu_api_key
   FIREBASE_AUTH_DOMAIN=tu_auth_domain
   FIREBASE_PROJECT_ID=tu_project_id
   FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   FIREBASE_APP_ID=tu_app_id
   ```

#### Frontend (.env)
1. Navega a la carpeta `Frontend`
2. Crea un archivo `.env`
3. Agrega las siguientes variables:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

### Paso 8: Ejecutar el proyecto en Windows

#### Ejecutar Backend
1. Abre PowerShell en la carpeta `Backend`
2. Ejecuta:
   ```cmd
   npm start
   ```
   El servidor estará disponible en `http://localhost:5000`

#### Ejecutar Frontend
1. Abre otra PowerShell en la carpeta `Frontend`
2. Ejecuta:
   ```cmd
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`

---

## 🐧 Instalación en Linux

### Paso 1: Actualizar el sistema

Abre una terminal y ejecuta:
```bash
sudo apt-get update
sudo apt-get upgrade
```

### Paso 2: Instalar Git

```bash
sudo apt-get install git
```

Verifica la instalación:
```bash
git --version
```

### Paso 3: Instalar Node.js y npm

**Opción A: Usando NodeSource (Recomendado)**

```bash
# Descarga el script de configuración de NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

# Instala Node.js (incluye npm)
sudo apt-get install -y nodejs
```

**Opción B: Desde repositorios de Ubuntu**

```bash
sudo apt-get install nodejs npm
```

Verifica la instalación:
```bash
node --version
npm --version
```

### Paso 4: Instalar Visual Studio Code (Recomendado)

```bash
sudo snap install code --classic
```

O descargalo desde [https://code.visualstudio.com/](https://code.visualstudio.com/)

Instala las extensiones recomendadas:
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (para pruebas de API)

### Paso 5: Clonar el repositorio

1. Abre una terminal
2. Navega a la carpeta donde deseas clonar el proyecto:
   ```bash
   cd ~/Documentos
   ```
3. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/MotorMatch.git
   cd MotorMatch
   ```

### Paso 6: Instalar dependencias del Backend

1. En la terminal, navega a la carpeta Backend:
   ```bash
   cd Backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Verifica que la instalación fue exitosa:
   ```bash
   npm list
   ```

### Paso 7: Instalar dependencias del Frontend

1. En la terminal, navega a la carpeta Frontend (desde la raíz):
   ```bash
   cd Frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Verifica que la instalación fue exitosa:
   ```bash
   npm list
   ```

### Paso 8: Configurar variables de entorno

#### Backend (.env)
1. Navega a la carpeta `Backend/src`
2. Crea un archivo `.env`:
   ```bash
   touch .env
   ```
3. Abre el archivo con un editor (nano, vim, etc.):
   ```bash
   nano .env
   ```
4. Agrega las siguientes variables:
   ```
   PORT=5000
   NODE_ENV=development
   FIREBASE_API_KEY=tu_api_key
   FIREBASE_AUTH_DOMAIN=tu_auth_domain
   FIREBASE_PROJECT_ID=tu_project_id
   FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   FIREBASE_APP_ID=tu_app_id
   ```
5. Guarda el archivo (Ctrl+O, Enter, Ctrl+X)

#### Frontend (.env)
1. Navega a la carpeta `Frontend`
2. Crea un archivo `.env`:
   ```bash
   touch .env
   ```
3. Abre el archivo con un editor:
   ```bash
   nano .env
   ```
4. Agrega las siguientes variables:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```
5. Guarda el archivo (Ctrl+O, Enter, Ctrl+X)

### Paso 9: Ejecutar el proyecto en Linux

#### Ejecutar Backend
1. Abre una terminal en la carpeta `Backend`
2. Ejecuta:
   ```bash
   npm start
   ```
   El servidor estará disponible en `http://localhost:5000`

#### Ejecutar Frontend
1. Abre otra terminal en la carpeta `Frontend`
2. Ejecuta:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`

---

## 🔧 Herramientas Adicionales Recomendadas

### Para ambos sistemas operativos:

- **Postman o Thunder Client:** Para pruebas de API
- **DBeaver Community:** Para gestionar y visualizar datos en Firestore
- **Git GUI:** Para gestión visual de versiones (GitKraken, GitHub Desktop)

### Comandos útiles para desarrollo

**Backend:**
```bash
# Instalar dependencia nueva
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install --save-dev nombre-paquete

# Ejecutar en modo desarrollo con auto-reload
npm run dev

# Ejecutar linter
npm run lint

# Ejecutar pruebas
npm test
```

**Frontend:**
```bash
# Instalar dependencia nueva
npm install nombre-paquete

# Ejecutar en modo desarrollo
npm run dev

# Crear build de producción
npm run build

# Previsualizar build
npm run preview

# Ejecutar linter
npm run lint
```

---

## ✅ Verificación de la instalación

Para verificar que todo está correctamente instalado, ejecuta los siguientes comandos:

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Git
git --version
```

Todos deben mostrar números de versión sin errores.

---

## 🐛 Solución de problemas comunes

### "npm: command not found"
- **Windows:** Reinicia la terminal o la computadora después de instalar Node.js
- **Linux:** Verifica que Node.js se instaló correctamente con `which node`

### "Port 5000 already in use"
Cambia el puerto en el archivo `.env` del Backend e intenta nuevamente

### "Module not found"
Asegúrate de haber ejecutado `npm install` en la carpeta correspondiente

### Problemas con Firestore
Verifica que las credenciales de Firebase en el archivo `.env` sean correctas

---

## 📞 Contacto y Soporte

Si encuentras problemas durante la instalación, asegúrate de:
1. Tener instalados todos los requisitos previos
2. Usar versiones LTS de Node.js
3. Verificar los permisos de carpetas (especialmente en Linux)
4. Consultar la documentación oficial de cada herramienta

---

**Última actualización:** 26 de febrero de 2026
