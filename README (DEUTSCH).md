# PageCraft CMS – Vollständige Full-Stack Anwendung

Eine moderne Full-Stack-CMS-Applikation mit **React + Material UI** im Frontend und **Node.js + Express + MongoDB** im Backend.  
Enthält Authentifizierung, Rollenrechte, Kalender, Aufgaben, Notizen, Echtzeit-Chat und einen KI-basierten Assistenten.
![Screenshot] https://github.com/Kasra7r/cms-project/issues/1#issue-3667472677

---

## 🚀 Funktionen

### Frontend
- React 18 + React Router 6  
- Material UI 7  
- Dunkles / Helles Theme  
- Automatisches RTL / LTR Layout  
- Mehrsprachig (EN, DE, FR, FA, IT)  
- FullCalendar Integration  
- Analytics Dashboard (Recharts)  
- Rollenbasierte Routen (Admin)  
- Echtzeit-Chat (socket.io-client)  
- KI-Chatbot (OpenAI GPT-4o / GPT-4o-mini)

### Backend
- Express 5 REST API  
- MongoDB + Mongoose  
- JWT-Authentifizierung  
- Rollenbasierte Zugriffssteuerung  
- Konversations- und Nachrichten-Modelle  
- Echtzeit Socket.io-Server  
- KI-Chat API mit OpenAI  
- Rate Limiting, Helmet, CORS, Kompression  
- Liefert React-Build im Produktionsmodus aus

---

## 📁 Projektstruktur

```
cms-project/
│
├── cms-backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   └── .env.example
│
└── cms-frontend/
    ├── src/
    ├── public/
    └── .env.example
```

---

## 🔧 Installation

### 1) Repository klonen
```
git clone https://github.com/USERNAME/cms-project.git
cd cms-project
```

---

## 🟥 Backend einrichten

```
cd cms-backend
npm install
```

`.env` erstellen:

```
PORT=5000
MONGO_URI=deine_mongo_uri
JWT_SECRET=dein_jwt_schluessel
OPENAI_API_KEY=dein_openai_schluessel
```

Server starten:
```
npm start
```

Backend läuft unter:
```
http://localhost:5000
```

---

## 🟦 Frontend einrichten

```
cd cms-frontend
npm install
```

`.env` erstellen:

```
REACT_APP_API_URL=http://localhost:5000
```

Client starten:
```
npm start
```

Frontend läuft unter:
```
http://localhost:3000
```

---

## 🌍 Unterstützte Sprachen
- Englisch  
- Deutsch  
- Französisch  
- Persisch  
- Italienisch  

---

## 🤖 KI-Chat API
```
POST /api/chat
```
Verwendet:
- gpt-4o  
- gpt-4o-mini  

---

## 🔐 Authentifizierung
- `/api/auth/register`
- `/api/auth/login`

Middleware:
- `protect`
- `checkRole`
- `manager`

---

## 💬 Echtzeit-Chat
- socket.io Server  
- Präsenzsystem  
- Gesprächsspeicher  

---

## 🛠 Technologien

**Frontend:**  
React, Material UI, FullCalendar, Recharts, Framer Motion, i18next, Axios, Socket.io-client

**Backend:**  
Node.js, Express, MongoDB, JWT, bcryptjs, Socket.io, OpenAI API

---

## 📝 Lizenz
MIT
