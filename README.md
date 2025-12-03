# GameHub - Online Gaming Platform

> A modern SPA for gamers to discover games, create sessions, and connect with the community.

**Live Demo:** [https://reactjs-softuni-exam1.pages.dev](https://reactjs-softuni-exam1.pages.dev)

**Author:** Mario Markov | **SoftUni Username:** axereliat

---

## Features

**Public Access**
- Browse games catalog with search and filters
- View game details and reviews
- Explore gaming sessions

**Authenticated Users**
- Create and manage games (CRUD)
- Write reviews and rate games
- Create and join gaming sessions
- Personal profile with activity overview

---

## Tech Stack

**Frontend:** React 19 • TypeScript • Vite • React Router • Ant Design
**Backend:** Firebase Authentication • Cloud Firestore
**Deployment:** Cloudflare Pages

---

## Quick Start

### Prerequisites
- Node.js v16+
- Firebase project ([Create one](https://console.firebase.google.com/))

### Installation

```bash
# Clone and install
git clone <repository-url>
cd reactjs-softuni-exam
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Enable **Email/Password** authentication
2. Create **Cloud Firestore** database
3. Add your domain to authorized domains (for deployment)

---

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React Context (Auth)
├── guards/           # Route protection
├── pages/            # Page components
├── services/         # API & Firebase services
└── types/            # TypeScript definitions
```

---

## Key Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page |
| `/games` | Public | Games catalog |
| `/games/:id` | Public | Game details |
| `/games/create` | Private | Create game |
| `/sessions` | Public | Sessions catalog |
| `/sessions/:id` | Public | Session details |
| `/profile` | Private | User profile |

---

## Deployment

### Cloudflare Pages

```bash
# Build the project
npm run build

# Deploy using Wrangler
wrangler pages deploy dist --project-name=reactjs-softuni-exam
```

Or connect your Git repository to Cloudflare Pages for automatic deployments.

**Build Settings:**
- Build command: `npm run build`
- Build output: `dist`
- Framework: Vite

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## License

SoftUni ReactJS Course Exam Project
