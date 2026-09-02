# MediKiosk API & Frontend
An AI-Powered Patient Case-Taking and Pre-Consultation Platform

## Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 16 (if running locally without Docker)

## Environment Configuration
1. In the `backend/` directory, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   **Security Note:** Do not commit your real `.env` file containing API keys or database credentials to version control. The application supports `LLM_PROVIDER=mock` and `OCR_PROVIDER=mock` for local development without keys.

2. In the `frontend/` directory, you can configure the backend URL via `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

## Option A: Running with Docker Compose (Recommended)
You can start the entire application (PostgreSQL, Backend API, Next.js Frontend) using Docker Compose.

```bash
docker-compose up --build -d
```
- Backend API is available at `http://localhost:8000/api/v1/health`
- Frontend is available at `http://localhost:3000`
- PostgreSQL data is persisted in a named volume (`postgres_data`).

## Option B: Local Development Setup

### 1. Start PostgreSQL
```bash
docker-compose up db -d
```

### 2. Backend Setup & Migrations
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
python -m alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Running Tests
**Backend (Pytest)**
```bash
cd backend
pytest tests/ -v
```

**Frontend (Vitest)**
```bash
cd frontend
npm run test
```

**Frontend E2E (Playwright)**
Make sure the backend API and Next.js frontend are building and running, then:
```bash
cd frontend
npm run build
npx playwright test
```

## Mock Integrations & Demo Data
The application defaults to mock providers for external integrations to prevent PHI transmission and ensure a robust demo:
- **LLM/OCR:** `LLM_PROVIDER=mock` and `OCR_PROVIDER=mock` simulate AI extraction perfectly.
- **ABHA/FHIR:** Mock adapters generate synthetically compliant FHIR R4 bundles and ABHA linking responses without real ABDM API calls.
*Note: Demo data and identifiers (e.g., John Doe, patient-123) are purely synthetic. Real patient data must never be used in this environment.*

## Security & Privacy Limitations
- **Safety Disclaimer**: The AI features are strictly limited to extraction and summation. The deterministic Clinical Engine manages pathways, and **no autonomous diagnosis, prescription, or clinical inference features are present**. The system operates strictly as an information-assistance layer for physicians.
- **Authentication**: This MVP architecture currently defers strict production user authentication. A simple `patient_id` lookup is used for the kiosk flow. 
- **Session State**: Basic patient demographics (Name, Age, Sex, Consultation ID) are temporarily stored in local browser storage (`localStorage`) to support kiosk session-resilience. This is cleared automatically upon consultation completion, but should be noted for shared physical kiosk deployments.
