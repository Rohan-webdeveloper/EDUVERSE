# 🎓 EduVerse AI — Google for Education

A full-stack AI-powered education platform that aggregates content from top educators like Physics Wallah, Khan Academy, Unacademy, Vedantu and more — all in one place.

![EduVerse AI](https://img.shields.io/badge/EduVerse-AI%20Platform-2563eb?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgM0w0IDE5aDhsOC0xNnoiIGZpbGw9IndoaXRlIi8+PC9zdmc+)
![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Search across 50+ educational YouTube channels with filters |
| 🤖 **AI Doubt Solver** | Ask any academic question and get instant AI answers |
| 📝 **AI Notes Generator** | Generate short notes, formula sheets, key concepts from any video |
| 🗺️ **AI Study Roadmap** | Get a personalized week-by-week study plan |
| 🧠 **AI Quiz Generator** | Auto-generate MCQ quizzes on any topic with explanations |
| 💼 **Career Guidance** | AI-powered career recommendations based on your skills |
| 📊 **Student Dashboard** | Track streaks, watch time, bookmarks, and quiz scores |
| 👥 **Community Forum** | Ask questions, share resources, and discuss with peers |
| 📋 **Playlists** | Create and manage custom video playlists |
| 🌙 **Dark Mode** | Full dark theme support across all pages |
| 🔐 **Secure Auth** | JWT-based authentication with refresh tokens & Google OAuth |

## 🛠️ Tech Stack

**Frontend:** React 19, Vite, React Router, Framer Motion, Recharts, React Icons  
**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose  
**AI:** Google Gemini API (generative AI for notes, quizzes, roadmaps, doubt solving)  
**APIs:** YouTube Data API v3 (video search and metadata)  
**Auth:** JWT (access + refresh tokens), Passport.js (Google OAuth)  
**Security:** bcryptjs, express-rate-limit, input sanitization, API key protection

## 📁 Project Structure

```
EDUVERSE/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Auth & Theme context providers
│   │   ├── pages/          # All page components
│   │   ├── services/       # API service layer
│   │   └── styles/         # Global CSS & animations
│   └── vite.config.js
├── server/                 # Express backend
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth, security, rate limiting
│   ├── models/             # Mongoose schemas
│   └── routes/             # API route definitions
├── .env.example            # Environment variable template
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- YouTube Data API v3 key
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EDUVERSE.git
   cd EDUVERSE
   ```

2. **Install dependencies**
   ```bash
   # Server dependencies
   npm install

   # Client dependencies
   cd client && npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and MongoDB URI
   ```

4. **Run the development servers**
   ```bash
   # Terminal 1 — Backend (port 5000)
   node server.js

   # Terminal 2 — Frontend (port 5173)
   cd client && npm run dev
   ```

5. **Open** `http://localhost:5173` in your browser 🎉

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |

## 📸 Pages

- **Landing Page** — Premium SaaS-style hero, categories, AI features showcase
- **Search** — Filter by exam, subject, provider, duration, difficulty
- **Video Player** — Embedded YouTube + AI sidebar (doubts, notes)
- **Dashboard** — Stats, charts, quizzes, quick actions, AI tips
- **Login / Register** — Glassmorphism split-screen design
- **Roadmap** — AI-generated study plans
- **Quiz** — AI-generated MCQs with scoring
- **Community** — Discussion forum
- **Career** — AI career guidance
- **Admin** — User & content management

## 🔒 Security

- API keys stored server-side only (never exposed to client)
- JWT access tokens (15min) + refresh tokens (7d)
- Password hashing with bcryptjs
- Rate limiting on all API endpoints
- Input sanitization against injection attacks
- `.env` excluded from version control

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ by **Rohan** | Powered by **Gemini AI** & **YouTube API**
