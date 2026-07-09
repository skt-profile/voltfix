# VoltFix AI ⚡
### The Smart Electric Bike Diagnostics & Maintenance Portal

VoltFix AI turns your e-bike's service manuals into an on-demand technician. Upload PDF manuals, ask questions in plain language, and get step-by-step answers with page citations — plus a dashboard to track your fleet's mileage and battery health.

> **Build status — read this first**
> This is a phased build. This drop includes a fully working slice: **authentication, bike management (CRUD), the dashboard, and the AI Manual RAG Assistant** (upload → chunk → embed → Pinecone → cited chat). The remaining features from the original spec (Battery Health Predictor, Error Code Interpreter, Parts Finder, Quote Generator, Service History logging, Predictive Maintenance, Notifications, Admin Dashboard, voice/vision/multilingual bonus features) are **not yet implemented** — their MongoDB models and API scaffolding exist where noted, but the endpoints and UI are follow-up work. In-app, unbuilt nav items show a "coming soon" placeholder instead of a broken link.

---

## 1. Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Chart.js, Framer Motion, React Icons
**Backend:** Node.js, Express, JWT auth, Multer, pdf-parse, Google Gemini API, Pinecone
**Database:** MongoDB (Atlas)

## 2. Folder Structure

```
voltfix-ai/
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/axios.js           # Axios instance + auth interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/            # Sidebar, Navbar, StatCard, BikeCard, ChatMessage, Modal…
│   │   ├── pages/                 # Landing, Login, Signup, Dashboard, AIChat, BikeManagement…
│   │   ├── App.jsx                # Route definitions
│   │   ├── main.jsx                # React entry point
│   │   └── index.css              # Tailwind + design system utility classes
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── server/                        # Express backend
    ├── src/
    │   ├── config/db.js           # MongoDB connection
    │   ├── models/                # User, Bike, Battery, ServiceHistory, Manual,
    │   │                          # Conversation, ErrorCode, Part, Notification
    │   ├── controllers/           # authController, bikeController, manualController, chatController
    │   ├── routes/                # authRoutes, bikeRoutes, manualRoutes, chatRoutes
    │   ├── middleware/            # authMiddleware, errorHandler, rateLimiter, uploadMiddleware
    │   ├── services/              # geminiService, pineconeService, pdfService, chunkService
    │   ├── utils/                 # generateToken, ApiError
    │   ├── uploads/                # local storage for uploaded PDFs/images
    │   └── server.js              # App entry point
    ├── .env.example
    └── package.json
```

