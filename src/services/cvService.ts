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
import { SAMPLE_DEFAULT_CV } from '../data/mockData';

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

const COLLECTION_NAME = 'cv_documents';

export const subscribeUserCVs = (
  uid: string,
  onData: (cvs: CVDoc[]) => void,
  onError?: (err: any) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const cvs: CVDoc[] = [];
      snapshot.forEach((doc) => {
        cvs.push({ ...doc.data(), id: doc.id } as CVDoc);
      });
      // Sort in-memory to prevent complex composite index requirements
      cvs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(cvs);
    },
    (error) => {
      console.error('Error subscribing to CVs:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
};

export const getUserCVs = async (uid: string): Promise<CVDoc[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const cvs: CVDoc[] = [];
    snapshot.forEach((doc) => {
      cvs.push({ ...doc.data(), id: doc.id } as CVDoc);
    });
    cvs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return cvs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
};

export const saveCV = async (uid: string, cvDoc: CVDoc): Promise<void> => {
  const path = `${COLLECTION_NAME}/${cvDoc.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, cvDoc.id);
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
  templateId: CVTemplateId | string = 'ats-classic',
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
    cvData: customData || SAMPLE_DEFAULT_CV,
    showPhoto: customData?.photo?.visible ?? true,
    photoShape: customData?.photo?.shape || 'circle',
    isDefault,
    createdAt: now,
    updatedAt: now,
  };

  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), newCV);
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

  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await setDoc(doc(db, COLLECTION_NAME, id), clonedCV);
    return clonedCV;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const renameCV = async (uid: string, cvId: string, newName: string): Promise<void> => {
  const path = `${COLLECTION_NAME}/${cvId}`;
  try {
    await updateDoc(doc(db, COLLECTION_NAME, cvId), {
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
        await updateDoc(doc(db, COLLECTION_NAME, cv.id), { isDefault: true });
      } else if (cv.id !== cvId && cv.isDefault) {
        await updateDoc(doc(db, COLLECTION_NAME, cv.id), { isDefault: false });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${cvId}`);
  }
};

export const deleteCV = async (uid: string, cvId: string): Promise<void> => {
  const path = `${COLLECTION_NAME}/${cvId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, cvId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
