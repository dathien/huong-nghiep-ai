/**
 * IndexedDB storage utility for CV portrait photos
 * Provides persistent offline storage across tab switches and page reloads
 */

const DB_NAME = 'careermaster_db';
const DB_VERSION = 1;
const STORE_NAME = 'cv_assets';
const PHOTO_KEY = 'portrait_photo';

export interface StoredCVPhoto {
  dataUrl: string;
  originalUrl?: string;
  shape: 'circle' | 'rounded';
  visible: boolean;
  zoom: number;
  cropX: number;
  cropY: number;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save photo data into IndexedDB with localStorage fallback
 */
export async function savePhotoToStorage(photo: StoredCVPhoto): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photo, PHOTO_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to localStorage:', err);
    try {
      localStorage.setItem(`careermaster_${PHOTO_KEY}`, JSON.stringify(photo));
    } catch (lsErr) {
      console.error('LocalStorage save failed:', lsErr);
    }
  }
}

/**
 * Load photo data from IndexedDB or fallback
 */
export async function loadPhotoFromStorage(): Promise<StoredCVPhoto | null> {
  try {
    const db = await openDB();
    const result = await new Promise<StoredCVPhoto | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(PHOTO_KEY);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });

    if (result) return result;
  } catch (err) {
    console.warn('IndexedDB load failed, trying localStorage:', err);
  }

  try {
    const raw = localStorage.getItem(`careermaster_${PHOTO_KEY}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (lsErr) {
    console.error('LocalStorage load failed:', lsErr);
  }

  return null;
}

/**
 * Delete photo from IndexedDB and fallback
 */
export async function deletePhotoFromStorage(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(PHOTO_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('IndexedDB delete failed:', err);
  }

  try {
    localStorage.removeItem(`careermaster_${PHOTO_KEY}`);
  } catch (lsErr) {
    console.error('LocalStorage delete failed:', lsErr);
  }
}
