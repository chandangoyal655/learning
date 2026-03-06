# 🅿️ ParkIQ — Smart Parking System
### Node.js + Express Backend

---

## 📁 Project Structure

```
parkiq/
├── server.js          ← Express server (entry point)
├── package.json       ← Dependencies
├── README.md          ← This file
├── data/
│   └── store.js       ← In-memory data store (slots + bookings)
├── routes/
│   ├── slots.js       ← GET /api/slots/*
│   └── bookings.js    ← POST/GET/DELETE /api/bookings/*
└── public/
    └── index.html     ← Frontend (served by Express)
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
# Production
node server.js

# Development (auto-restarts on file change)
npx nodemon server.js
```

### 3. Open the app
```
http://localhost:3000
```

---

## 📡 API Reference

### Health
| Method | Endpoint       | Description        |
|--------|----------------|--------------------|
| GET    | `/api/health`  | Server status check |

### Slots
| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/api/slots`              | All slots (add `?zone=A/B/C`)        |
| GET    | `/api/slots/stats`        | Free/occupied counts per zone        |
| GET    | `/api/slots/random/:zone` | Random free slot from a zone         |
| GET    | `/api/slots/:id`          | Single slot status (e.g. `/api/slots/A05`) |

### Bookings
| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| POST   | `/api/bookings`       | Create a booking          |
| GET    | `/api/bookings`       | List all bookings         |
| GET    | `/api/bookings/:id`   | Get booking by ticket ID  |
| DELETE | `/api/bookings/:id`   | Cancel booking (frees slot) |

---

## 📝 Booking Request Body (POST /api/bookings)

```json
{
  "name":        "Arjun Sharma",
  "userId":      "STU-2023",
  "role":        "student",
  "vehicleType": "car",
  "vehicleNum":  "RJ19AB1234",
  "slotId":      "A05",
  "hours":       2,
  "from":        "10:00"
}
```

**Role values:** `student` | `staff` | `dean`  
**vehicleType values:** `car` | `bike` | `truck` | `ev`

---

## 🔒 Zone Access Rules (enforced server-side)

| Role    | Allowed Zone | Slots     | Price  |
|---------|-------------|-----------|--------|
| Student | Zone A      | A01–A20   | ₹50/hr |
| Staff   | Zone B      | B01–B20   | FREE   |
| Dean    | Zone C      | C01–C10   | FREE   |

---

## 🗃️ Switching to a Real Database

The `data/store.js` file uses an in-memory store. To connect a real DB:

1. **MongoDB** — replace `store.js` functions with Mongoose queries
2. **PostgreSQL** — use `pg` or `Sequelize` ORM
3. **SQLite** — use `better-sqlite3` for a file-based local DB

The route files (`routes/slots.js`, `routes/bookings.js`) won't need changes — they just call store functions.

---

## 🧪 Test the API (curl examples)

```bash
# Health check
curl http://localhost:3000/api/health

# Get all slots
curl http://localhost:3000/api/slots

# Get zone stats
curl http://localhost:3000/api/slots/stats

# Get random free slot in Zone A
curl http://localhost:3000/api/slots/random/A

# Create a booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"Arjun","role":"student","vehicleType":"car","vehicleNum":"RJ19AB1234","slotId":"A05","hours":2}'

# Cancel a booking
curl -X DELETE http://localhost:3000/api/bookings/TKT-XXXXXXXX
```
