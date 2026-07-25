<img width="1280" height="720" alt="samples" src="https://github.com/user-attachments/assets/85b360ad-604c-43de-a4bc-bfaa69805efc" />


# 📂 Project Structure

The project is organized into a modular architecture with separate backend and frontend components. Each folder has a specific responsibility, making the codebase scalable, maintainable, and easy to navigate.

```text
HumanShield-AI/
│
├── backend/                      # FastAPI backend and AI services
│   ├── app/                      # Application initialization and shared modules
│   │
│   ├── api/                      # REST API endpoints
│   │   ├── camera.py             # Camera stream APIs
│   │   ├── incidents.py          # Incident management APIs
│   │   ├── dashboard.py          # Dashboard statistics APIs
│   │   └── health.py             # Health check endpoint
│   │
│   ├── services/                 # Core AI and business logic
│   │   ├── detector.py           # YOLO-based PPE detection
│   │   ├── tracker.py            # Multi-object tracking
│   │   ├── ppe_association.py    # Associates PPE items with workers
│   │   ├── compliance_engine.py  # PPE compliance verification
│   │   ├── risk_engine.py        # Risk level assessment
│   │   ├── incident_service.py   # Incident creation and management
│   │   ├── report_service.py     # Report generation
│   │   └── stream_service.py     # Video streaming service
│   │
│   ├── database/                 # Database models and configuration
│   │   ├── models.py             # SQLAlchemy models
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   └── database.py           # Database connection
│   │
│   ├── utils/                    # Utility functions and helper modules
│   ├── config.py                 # Project configuration
│   └── main.py                   # FastAPI application entry point
│
├── frontend/                     # React.js frontend
│   ├── src/
│   │   ├── pages/                # Main application pages
│   │   │   ├── Dashboard/        # Dashboard UI
│   │   │   ├── LiveMonitoring/   # Live monitoring interface
│   │   │   ├── Incidents/        # Incident history page
│   │   │   ├── Analytics/        # Analytics and reports
│   │   │   └── Settings/         # User settings
│   │   │
│   │   ├── components/           # Reusable React components
│   │   └── services/             # API service functions
│   │
│   └── package.json              # Frontend dependencies
│
├── models/                       # Trained AI models
│   └── best.pt                   # Best YOLO model weights
│
├── data/                         # Dataset, images, and videos
│
├── docker-compose.yml            # Docker Compose configuration
│
└── README.md                     # Project documentation
```

## 📁 Folder Description

| Folder/File | Description |
|-------------|-------------|
| **backend/** | Contains the FastAPI backend, AI inference pipeline, business logic, and database configuration. |
| **backend/api/** | Defines REST API endpoints consumed by the frontend. |
| **backend/services/** | Implements the AI pipeline including detection, tracking, PPE compliance, and risk analysis. |
| **backend/database/** | Database models, schemas, and database connection setup. |
| **backend/utils/** | Helper functions and utility modules. |
| **frontend/** | React.js application providing the user interface. |
| **frontend/src/pages/** | Individual application pages such as Dashboard, Analytics, and Live Monitoring. |
| **frontend/src/components/** | Shared UI components used across multiple pages. |
| **frontend/src/services/** | Functions for communicating with backend APIs. |
| **models/** | Stores trained YOLO model weights used for PPE detection. |
| **data/** | Contains datasets, sample images, videos, or other input data. |
| **docker-compose.yml** | Docker configuration for running the complete application. |
| **README.md** | Project documentation, setup guide, and usage instructions. |

## 🏗️ Architecture Overview

```text
                +----------------------+
                |    React Frontend    |
                +----------+-----------+
                           |
                    REST API Requests
                           |
                           ▼
                +----------------------+
                |    FastAPI Backend   |
                +----------+-----------+
                           |
        +------------------+------------------+
        |                  |                  |
        ▼                  ▼                  ▼
  YOLO Detector      PPE Compliance      Database
  Object Tracker      Risk Engine       Incident Logs
        |                  |                  |
        +------------------+------------------+
                           |
                           ▼
                  Analytics & Reports
```


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
