import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Review } from '../../types';

const COLLECTION_NAME = 'reviews';

export const reviewsService = {
  // Create a new review
  create: async (
    gameId: string,
    userId: string,
    userEmail: string,
    rating: number,
    comment: string
  ): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      gameId,
      userId,
      userEmail,
      rating,
      comment,
      createdAt: Timestamp.now()
    });

    // Update game's review count and average rating
    await updateGameRating(gameId);

    return docRef.id;
  },

  // Get all reviews for a game
  getByGameId: async (gameId: string): Promise<Review[]> => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('gameId', '==', gameId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    } as Review));
  },

  // Get reviews by user
  getByUserId: async (userId: string): Promise<Review[]> => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    } as Review));
  },

  // Check if user has already reviewed a game
  hasUserReviewed: async (gameId: string, userId: string): Promise<boolean> => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('gameId', '==', gameId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },

  // Delete a review
  delete: async (id: string, gameId: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    // Update game's review count and average rating
    await updateGameRating(gameId);
  }
};

// Helper function to update game rating
async function updateGameRating(gameId: string): Promise<void> {
  const reviews = await reviewsService.getByGameId(gameId);
  const reviewsCount = reviews.length;
  const averageRating = reviewsCount > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
    : 0;

  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, {
    reviewsCount,
    averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
  });
}
