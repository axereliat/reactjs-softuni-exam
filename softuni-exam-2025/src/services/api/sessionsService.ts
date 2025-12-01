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
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Session, SessionFormData } from '../../types';

const COLLECTION_NAME = 'sessions';

export const sessionsService = {
  // Create a new gaming session
  create: async (
    sessionData: SessionFormData,
    hostId: string,
    hostEmail: string
  ): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...sessionData,
      hostId,
      hostEmail,
      currentPlayers: [hostId],
      status: 'open',
      scheduledTime: Timestamp.fromDate(new Date(sessionData.scheduledTime)),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  // Get all sessions
  getAll: async (): Promise<Session[]> => {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledTime: doc.data().scheduledTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    } as Session));
  },

  // Get open sessions only
  getOpen: async (): Promise<Session[]> => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'open'),
      orderBy('scheduledTime', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledTime: doc.data().scheduledTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    } as Session));
  },

  // Get a single session by ID
  getById: async (id: string): Promise<Session | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        scheduledTime: docSnap.data().scheduledTime?.toDate(),
        createdAt: docSnap.data().createdAt?.toDate()
      } as Session;
    }
    return null;
  },

  // Get sessions by game
  getByGameId: async (gameId: string): Promise<Session[]> => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('gameId', '==', gameId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledTime: doc.data().scheduledTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    } as Session));
  },

  // Get sessions by host
  getByHost: async (hostId: string): Promise<Session[]> => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('hostId', '==', hostId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledTime: doc.data().scheduledTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    } as Session));
  },

  // Join a session
  join: async (sessionId: string, userId: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, sessionId);
    const session = await sessionsService.getById(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.currentPlayers.includes(userId)) {
      throw new Error('You have already joined this session');
    }

    if (session.currentPlayers.length >= session.maxPlayers) {
      throw new Error('Session is full');
    }

    await updateDoc(docRef, {
      currentPlayers: arrayUnion(userId),
      status: session.currentPlayers.length + 1 >= session.maxPlayers ? 'full' : 'open'
    });
  },

  // Leave a session
  leave: async (sessionId: string, userId: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, sessionId);
    const session = await sessionsService.getById(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.currentPlayers.includes(userId)) {
      throw new Error('You are not in this session');
    }

    await updateDoc(docRef, {
      currentPlayers: arrayRemove(userId),
      status: 'open'
    });
  },

  // Update session
  update: async (id: string, sessionData: Partial<SessionFormData>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: any = { ...sessionData };

    if (sessionData.scheduledTime) {
      updateData.scheduledTime = Timestamp.fromDate(new Date(sessionData.scheduledTime));
    }

    await updateDoc(docRef, updateData);
  },

  // Delete a session
  delete: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  // Close a session
  close: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: 'closed'
    });
  }
};
