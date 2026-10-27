import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { InterviewExchange } from '../types';

export interface SavedInterviewSession {
  id: string;
  uid: string;
  career: string;
  position: string;
  company: string;
  level: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  style: string;
  questionCount: number;
  mode: 'voice' | 'text';
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  overallVerdict: string;
  durationSeconds: number;
  exchanges: InterviewExchange[];
  strengths?: string[];
  improvements?: string[];
  actionPlan?: string[];
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'interview_sessions';

export const subscribeUserInterviews = (
  uid: string,
  onData: (sessions: SavedInterviewSession[]) => void,
  onError?: (err: any) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions: SavedInterviewSession[] = [];
      snapshot.forEach((doc) => {
        sessions.push({ ...doc.data(), id: doc.id } as SavedInterviewSession);
      });
      sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(sessions);
    },
    (error) => {
      console.error('Error subscribing to interview sessions:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
};

export const getUserInterviews = async (uid: string): Promise<SavedInterviewSession[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const sessions: SavedInterviewSession[] = [];
    snapshot.forEach((doc) => {
      sessions.push({ ...doc.data(), id: doc.id } as SavedInterviewSession);
    });
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
};

export const saveInterviewSession = async (
  uid: string,
  session: Omit<SavedInterviewSession, 'id' | 'uid' | 'createdAt' | 'updatedAt'>,
  customId?: string
): Promise<SavedInterviewSession> => {
  const id = customId || `interview_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newSession: SavedInterviewSession = {
    ...session,
    id,
    uid,
    createdAt: now,
    updatedAt: now,
  };

  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), newSession);
    return newSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteInterviewSession = async (uid: string, sessionId: string): Promise<void> => {
  const path = `${COLLECTION_NAME}/${sessionId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
