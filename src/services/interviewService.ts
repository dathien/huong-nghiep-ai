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
  career: string; // Ngành nghề
  position: string; // Vị trí ứng tuyển
  company: string;
  level: string; // Cấp độ
  difficulty: 'Easy' | 'Medium' | 'Hard';
  style: string;
  questionCount: number;
  mode: 'voice' | 'text';
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number; // Kết quả điểm số
  overallVerdict: string; // Nhận xét tổng quan
  durationSeconds: number;
  exchanges: InterviewExchange[]; // Câu hỏi, câu trả lời, nhận xét chi tiết
  strengths?: string[];
  improvements?: string[];
  actionPlan?: string[];
  createdAt: string; // Thời gian thực hiện
  updatedAt: string;
}

// Subcollection helper: users/{uid}/interviews
const getUserInterviewsRef = (uid: string) => collection(db, 'users', uid, 'interviews');
const getInterviewDocRef = (uid: string, interviewId: string) =>
  doc(db, 'users', uid, 'interviews', interviewId);

export const subscribeUserInterviews = (
  uid: string,
  onData: (sessions: SavedInterviewSession[]) => void,
  onError?: (err: any) => void
) => {
  const colRef = getUserInterviewsRef(uid);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      const sessions: SavedInterviewSession[] = [];
      snapshot.forEach((docSnap) => {
        sessions.push({ ...docSnap.data(), id: docSnap.id } as SavedInterviewSession);
      });

      // Migration fallback: If subcollection is empty, check legacy root collection 'interview_sessions'
      if (sessions.length === 0) {
        try {
          const legacyQuery = query(collection(db, 'interview_sessions'), where('uid', '==', uid));
          const legacySnap = await getDocs(legacyQuery);
          if (!legacySnap.empty) {
            for (const legDoc of legacySnap.docs) {
              const legData = legDoc.data() as SavedInterviewSession;
              const migratedDoc: SavedInterviewSession = {
                ...legData,
                id: legDoc.id,
                uid,
              };
              await setDoc(getInterviewDocRef(uid, legDoc.id), migratedDoc);
              sessions.push(migratedDoc);
            }
          }
        } catch (migErr) {
          console.warn('Legacy interview migration check completed without hits:', migErr);
        }
      }

      sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(sessions);
    },
    (error) => {
      console.error('Error subscribing to user interview sessions:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, `users/${uid}/interviews`);
    }
  );
};

export const getUserInterviews = async (uid: string): Promise<SavedInterviewSession[]> => {
  try {
    const snapshot = await getDocs(getUserInterviewsRef(uid));
    const sessions: SavedInterviewSession[] = [];
    snapshot.forEach((docSnap) => {
      sessions.push({ ...docSnap.data(), id: docSnap.id } as SavedInterviewSession);
    });
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/interviews`);
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

  const path = `users/${uid}/interviews/${id}`;
  try {
    await setDoc(getInterviewDocRef(uid, id), newSession);
    return newSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteInterviewSession = async (uid: string, sessionId: string): Promise<void> => {
  const path = `users/${uid}/interviews/${sessionId}`;
  try {
    await deleteDoc(getInterviewDocRef(uid, sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
