# Face Recognition Attendance System (MERN + ML)

Production-style full-stack attendance application with AI face recognition.

## Architecture

React Frontend captures webcam image -> Node.js/Express Backend -> Python Flask ML Service -> MongoDB

## Core Features

- User registration/login with JWT
- Face data enrollment per user
- Real-time face recognition to mark attendance
- Admin analytics dashboard with attendance metrics
- Input validation and role-based authorization

## Project Structure

- `frontend/` React + Vite client app
- `backend/` Express API, JWT auth, MongoDB models
- `ml-service/` Flask API using OpenCV + face-recognition
- `docker-compose.yml` MongoDB + ML service for local development

## Backend API Highlights

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/users/register-face` (auth)
- `POST /api/attendance/mark` (auth)
- `GET /api/attendance/me` (auth)
- `GET /api/attendance/admin/summary` (admin)

## Local Setup

### 1) Start MongoDB and ML service

```bash
docker compose up --build
```

### 2) Run backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3) Run frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend default: `http://localhost:5173`
Backend default: `http://localhost:5000`
ML service default: `http://localhost:8000`

## Environment Variables

### backend/.env

- `PORT=5000`
- `MONGO_URI=mongodb+srv://kurakulagowtham54_db_user:Gowtham%404949@cluster0.dcmjp0a.mongodb.net/`
- `JWT_SECRET=replace_with_secure_secret`
- `JWT_EXPIRES_IN=1d`
- `ML_SERVICE_URL=http://localhost:8000`
- `CLIENT_URL=http://localhost:5173`

### frontend/.env

- `VITE_API_URL=http://localhost:5000/api`

## Deployment Plan

### Frontend (Vercel)

- Import `frontend/` project
- Set `VITE_API_URL` to deployed backend URL

### Backend (Render or AWS)

- Deploy `backend/` as Node service
- Set env variables from `.env.example`
- Use managed MongoDB URI

### ML Service (Dockerized)

- Build `ml-service/Dockerfile`
- Deploy to Render, AWS ECS, or any container host
- Persist `ml-service/data/encodings.pkl` on volume for production

## Security Notes

- JWT auth with protected routes
- Role-based admin access
- Request payload validation via `express-validator`
- Helmet and CORS middleware

## Next Improvements

- Liveness detection (blink/challenge) to prevent spoofing
- Multi-sample registration workflow and quality scoring
- Attendance duplicate prevention policy (e.g., one mark/day)
- Audit logs and alerts for failed recognition attempts
