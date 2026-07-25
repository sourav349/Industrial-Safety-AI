# HumanShield AI Enterprise Frontend

This is a complete React/Vite frontend for the HumanShield AI PPE monitoring backend.

## Included features

- Enterprise sidebar and multi-page navigation
- Dashboard KPIs
- Live camera stream
- Camera start and stop controls
- Worker compliance cards
- Incident management
- Multi-camera health view
- Analytics charts
- Alerts
- AI insights
- PDF and CSV reports
- Dark mode
- Demo role-based login
- Local AI assistant
- Settings persistence
- Responsive layout

## Install

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Demo logins

- Admin: `admin / admin123`
- Supervisor: `supervisor / super123`
- Viewer: `viewer / viewer123`

## Backend

Start FastAPI at `http://127.0.0.1:8000`.

Your backend must allow CORS:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Important

Some enterprise features are frontend demonstrations until matching backend endpoints are added:

- True multi-camera streaming
- Persistent users and RBAC
- Email/SMS/voice alerts
- LLM-backed AI assistant and insights
- Predictive risk scoring
- Zone heat-map coordinates
- Saved settings in a database

The current FastAPI endpoints are fully integrated for the live camera, workers, incidents, and dashboard summary.
