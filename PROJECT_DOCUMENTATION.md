# GameHub - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Data Models](#data-models)
6. [Authentication System](#authentication-system)
7. [Key Features](#key-features)
8. [API Services](#api-services)
9. [Routing](#routing)
10. [State Management](#state-management)
11. [Development & Deployment](#development--deployment)

---

## Project Overview

**GameHub** is a modern single-page application (SPA) that serves as an online gaming platform where users can discover games, write reviews, create and join gaming sessions, and connect with the gaming community.

**Live Demo:** https://reactjs-softuni-exam1.pages.dev
**Author:** Mario Markov (SoftUni ID: axereliat)
**Course:** SoftUni ReactJS Exam Project

### Key Objectives
- Browse and search a catalog of games
- Create and manage games with image uploads
- Write reviews and ratings for games
- Create and join gaming sessions
- View user profiles and activity tracking

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | Core UI library |
| TypeScript | ~5.9.3 | Static type checking |
| React Router | 7.9.6 | Client-side routing |
| Ant Design | 6.0.0 | UI component library |
| Vite | 7.2.4 | Build tool and dev server |
| dayjs | 1.11.19 | Date/time manipulation |

### Backend Services
| Service | Purpose |
|---------|---------|
| Firebase Authentication | User authentication and session management |
| Cloud Firestore | NoSQL database for storing data |
| Cloudinary | Image hosting and upload service |

### Development Tools
- **ESLint** - Code linting and quality
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite React Plugin** - React Hot Module Replacement

### Deployment
- **Cloudflare Pages** - Static site hosting
- **Build Output:** `/dist` directory

---

## Project Structure

```
reactjs-softuni-exam/
├── src/
│   ├── App.tsx                     # Main routing configuration
│   ├── main.tsx                    # React DOM entry point
│   ├── index.css                   # Global styles
│   │
│   ├── components/
│   │   └── common/
│   │       ├── Header.tsx          # Navigation header
│   │       ├── Footer.tsx          # Footer component
│   │       └── MainLayout.tsx      # Main layout wrapper
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication context
│   │
│   ├── guards/
│   │   └── PrivateRoute.tsx        # Protected route wrapper
│   │
│   ├── pages/
│   │   ├── Home/
│   │   │   └── Home.tsx            # Dashboard page
│   │   ├── Auth/
│   │   │   ├── Login.tsx           # Login page
│   │   │   └── Register.tsx        # Registration page
│   │   ├── Games/
│   │   │   ├── GamesCatalog.tsx    # Games listing
│   │   │   ├── GameDetails.tsx     # Single game view
│   │   │   ├── CreateGame.tsx      # Create game form
│   │   │   └── EditGame.tsx        # Edit game form
│   │   ├── Sessions/
│   │   │   ├── SessionsCatalog.tsx # Sessions listing
│   │   │   ├── SessionDetails.tsx  # Single session view
│   │   │   └── CreateSession.tsx   # Create session form
│   │   └── Profile/
│   │       └── Profile.tsx         # User profile page
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── gamesService.ts     # Game CRUD operations
│   │   │   ├── sessionsService.ts  # Session management
│   │   │   └── reviewsService.ts   # Review operations
│   │   ├── firebase/
│   │   │   ├── config.ts           # Firebase initialization
│   │   │   ├── authService.ts      # Auth methods
│   │   │   └── storageService.ts   # Storage operations
│   │   ├── cloudinary/
│   │   │   └── cloudinaryService.ts # Image upload
│   │   └── constants/
│   │       └── contants.ts         # App constants
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   │
│   └── assets/                     # Static assets
│
├── public/                         # Public static files
├── dist/                           # Production build output
│
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
├── eslint.config.js               # ESLint config
├── .env                           # Environment variables
└── README.md                      # Project readme
```

---

## Architecture

### Component Architecture

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────┐
│         React Components            │
│  (Pages, Layouts, UI Components)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Context Providers            │
│      (AuthContext, etc.)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer               │
│  (gamesService, sessionsService)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Firebase & External APIs         │
│  (Firestore, Auth, Cloudinary)      │
└─────────────────────────────────────┘
```

### Data Flow Pattern

```
1. User Action (e.g., click button)
   ↓
2. Component Event Handler
   ↓
3. Service Function Call
   ↓
4. Firebase/API Request
   ↓
5. Response Data
   ↓
6. State Update (useState/Context)
   ↓
7. Component Re-render
```

### Design Patterns Used

1. **Context API Pattern** - Global authentication state
2. **Service Layer Pattern** - Abstracted API logic
3. **Protected Routes Pattern** - Route guards for authentication
4. **Layout Component Pattern** - Reusable page layouts
5. **Custom Hooks Pattern** - `useAuth()` for accessing auth context

---

## Data Models

### User
```typescript
interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Date
}
```

### Game
```typescript
interface Game {
  id: string
  title: string
  genre: string
  description: string
  imageUrl: string              // Cloudinary URL
  platform: string[]            // ['PC', 'PS5', 'Xbox', etc.]
  releaseYear: number
  authorId: string              // User UID
  authorEmail: string
  reviewsCount?: number
  averageRating?: number
  createdAt: Date
  updatedAt: Date
}
```

### Review
```typescript
interface Review {
  id: string
  gameId: string
  userId: string
  userEmail: string
  rating: number                // 1-5 stars
  comment: string
  createdAt: Date
}
```

### Session
```typescript
interface Session {
  id: string
  gameId: string
  gameTitle: string
  hostId: string
  hostEmail: string
  title: string
  description: string
  maxPlayers: number
  currentPlayers: string[]      // Array of user UIDs
  scheduledTime: Date
  status: 'open' | 'full' | 'closed'
  createdAt: Date
}
```

---

## Authentication System

### Authentication Flow

#### Registration
1. User fills registration form (email, password, display name)
2. Firebase creates account with `createUserWithEmailAndPassword()`
3. User profile updated with `updateProfile()`
4. User stored in AuthContext
5. Redirect to home page

#### Login
1. User enters credentials
2. Firebase authenticates with `signInWithEmailAndPassword()`
3. AuthContext updated with user data
4. Session persists via Firebase auth state
5. Redirect to home page

#### Session Persistence
- `onAuthStateChanged()` listener in AuthProvider
- Automatically restores user session on app reload
- Loading state shown until auth status determined

#### Route Protection
- **PrivateRoute** component wraps protected routes
- Checks `currentUser` from AuthContext
- Redirects to `/login` if not authenticated
- Shows loading spinner during auth check

### Password Requirements
- Minimum 6 characters (Firebase default)
- Form validation enforced

---

## Key Features

### 1. Game Management
- **Create Game** - Upload game with image via Cloudinary
- **Edit Game** - Update game details (only by author)
- **Delete Game** - Remove game (only by author)
- **Browse Games** - Grid view with responsive layout
- **Search Games** - Search by title/description
- **Filter Games** - Filter by genre and platform
- **View Details** - See full game info with reviews

### 2. Review System
- **Add Review** - Rate (1-5 stars) and comment on games
- **View Reviews** - See all reviews for a game
- **Prevent Duplicates** - Users can only review once per game
- **Auto-calculation** - Average rating updated automatically
- **Delete Review** - Remove own review

### 3. Session Management
- **Create Session** - Set up gaming session with schedule
- **Browse Sessions** - View all available sessions
- **Join Session** - Add yourself to a session
- **Leave Session** - Remove yourself from a session
- **Auto-status** - Session marked 'full' when max players reached
- **View Participants** - See who's joined
- **Close Session** - Host can close session

### 4. User Profile
- Display user information
- List user's created games
- List user's hosted sessions
- Activity overview

---

## API Services

### Firebase Firestore Collections

#### `games` Collection
```
Document: {gameId}
├── title: string
├── genre: string
├── description: string
├── imageUrl: string
├── platform: string[]
├── releaseYear: number
├── authorId: string
├── authorEmail: string
├── reviewsCount: number
├── averageRating: number
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### `sessions` Collection
```
Document: {sessionId}
├── gameId: string
├── gameTitle: string
├── title: string
├── description: string
├── hostId: string
├── hostEmail: string
├── maxPlayers: number
├── currentPlayers: string[]
├── status: string
├── scheduledTime: Timestamp
└── createdAt: Timestamp
```

#### `reviews` Collection
```
Document: {reviewId}
├── gameId: string
├── userId: string
├── userEmail: string
├── rating: number
├── comment: string
└── createdAt: Timestamp
```

### Service Layer Methods

#### gamesService (`src/services/api/gamesService.ts`)
```typescript
create(gameData, authorId, authorEmail) → Promise<string>
getAll() → Promise<Game[]>
getById(id) → Promise<Game | null>
getByAuthor(authorId) → Promise<Game[]>
update(id, gameData) → Promise<void>
delete(id) → Promise<void>
search(searchTerm) → Promise<Game[]>
```

#### sessionsService (`src/services/api/sessionsService.ts`)
```typescript
create(sessionData, hostId, hostEmail) → Promise<string>
getAll() → Promise<Session[]>
getOpen() → Promise<Session[]>
getById(id) → Promise<Session | null>
getByGameId(gameId) → Promise<Session[]>
getByHost(hostId) → Promise<Session[]>
join(sessionId, userId) → Promise<void>
leave(sessionId, userId) → Promise<void>
update(id, sessionData) → Promise<void>
delete(id) → Promise<void>
close(id) → Promise<void>
```

#### reviewsService (`src/services/api/reviewsService.ts`)
```typescript
create(gameId, userId, userEmail, rating, comment) → Promise<string>
getByGameId(gameId) → Promise<Review[]>
getByUserId(userId) → Promise<Review[]>
hasUserReviewed(gameId, userId) → Promise<boolean>
delete(id, gameId) → Promise<void>
updateGameRating(gameId) → Promise<void>
```

#### cloudinaryService (`src/services/cloudinary/cloudinaryService.ts`)
```typescript
uploadImage(file) → Promise<string>         // Returns secure_url
validateImage(file) → Promise<void>         // Throws on invalid
```

**Cloudinary Configuration:**
- Accepts: JPEG, PNG, GIF, WebP
- Max file size: 10MB
- Upload folder: 'games'
- Returns: `secure_url` for use in imageUrl field

---

## Routing

### Route Structure

#### Public Routes (No Authentication)
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | Login.tsx | User login form |
| `/register` | Register.tsx | User registration form |

#### Protected Routes (Authentication Required)
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home.tsx | Dashboard with featured content |
| `/games` | GamesCatalog.tsx | Browse all games |
| `/games/:id` | GameDetails.tsx | View single game |
| `/games/create` | CreateGame.tsx | Create new game |
| `/games/:id/edit` | EditGame.tsx | Edit existing game |
| `/sessions` | SessionsCatalog.tsx | Browse all sessions |
| `/sessions/:id` | SessionDetails.tsx | View single session |
| `/sessions/create` | CreateSession.tsx | Create new session |
| `/profile` | Profile.tsx | User profile page |

### Route Protection Implementation

```typescript
// All protected routes wrapped in PrivateRoute component
<Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
  <Route path="/" element={<Home />} />
  <Route path="/games" element={<GamesCatalog />} />
  // ... more protected routes
</Route>
```

---

## State Management

### Global State (Context API)

**AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages user authentication state
- Provides `currentUser`, `loading` status
- Exposes auth methods: `register()`, `login()`, `logout()`
- Accessible via `useAuth()` custom hook

```typescript
const { currentUser, loading, login, logout, register } = useAuth()
```

### Local State (React Hooks)

Components use `useState` and `useEffect` for:
- Form inputs and validation
- Loading states during API calls
- Fetched data (games, sessions, reviews)
- UI state (modals, filters, search)

### Why No Redux/Zustand?

The application uses Context API + local state because:
1. Authentication is the only global state needed
2. No complex state mutations or derived state
3. Page-level data fetching is sufficient
4. Keeps bundle size smaller
5. Reduces complexity for project scope

---

## Development & Deployment

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Build Process

1. TypeScript compilation with strict mode
2. Vite bundles JavaScript and CSS
3. Assets optimized and hashed
4. Output to `/dist` directory
5. Ready for static hosting

### Deployment (Cloudflare Pages)

**Configuration:**
- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: Vite
- Node version: 18+

**Environment Variables:**
Add all `VITE_*` variables in Cloudflare Pages settings

**Deployment Trigger:**
- Automatic deployment on git push to main branch
- Live at: https://reactjs-softuni-exam1.pages.dev

---

## Code Quality & Best Practices

### TypeScript
- Strict mode enabled
- All components typed with interfaces
- Props and return types specified
- No `any` types used

### Component Naming
- PascalCase for components (e.g., `GamesCatalog.tsx`)
- camelCase for services (e.g., `gamesService.ts`)
- UPPER_SNAKE_CASE for constants

### Error Handling
- Try/catch blocks in async operations
- Ant Design `message` for user notifications
- Console logging for debugging
- Form validation on all inputs

### Responsive Design
- Ant Design Grid system (Row/Col)
- Breakpoints: xs, sm, md, lg, xl
- Mobile-first approach

---

## Potential Improvements

### Current Limitations
1. **Client-side search** - Slower with large datasets
2. **No pagination** - All records loaded at once
3. **No real-time updates** - Manual refresh needed
4. **Image deletion** - Cloudinary cleanup not implemented
5. **Session auto-close** - Time-based status not automated

### Scalability Considerations
- Add Firestore composite indexes
- Implement server-side pagination
- Add Firestore real-time listeners
- Implement caching layer (React Query/SWR)
- Add image optimization pipeline
- Consider Firestore sharding for high-traffic

### Future Features
- User-to-user messaging
- Friend system
- Notifications for session invites
- Game wishlist
- Advanced search filters
- Dark mode toggle
- Multi-language support

---

## Summary

GameHub is a well-architected React application that demonstrates:
- Modern React patterns with TypeScript
- Clean separation of concerns
- Proper authentication flow
- Service layer abstraction
- Responsive UI with Ant Design
- Firebase integration
- Cloud deployment on Cloudflare Pages

The codebase follows industry best practices and is structured for maintainability and scalability.