# Prevalentware - Prueba Técnica Fullstack

Este proyecto es una aplicación de gestión financiera que permite registrar ingresos y egresos, gestionar usuarios y visualizar reportes detallados. Implementado con una arquitectura de **Atomic Design** para asegurar escalabilidad y mantenibilidad.

## 🚀 Tecnologías Utilizadas

- **Frontend:** Next.js (Pages Router), TypeScript, Tailwind CSS.
- **UI Components:** Shadcn UI, Lucide React.
- **Estado Global:** Jotai (Atoms).
- **Data Fetching:** TanStack Query (React Query).
- **Autenticación:** Better Auth con GitHub Provider.
- **Base de Datos:** PostgreSQL (Supabase) con Prisma ORM.
- **Documentación:** Swagger / OpenAPI.

## 🛠️ Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd prueba-tecnica-fullstack
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://..."

# Better Auth Configuration
BETTER_AUTH_SECRET="generar_un_secreto_aleatorio"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (Requerido)
# 1. Ve a GitHub > Settings > Developer Settings > OAuth Apps > New OAuth App
# 2. Homepage URL: http://localhost:3000
# 3. Authorization callback URL: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID="tu_client_id"
GITHUB_CLIENT_SECRET="tu_client_secret"

# App Public URL
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Preparar la Base de Datos
El proyecto utiliza **Prisma** como adaptador para gestionar las sesiones y usuarios en la base de datos. Sincroniza el esquema:
```bash
npx prisma db push
```

### 5. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## 📖 Documentación de la API

La documentación interactiva de la API (Swagger) está disponible en la siguiente ruta una vez que el servidor esté corriendo:
- [http://localhost:3000/docs](http://localhost:3000/docs)

## 🧪 Pruebas Unitarias e Integración

El proyecto incluye una suite de pruebas para asegurar la integridad de las partes más críticas del sistema:

1.  **`movements.test.ts` (Lógica de Negocio):** Verifica que los cálculos de saldos, ingresos y egresos sean exactos. Es vital para la fiabilidad de los reportes financieros.
2.  **`permissions.test.ts` (Seguridad del Servidor):** Prueba la lógica de autorización en el backend, asegurando que el sistema RBAC bloquee o permita acciones según el rol del usuario en la base de datos.
3.  **`permission-guard.test.tsx` (Integridad de UI):** Valida que los componentes de la interfaz se oculten o muestren correctamente según los permisos del usuario, garantizando una experiencia de usuario segura y coherente.

Para ejecutar las pruebas:
```bash
npm test
```

## 🚢 Despliegue en Vercel

1. Sube el código a un repositorio de GitHub.
2. Conecta el repositorio en el dashboard de Vercel.
3. Configura las variables de entorno mencionadas anteriormente en la sección "Environment Variables" de Vercel.
4. Vercel detectará automáticamente Next.js y realizará el despliegue.

---

### Notas de Implementación
- **RBAC:** Se implementó un sistema de control de acceso basado en roles y permisos granulares.
- **Atomic Design:** Los componentes están organizados en Átomos, Moléculas, Organismos y Plantillas.
- **Optimización:** La carga inicial de datos se optimizó para reducir latencia y evitar waterfalls de red.
- **Demo:** Por requerimiento, todos los nuevos usuarios registrados vía GitHub son asignados automáticamente con el rol **ADMIN** y para comodidad del evaluador se agrego un switch en la navbar que permite cambiar entre **ADMIN** y **USER**.