## 3. Installation

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A Google Gemini API key ([ai.google.dev](https://ai.google.dev))
- A Pinecone account + index ([pinecone.io](https://pinecone.io)) — create an index with dimension `768` (matches the `text-embedding-004` model) and any metric (cosine recommended)

### Backend

```bash
cd server
npm install
cp .env.example .env
# fill in .env with your MongoDB URI, JWT secret, Gemini key, Pinecone key/index
npm run dev
```

The API starts on `http://localhost:5000` by default. Visit `http://localhost:5000/api/health` to confirm it's running.

### Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The app starts on `http://localhost:5173` and proxies `/api` and `/uploads` requests to the backend (see `vite.config.js`).

## 4. Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin, for CORS |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_CHAT_MODEL` | Defaults to `gemini-2.5-flash` |
| `GEMINI_EMBEDDING_MODEL` | Defaults to `text-embedding-004` |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX` | Name of your Pinecone index |
| `PINECONE_EMBEDDING_DIMENSION` | Must match your index (768 for `text-embedding-004`) |
| `SMTP_*`, `EMAIL_FROM` | For future email reminder feature |
| `MAX_UPLOAD_MB` | Max PDF upload size (default 15MB) |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL, defaults to `/api` (works with the Vite dev proxy) |

## 5. API Documentation

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/signup` | Create an account |
| POST | `/auth/login` | Log in, returns JWT |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/me` | Update profile |
| PUT | `/auth/me/password` | Change password |

### Bikes
| Method | Route | Description |
|---|---|---|
| GET | `/bikes` | List my bikes |
| POST | `/bikes` | Create a bike (multipart, field `image`) |
| GET | `/bikes/:id` | Get bike + service history |
| PUT | `/bikes/:id` | Update a bike |
| DELETE | `/bikes/:id` | Delete a bike |
| GET | `/bikes/summary/dashboard` | Aggregated dashboard stats |

### Manuals (RAG ingestion)
| Method | Route | Description |
|---|---|---|
| POST | `/manuals/upload` | Upload a PDF (multipart, field `manual`) — processed async |
| GET | `/manuals` | List my manuals + processing status |
| GET | `/manuals/:id` | Get one manual |
| DELETE | `/manuals/:id` | Delete a manual + its Pinecone vectors |

### Chat (RAG Q&A)
| Method | Route | Description |
|---|---|---|
| GET | `/chat` | List my conversations |
| POST | `/chat` | Ask a question, starts a new conversation |
| POST | `/chat/:conversationId` | Continue a conversation |
| GET | `/chat/:conversationId` | Get full conversation |
| DELETE | `/chat/:conversationId` | Delete a conversation |

## 6. How the RAG pipeline works

1. **Upload** — a PDF is uploaded via Multer and stored in `server/src/uploads`.
2. **Extract** — `pdfService.js` extracts per-page text with `pdf-parse`.
3. **Chunk** — `chunkService.js` splits page text into overlapping ~1200-character chunks.
4. **Embed** — `geminiService.js` embeds each chunk with Gemini's `text-embedding-004`.
5. **Store** — vectors are upserted into a manual-specific Pinecone **namespace**, so each manual's chunks stay isolated and easy to delete.
6. **Ask** — a question is embedded and matched against one manual's namespace, or merged across all of a user's manuals.
7. **Answer** — matched chunks are assembled into a context block and sent to Gemini with the conversation history, producing a structured answer (steps, tools, warnings) with source citations shown as chips in the UI.

This all runs asynchronously after upload — the API responds immediately with `202 Processing` and the frontend polls manual status every 5 seconds until it flips to `ready`.

## 7. Security

- Helmet for secure HTTP headers
- express-rate-limit (tighter limits on auth and AI endpoints)
- express-mongo-sanitize against NoSQL injection
- JWT auth with bcrypt password hashing (12 salt rounds)
- File-type validation on uploads (PDF-only for manuals)

## 8. Deployment Guide

### Frontend → Vercel
1. Push `client/` to a Git repo (or the monorepo with a Vercel "root directory" set to `client`)
2. Import the project in Vercel
3. Framework preset: **Vite**
4. Set environment variable `VITE_API_URL` to your deployed backend URL, e.g. `https://voltfix-api.onrender.com/api`
5. Deploy

### Backend → Render
1. Push `server/` to a Git repo
2. Create a new **Web Service** on Render, root directory `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all variables from `.env.example` in Render's Environment tab
6. Set `CLIENT_URL` to your deployed Vercel URL for CORS

### MongoDB Atlas
1. Create a free cluster, add a database user, and allow network access from Render's IPs (or `0.0.0.0/0` for simplicity during setup)
2. Copy the connection string into `MONGO_URI`

### Pinecone
1. Create an index with dimension `768`, metric `cosine`
2. Copy the API key and index name into your backend env vars

## 9. Roadmap (next build phases)

- Battery Health Predictor (form → Gemini-scored health % + remaining life)
- Visual Error Code Interpreter
- Semantic Parts Finder (embeddings-based search)
- Smart Service Quote Generator + PDF export
- Service History logging (add records, upload bills, reminders)
- Predictive Maintenance Dashboard
- Email notifications (warranty/maintenance)
- Admin Dashboard (manage users, manuals, bikes, analytics)
- Bonus: voice assistant, Gemini Vision error detection, multilingual UI, CSV/PDF export

---

Built with care. Contributions and follow-up feature requests welcome.
