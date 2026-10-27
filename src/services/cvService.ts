import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { CVData, CVTemplateId, CVThemeConfig } from '../types';
import { SAMPLE_DEFAULT_CV, createBlankCVData } from '../data/mockData';

export interface CVDoc {
  id: string;
  uid: string;
  cvName: string;
  templateId: CVTemplateId | string;
  targetRole: string;
  cvData: CVData;
  photoUrl?: string;
  showPhoto: boolean;
  photoShape: 'circle' | 'rounded' | 'square';
  themeConfig?: Partial<CVThemeConfig>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Subcollection helper: users/{uid}/cvs
const getUserCvsRef = (uid: string) => collection(db, 'users', uid, 'cvs');
const getCvDocRef = (uid: string, cvId: string) => doc(db, 'users', uid, 'cvs', cvId);

export const subscribeUserCVs = (
  uid: string,
  onData: (cvs: CVDoc[]) => void,
  onError?: (err: any) => void
) => {
  const cvsColRef = getUserCvsRef(uid);

  return onSnapshot(
    cvsColRef,
    async (snapshot) => {
      const cvs: CVDoc[] = [];
      snapshot.forEach((docSnap) => {
        cvs.push({ ...docSnap.data(), id: docSnap.id } as CVDoc);
      });

      // Migration fallback: If subcollection is empty, check legacy root collection 'cv_documents'
      if (cvs.length === 0) {
        try {
          const legacyQuery = query(collection(db, 'cv_documents'), where('uid', '==', uid));
          const legacySnap = await getDocs(legacyQuery);
          if (!legacySnap.empty) {
            for (const legDoc of legacySnap.docs) {
              const legData = legDoc.data() as CVDoc;
              const migratedDoc: CVDoc = {
                ...legData,
                id: legDoc.id,
                uid,
              };
              await setDoc(getCvDocRef(uid, legDoc.id), migratedDoc);
              cvs.push(migratedDoc);
            }
          }
        } catch (migErr) {
          console.warn('Legacy CV migration check completed without hits:', migErr);
        }
      }

      // Sort in-memory to prevent requiring composite indexes
      cvs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(cvs);
    },
    (error) => {
      console.error('Error subscribing to user CVs:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, `users/${uid}/cvs`);
    }
  );
};

export const getUserCVs = async (uid: string): Promise<CVDoc[]> => {
  try {
    const snapshot = await getDocs(getUserCvsRef(uid));
    const cvs: CVDoc[] = [];
    snapshot.forEach((docSnap) => {
      cvs.push({ ...docSnap.data(), id: docSnap.id } as CVDoc);
    });
    cvs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return cvs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/cvs`);
  }
};

export const saveCV = async (uid: string, cvDoc: CVDoc): Promise<void> => {
  const path = `users/${uid}/cvs/${cvDoc.id}`;
  try {
    const docRef = getCvDocRef(uid, cvDoc.id);
    const payload: CVDoc = {
      ...cvDoc,
      uid,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const createCV = async (
  uid: string,
  cvName: string,
  templateId: CVTemplateId | string = 'student-starter',
  customData?: CVData,
  isDefault: boolean = false
): Promise<CVDoc> => {
  const id = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newCV: CVDoc = {
    id,
    uid,
    cvName: cvName.trim() || 'CV Mới của tôi',
    templateId,
    targetRole: customData?.contact.title || 'Thực tập sinh / Fresher',
    cvData: customData || createBlankCVData(),
    showPhoto: customData?.photo?.visible ?? true,
    photoShape: customData?.photo?.shape || 'circle',
    isDefault,
    createdAt: now,
    updatedAt: now,
  };

  const path = `users/${uid}/cvs/${id}`;
  try {
    await setDoc(getCvDocRef(uid, id), newCV);
    return newCV;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const duplicateCV = async (uid: string, sourceCV: CVDoc): Promise<CVDoc> => {
  const id = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const clonedCV: CVDoc = {
    ...sourceCV,
    id,
    uid,
    cvName: `${sourceCV.cvName} (Bản sao)`,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };

  const path = `users/${uid}/cvs/${id}`;
  try {
    await setDoc(getCvDocRef(uid, id), clonedCV);
    return clonedCV;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const renameCV = async (uid: string, cvId: string, newName: string): Promise<void> => {
  const path = `users/${uid}/cvs/${cvId}`;
  try {
    await updateDoc(getCvDocRef(uid, cvId), {
      cvName: newName.trim(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const setDefaultCV = async (uid: string, cvId: string): Promise<void> => {
  try {
    const allCvs = await getUserCVs(uid);
    for (const cv of allCvs) {
      if (cv.id === cvId && !cv.isDefault) {
        await updateDoc(getCvDocRef(uid, cv.id), { isDefault: true });
      } else if (cv.id !== cvId && cv.isDefault) {
        await updateDoc(getCvDocRef(uid, cv.id), { isDefault: false });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/cvs/${cvId}`);
  }
};

export const deleteCV = async (uid: string, cvId: string): Promise<void> => {
  const path = `users/${uid}/cvs/${cvId}`;
  try {
    await deleteDoc(getCvDocRef(uid, cvId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
