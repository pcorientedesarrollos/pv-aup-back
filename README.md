# AUP POS - Backend (NestJS)

Este es el repositorio del backend para el sistema AUP POS, construido con NestJS y TypeORM.

## Configuración y Ejecución (Entorno Local)

1. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
2. Configura las variables de entorno:
   Duplica el archivo `.env.example` (si existe) y renómbralo a `.env`.
   Asegúrate de configurar los siguientes parámetros:
   - Configuración de la base de datos (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
   - Secretos para la generación de tokens JWT.
   - Credenciales de la API de Facturama (para timbrado CFDI 4.0).
3. Levanta el servidor de desarrollo:
   ```bash
   npm run start:dev
   ```
   El backend se ejecutará típicamente en el puerto `http://localhost:3000`.

## Despliegue a Producción (Railway)

Este repositorio está conectado a **Railway** para despliegue continuo. 
Cualquier `git push origin dev` (o master) actualizará automáticamente el backend y correrá las migraciones si es necesario.
