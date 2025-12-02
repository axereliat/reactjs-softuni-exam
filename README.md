# GameHub - Online Gaming Platform

**Author:** Mario Markov
**SoftUni Username:** axereliat

A comprehensive Single Page Application (SPA) for gamers to discover games, create gaming sessions, and connect with fellow gamers.

## 🚀 Features

### Public Features (No Authentication Required)
- **Home Page** - Landing page with featured games and statistics
- **Games Catalog** - Browse all games with search and filter capabilities
- **Game Details** - View detailed information about games including reviews
- **Sessions Catalog** - View all gaming sessions
- **Session Details** - View gaming session information

### Private Features (Authentication Required)
- **Create Game** - Add new games to the catalog
- **Edit Game** - Edit your own games (author only)
- **Delete Game** - Remove your games (author only)
- **Create Gaming Session** - Create lobbies for multiplayer games
- **Join/Leave Sessions** - Participate in gaming sessions
- **Write Reviews** - Rate and review games (one review per game per user)
- **User Profile** - View and manage your games, sessions, and reviews

## 📋 Project Requirements Met

✅ **At least 3 different dynamic pages**
- Home, Games Catalog, Sessions Catalog, Game Details, Session Details, Profile, etc.

✅ **Specific Views**
- **Catalog** - Games Catalog & Sessions Catalog
- **Details** - Game Details & Session Details

✅ **Collections with CRUD operations**
- **Games Collection** - Create, Read, Update, Delete
- **Sessions Collection** - Create, Read, Update, Delete
- **Reviews Collection** - Create, Read, Delete

✅ **User Interactions**
- Logged-in users can create games and sessions
- Users can review games, join/leave sessions
- Authors can edit/delete their own content

✅ **Client-side Routing**
- 10+ routes total
- 3 routes with parameters:
  - `/games/:id` - Game details
  - `/games/:id/edit` - Edit game
  - `/sessions/:id` - Session details

✅ **Technology Stack**
- React.js for client-side
- Firebase for backend (Auth + Firestore)
- REST API communication via Firebase SDK
- Authentication implemented
- Ant Design for UI components

## 🛠️ Technologies Used

- **Frontend:**
  - React 19.2.0
  - TypeScript
  - React Router Dom
  - Ant Design (antd)
  - Vite

- **Backend:**
  - Firebase Authentication
  - Cloud Firestore
  - Firebase SDK

- **Development:**
  - ESLint
  - TypeScript ESLint

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (Header, Footer, MainLayout)
│   ├── games/           # Game-specific components
│   ├── sessions/        # Session-specific components
│   └── auth/            # Authentication components
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── guards/
│   └── PrivateRoute.tsx # Route protection
├── pages/
│   ├── Auth/            # Login, Register pages
│   ├── Games/           # Games-related pages
│   ├── Sessions/        # Sessions-related pages
│   ├── Home/            # Home page
│   └── Profile/         # User profile
├── services/
│   ├── firebase/        # Firebase configuration and auth service
│   └── api/             # API services (games, sessions, reviews)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Main app component with routing
└── main.tsx             # Entry point
```

## 🔥 Firebase Setup

Before running the application, you need to set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable **Email/Password** authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider

3. Create a **Cloud Firestore** database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (start with test mode for development)

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click on the Web app icon (</>)
   - Copy the configuration object

5. Update the Firebase configuration in `src/services/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/softuni/reactjs-softuni-exam.git
cd reactjs-softuni-exam/softuni-exam-2025
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase (see Firebase Setup section above)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📱 Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page with featured content |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/games` | Public | Games catalog |
| `/games/:id` | Public | Game details with reviews |
| `/games/create` | Private | Create new game |
| `/games/:id/edit` | Private (Author) | Edit game |
| `/sessions` | Public | Gaming sessions catalog |
| `/sessions/:id` | Public | Session details |
| `/sessions/create` | Private | Create gaming session |
| `/profile` | Private | User profile |

## 🎮 Features in Detail

### Games Management
- **Browse Games** - Search and filter by genre
- **Game Details** - View full information, platform, release year
- **Reviews System** - Rate games (1-5 stars) and leave comments
- **CRUD Operations** - Create, edit, and delete games (author only)

### Gaming Sessions
- **Create Lobbies** - Set up multiplayer sessions with max players and schedule
- **Join/Leave** - Participate in open sessions
- **Session Status** - Open, Full, or Closed
- **Host Controls** - Close or delete sessions (host only)

### User System
- **Authentication** - Email/password registration and login
- **User Profile** - View all your games, sessions, and reviews
- **Author Permissions** - Edit/delete only your own content

## 🔒 Security Features

- Protected routes with authentication guards
- Author-only edit/delete permissions
- Firebase security rules (recommended for production)
- Client-side validation
- Server-side validation through Firebase

## 📝 Data Models

### Game
```typescript
{
  id: string
  title: string
  genre: string
  description: string
  imageUrl: string
  platform: string[]
  releaseYear: number
  authorId: string
  authorEmail: string
  createdAt: Date
  updatedAt: Date
  reviewsCount: number
  averageRating: number
}
```

### Session
```typescript
{
  id: string
  gameId: string
  gameTitle: string
  hostId: string
  hostEmail: string
  title: string
  description: string
  maxPlayers: number
  currentPlayers: string[]
  scheduledTime: Date
  status: 'open' | 'full' | 'closed'
  createdAt: Date
}
```

### Review
```typescript
{
  id: string
  gameId: string
  userId: string
  userEmail: string
  rating: number
  comment: string
  createdAt: Date
}
```

## 🎨 UI/UX

- Modern, responsive design using Ant Design
- Mobile-friendly interface
- Intuitive navigation
- Real-time feedback with notifications
- Loading states for better UX

## 🔄 State Management

- React Context API for authentication
- Local state management with React Hooks
- Firebase real-time listeners for data synchronization

## 🐛 Known Issues & Future Improvements

- Implement real-time updates using Firebase listeners
- Add pagination for large datasets
- Implement advanced search and filtering
- Add user avatars and profiles
- Implement private messaging between users
- Add game recommendations based on user preferences

## 📜 License

This project is part of the SoftUni ReactJS course exam.

## 👤 Author

**Mario Markov**
SoftUni Username: axereliat

---

Made with ❤️ for SoftUni ReactJS Course
