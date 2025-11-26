# PageCraft CMS – Full Stack Application

A modern full-stack CMS dashboard built with **React + Material UI** on the frontend and **Node.js + Express + MongoDB** on the backend.  
Includes authentication, analytics, team management, multilingual UI, real-time chat, and an AI-powered assistant.
![Screenshot] https://github.com/Kasra7r/cms-project/issues/1#issue-3667472677
---

## 🚀 Features

### Frontend
- React 18 + React Router 6  
- Material UI 7  
- Dark / Light theme  
- RTL / LTR auto-switch  
- i18n multilingual support (EN, DE, FR, FA, IT)  
- FullCalendar integration  
- Analytics dashboard (Recharts)  
- Role-based routing (Admin pages)  
- Real-time chat (socket.io-client)  
- AI Chatbot (OpenAI GPT-4o / GPT-4o-mini)

### Backend
- Express 5 REST API  
- MongoDB + Mongoose  
- JWT Authentication  
- Role-based access control  
- Conversation + Messaging models  
- Socket.io real-time server  
- AI chat API with OpenAI  
- Rate Limiting, Helmet, CORS, Compression  
- Serves React build in production mode

---

## 📁 Project Structure

```
cms-project/
│
├── cms-backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── cms-frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── .env.example
```

---

## 🔧 Installation

### 1) Clone the project
```
git clone https://github.com/USERNAME/cms-project.git
cd cms-project
```

---

## 🟥 Backend Setup

```
cd cms-backend
npm install
```

Create `.env`:

```
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```

Start server:
```
npm start
```

Backend runs at:
```
http://localhost:5000
```

---

## 🟦 Frontend Setup

```
cd cms-frontend
npm install
```

Create `.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

Start client:
```
npm start
```

Frontend runs at:
```
http://localhost:3000
```

---

## 🌍 Supported Languages
- English  
- Deutsch  
- Français  
- فارسی  
- Italiano  

---

## 🤖 AI Chat API
```
POST /api/chat
```
Powered by:
- gpt-4o  
- gpt-4o-mini  

---

## 🔐 Authentication
- `/api/auth/register`
- `/api/auth/login`

Middleware:
- `protect`
- `checkRole`
- `manager`

---

## 💬 Real-Time Chat
- socket.io server  
- user presence system  
- conversation storage  

---

## 🛠 Tech Stack

**Frontend:**  
React, Material UI, FullCalendar, Recharts, Framer Motion, i18next, Axios, Socket.io-client

**Backend:**  
Node.js, Express, MongoDB, JWT, bcryptjs, Socket.io, OpenAI API

---

## 📝 License
MIT
