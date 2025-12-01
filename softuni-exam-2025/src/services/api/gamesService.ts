import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Game, GameFormData } from '../../types';

const COLLECTION_NAME = 'games';

export const gamesService = {
  // Create a new game
  create: async (gameData: GameFormData, authorId: string, authorEmail: string): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...gameData,
      authorId,
      authorEmail,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      reviewsCount: 0,
      averageRating: 0
    });
    return docRef.id;
  },

  // Get all games
  getAll: async (): Promise<Game[]> => {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Game));
  },

  // Get a single game by ID
  getById: async (id: string): Promise<Game | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate()
      } as Game;
    }
    return null;
  },

  // Get games by author
  getByAuthor: async (authorId: string): Promise<Game[]> => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Game));
  },

  // Update a game
  update: async (id: string, gameData: Partial<GameFormData>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...gameData,
      updatedAt: Timestamp.now()
    });
  },

  // Delete a game
  delete: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  // Search games by title or genre
  search: async (searchTerm: string): Promise<Game[]> => {
    const allGames = await gamesService.getAll();
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allGames.filter(
      game =>
        game.title.toLowerCase().includes(lowerSearchTerm) ||
        game.genre.toLowerCase().includes(lowerSearchTerm)
    );
  }
};
