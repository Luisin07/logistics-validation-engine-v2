# Logistics Validation Engine v2

Fullstack migration of the logistics validation engine to a modern architecture using Node.js, Express, and React.

## Live Demo

- **API:** https://logistics-validation-engine-v2-production.up.railway.app/api/validate?cep=02001000
- **Frontend:** em breve

## About

This project is a migration of the original PHP-based logistics validation engine to a modern fullstack architecture. The goal was to separate backend logic into a REST API and build a React frontend to consume it.

The system validates ZIP codes against delivery regions, checks operational constraints, lead time rules, and slot capacity to determine delivery eligibility.

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** React
- **Deploy:** Railway (API), Vercel (frontend)

## Architecture
logistics-v2/
├── backend/   → REST API (Node.js + Express)
└── frontend/  → UI (React)

## API
GET /api/validate?cep={cep}

**Test cases:**
- `02001000` → delivery available
- `01005000` → blocked ZIP
- `03001000` → blocked region
- `99999999` → outside coverage area

## Why This Project

Built from real experience with e-commerce logistics operations. The validation logic reflects actual delivery scheduling systems with region mapping, slot capacity control, and lead time enforcement.

## Author

Luis Otavio Santini Feitosa  
[LinkedIn](https://www.linkedin.com/in/luis-santini) · [GitHub](https://github.com/Luisin07)