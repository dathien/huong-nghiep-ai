import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { CompetencyProfileData } from '../types';

export const getCompetencyProfileDocRef = (uid: string) =>
  doc(db, 'users', uid, 'profile', 'main');

export const getCompetencyProfile = async (uid: string): Promise<CompetencyProfileData | null> => {
  const path = `users/${uid}/profile/main`;
  try {
    const docRef = getCompetencyProfileDocRef(uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as CompetencyProfileData;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const saveCompetencyProfile = async (
  uid: string,
  profile: CompetencyProfileData
): Promise<void> => {
  const path = `users/${uid}/profile/main`;
  try {
    const docRef = getCompetencyProfileDocRef(uid);
    const payload: CompetencyProfileData = {
      education: profile.education || [],
      skills: profile.skills || [],
      projects: profile.projects || [],
      certificates: profile.certificates || [],
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const subscribeCompetencyProfile = (
  uid: string,
  onData: (profile: CompetencyProfileData | null) => void,
  onError?: (err: any) => void
) => {
  const docRef = getCompetencyProfileDocRef(uid);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
      } else {
        onData(snap.data() as CompetencyProfileData);
      }
    },
    (error) => {
      console.error('Error subscribing to competency profile:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `users/${uid}/profile/main`);
    }
  );
};
