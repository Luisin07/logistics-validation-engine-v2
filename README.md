# Logistics Validation Engine v2

Fullstack migration of a logistics validation engine to a modern architecture using Node.js, Express, React, and PostgreSQL.

## Live

- **Frontend:** https://logistics-validation-engine-v2.vercel.app
- **API:** https://harmonious-strength-production-d485.up.railway.app/api/validate?cep=02001000

## Overview

This project simulates a delivery eligibility system used in real e-commerce operations. It validates ZIP codes against delivery regions, checks operational constraints, lead time rules, and slot capacity to determine delivery availability.

Built as a migration from a PHP monolith to a modern fullstack architecture with clear separation between frontend, backend, and data layers.

## Architecture

The project is split into two independent services:

**Backend** — Node.js + Express REST API deployed on Railway
- `src/routes/validate.js` — HTTP layer, receives and validates input
- `src/services/logisticsService.js` — business logic and database queries
- `db.js` — PostgreSQL connection pool

**Frontend** — React app deployed on Vercel
- Consumes the REST API
- Displays delivery availability, slots, and freight info

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** React
- **Database:** PostgreSQL
- **Deploy:** Railway (API + DB), Vercel (frontend)

## API
GET /api/validate?cep={cep}

**Response (success):**
```json
{
  "success": true,
  "region": "Bairro B",
  "freight": "R$ 8,00",
  "available_slots": [...],
  "unavailable_slots": [...]
}
```

**Test cases:**
- `02001000` → delivery available
- `01005000` → blocked ZIP
- `03001000` → blocked region
- `99999999` → outside coverage area

## Database Schema

```sql
cep_ranges        → regions and ZIP code ranges
blocked_locations → blocked ZIPs and regions
region_rules      → allowed delivery weekdays per region
slots             → delivery time slots with capacity control
```

## How to Run Locally

```bash
# Backend
cd backend
npm install
DATABASE_URL=your_postgres_url node index.js

# Frontend
cd frontend
npm install
REACT_APP_API_URL=http://localhost:3000 npm start
```

## Origin

This is a migration of the original PHP version:
https://github.com/Luisin07/logistics-validation-engine

The business logic was preserved and the architecture was restructured into a REST API consumed by a React frontend, with data migrated from hardcoded arrays to a PostgreSQL database.

## Author

Luis Otavio Santini Feitosa
[LinkedIn](https://www.linkedin.com/in/luis-santini) · [GitHub](https://github.com/Luisin07)
