import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultAppletConfig from '../../firebase-applet-config.json';

// Read from Vite environment variables (VITE_FIREBASE_*) with fallback to local applet config
const env = (typeof import.meta !== 'undefined' && import.meta && import.meta.env)
  ? import.meta.env
  : ((typeof process !== 'undefined' && process && process.env) ? (process.env as any) : {});

// Helper to check if an environment variable has a genuine configured value (not an unreplaced placeholder)
const getValidEnv = (val: unknown): string | undefined => {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  if (!trimmed || trimmed.startsWith('VITE_') || trimmed.startsWith('MY_')) {
    return undefined;
  }
  return trimmed;
};

// 6 standard Firebase Web SDK variables for Authentication and Cloud Firestore
const apiKey = getValidEnv(env.VITE_FIREBASE_API_KEY) || defaultAppletConfig.apiKey;
const projectId = getValidEnv(env.VITE_FIREBASE_PROJECT_ID) || defaultAppletConfig.projectId;
const authDomain = getValidEnv(env.VITE_FIREBASE_AUTH_DOMAIN) || (projectId ? `${projectId}.firebaseapp.com` : defaultAppletConfig.authDomain);
const storageBucket = getValidEnv(env.VITE_FIREBASE_STORAGE_BUCKET) || (projectId ? `${projectId}.firebasestorage.app` : defaultAppletConfig.storageBucket);
const messagingSenderId = getValidEnv(env.VITE_FIREBASE_MESSAGING_SENDER_ID) || defaultAppletConfig.messagingSenderId;
const appId = getValidEnv(env.VITE_FIREBASE_APP_ID) || defaultAppletConfig.appId;

export const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// Singleton initialization to prevent multiple initializeApp calls
export const app: FirebaseApp = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

// Initialize Cloud Firestore (No Realtime Database)
// When a custom project is configured (e.g. huong-nghiep-ai on Vercel), connect to default Firestore database.
// When running in AI Studio sandbox, connect to applet provisioned database ID.
const isCustomProject = Boolean(
  getValidEnv(env.VITE_FIREBASE_PROJECT_ID) &&
  getValidEnv(env.VITE_FIREBASE_PROJECT_ID) !== defaultAppletConfig.projectId
);

const databaseId = isCustomProject ? undefined : defaultAppletConfig.firestoreDatabaseId;

export const db: Firestore = databaseId && databaseId !== '(default)'
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Initialize Authentication
export const auth: Auth = getAuth(app);

// Google Auth Provider (Configured for popup flow)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Operation Types for error tracing
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is limited.');
    }
  }
}

testConnection();

export default app;
