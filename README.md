# My Wallet App

Una aplicación de monedero digital que permite a los usuarios registrarse vía OTP, consultar saldo, transferir dinero y ver su historial de transacciones. Con backend en Node.js/Express + PostgreSQL y frontend móvil en React Native.

---

## 📑 Tabla de contenidos

- [Características](#-características)  
- [Tecnologías](#-tecnologías)  
- [Prerequisitos](#-prerequisitos)  
- [Backend](#backend)  
  - [Instalación](#instalación)  
  - [Variables de entorno](#variables-de-entorno)  
  - [Ejecución local](#ejecución-local)  
  - [Documentación de la API](#documentación-de-la-api)  
  - [Endpoints](#endpoints)  
  - [Pruebas & Lint](#pruebas--lint)  
  - [Docker](#docker)  
- [Mobile (React Native)](#mobile-react-native)  
  - [Instalación](#instalación-1)  
  - [Ejecución](#ejecución)  
  - [Lint & Pruebas](#lint--pruebas)  
- [CI/CD](#cicd)  
- [Licencia](#licencia)  

---

## 🔑 Características

1. **US01 – Login & OTP**  
   - Registro/Login por número de celular + OTP (“123456” simulado).  
   - JWT para autenticación.  

2. **US02 – Consulta de Saldo**  
   - Ver saldo en tiempo real.  
   - Refresh y manejo de expiración de token.  

3. **US03 – Transferir Dinero**  
   - Transferencia segura a otro usuario.  
   - Validaciones de monto y existencia de usuario.  

4. **US04 – Historial de Transacciones**  
   - Lista paginada (10 ítems/page).  
   - Detalle de fecha, origen, destino, monto y estado.  

---

## 🛠️ Tecnologías

- **Backend**: Node.js v20, Express, Sequelize (PostgreSQL), Swagger / OpenAPI  
- **Mobile**: React Native, TypeScript, React Navigation  
- **Infra & DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD)  

---

## 🚧 Prerequisitos

- **Node.js** v20+  
- **Yarn**  
- **Docker & Docker Compose**  
- **Android Studio / Xcode** (para emuladores móviles)  

---

## Backend

### 🔧 Instalación

```bash
git clone https://github.com/maikop12345/my-wallet-app.git
cd my-wallet-app/backend/express-api
yarn install
```

## ⚙️ Variables de entorno
---
Crea un archivo .env en backend/express-api/ con:
---
```bash
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=tu_password
DB_NAME=walletdb
JWT_SECRET=una_clave_secreta
```

## ▶️ Ejecución local
---
Con nodemon (carga automática al cambiar código):
---
```bash
yarn dev
```
Con Docker Compose (levanta Postgres + API):

```bash
cd infra
docker-compose up -d
# API en http://localhost:3001
```
## 📄 Documentación de la API
Accede a Swagger UI en:

```bash
http://localhost:3000/docs
```
Allí encontrarás esquemas de requests, responses y códigos de error.

## 🔌 Endpoints
Método	Ruta	Descripción	Payload / Query	Respuestas
POST	/otp	Genera OTP si usuario existe	{ phone: "3001234567" }	200 { success, message }
404/400 { error }
POST	/login	Valida OTP y retorna JWT	{ phone, otp }	200 { token }
400/401 { error }
GET	/saldo	Devuelve { balance, name }	Header Authorization: Bearer <token>	200 { balance, name }
401/404
POST	/transferir	Realiza transferencia	{ to, amount }	200 { success, newBalance, transfer }
400/404
GET	/transferencias	Lista paginada de transferencias	Query ?page=1&pageSize=10 + auth	200 { transfers[], pagination }
401
GET	/health	Health‑check	—	200 { status: "ok" }

## 🔍 Pruebas & Lint
```bash
# Lint (ESLint)
yarn lint

# Tests unitarios (Jest + Supertest)
yarn test --coverage
```
## 🐳 Docker
Build imagen:

```bash
docker build -t wallet-backend:latest .
```
Run contenedor:

```bash
docker run --rm -p 3000:3000 --env-file .env wallet-backend:latest
```
# Mobile (React Native)
## 🔧 Instalación
```bash
cd my-wallet-app/mobile/WalletApp
yarn install
```
## ▶️ Ejecución

Android:

```bash
npx react-native run-android
```
iOS:

```bash
npx pod-install
npx react-native run-ios
```
## 🔍 Lint & Pruebas
```bash
Editar
# Lint
yarn lint

# Tests (Jest + React Native Testing Library)
yarn test
```
## ⚙️ CI/CD
GitHub Actions

backend: lint → test → build & push Docker image

mobile: lint → test

Despliegue automatizado sobre merge en main (SSH / Kubernetes / ECS).

📜 Entrega
© Maikol Ramirez