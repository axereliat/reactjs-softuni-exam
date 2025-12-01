export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  imageUrl: string;
  platform: string[];
  releaseYear: number;
  authorId: string;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
  reviewsCount?: number;
  averageRating?: number;
}

export interface GameFormData {
  title: string;
  genre: string;
  description: string;
  imageUrl: string;
  platform: string[];
  releaseYear: number;
}

export interface Review {
  id: string;
  gameId: string;
  userId: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  gameId: string;
  gameTitle: string;
  hostId: string;
  hostEmail: string;
  title: string;
  description: string;
  maxPlayers: number;
  currentPlayers: string[];
  scheduledTime: Date;
  status: 'open' | 'full' | 'closed';
  createdAt: Date;
}

export interface SessionFormData {
  gameId: string;
  gameTitle: string;
  title: string;
  description: string;
  maxPlayers: number;
  scheduledTime: Date;
}