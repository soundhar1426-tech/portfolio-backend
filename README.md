# Soundhar D M – Portfolio Backend API

Backend REST API for **Soundhar D M's Personal Developer Portfolio**, built with Node.js, Express, MongoDB (Mongoose), and JWT authentication.

---

## 🛠️ Features

- **MongoDB & Mongoose**: Schemas for dynamic Project & Certificate management.
- **JWT Protection**: Secured endpoints for management actions (Add, Edit, Delete).
- **Multer Uploads**: File upload handling for certificate PDFs and images.
- **Auto-Seeder**: Seeds initial projects and certificates on first launch.
- **CORS & Error Handling**: Robust error middleware and flexible cross-origin support.

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and fill in your values:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_or_local_connection_string
ADMIN_PASSWORD=your_secure_management_password
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

### 3. Run Server
```bash
# Development
npm run dev

# Production
npm start
```
*API runs on `http://localhost:5000`*

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/verify` – Verify admin password & receive JWT token

### Projects
- `GET /api/projects` – Get all projects
- `GET /api/projects/:id` – Get single project
- `POST /api/projects` *(Protected)* – Add new project
- `PUT /api/projects/:id` *(Protected)* – Update project
- `DELETE /api/projects/:id` *(Protected)* – Delete project

### Certificates
- `GET /api/certificates` – Get all certificates
- `GET /api/certificates/:id` – Get single certificate
- `POST /api/certificates` *(Protected, Multipart)* – Add certificate with PDF/Image
- `PUT /api/certificates/:id` *(Protected, Multipart)* – Update certificate
- `DELETE /api/certificates/:id` *(Protected)* – Delete certificate

### Health Check
- `GET /api/health` – API status check
