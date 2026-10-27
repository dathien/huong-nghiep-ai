import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';

export type UserType =
  | 'high_school'
  | 'vocational'
  | 'college'
  | 'university'
  | 'job_seeker';

export const USER_TYPE_LABELS: Record<UserType, string> = {
  high_school: 'Học sinh THPT',
  vocational: 'Học viên trung cấp',
  college: 'Sinh viên cao đẳng',
  university: 'Sinh viên đại học',
  job_seeker: 'Người tìm việc / Mới tốt nghiệp',
};

export interface UserAccount {
  uid: string;
  email: string;
  fullName: string;
  userType: UserType;
  school: string;
  major: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  phone?: string;
  avatarUrl?: string;
  educationLevel?: string;
  careerGoal?: string;
  bio?: string;
  targetIndustry?: string;
  skills?: string[];
  updatedAt: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userAccount: UserAccount | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    fullName: string,
    userType: UserType,
    school?: string,
    major?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateProfileData: (
    accountData: Partial<UserAccount>,
    profileData?: Partial<UserProfile>
  ) => Promise<void>;
  // Modal controls
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  authModalReason: string;
  openAuthModal: (tab?: 'login' | 'register' | 'forgot', reason?: string) => void;
  closeAuthModal: () => void;
  // Profile Modal
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [authModalReason, setAuthModalReason] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' = 'login', reason: string = '') => {
    setAuthModalTab(tab);
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Fetch or sync user documents from Firestore
  const fetchUserData = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserAccount(userSnap.data() as UserAccount);
      } else {
        // Auto-provision initial user record if first-time Google sign-in
        const newAccount: UserAccount = {
          uid: user.uid,
          email: user.email || '',
          fullName: user.displayName || user.email?.split('@')[0] || 'Học viên CareerMaster',
          userType: 'university',
          school: 'Đang cập nhật',
          major: 'Đang cập nhật',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newAccount);
        setUserAccount(newAccount);
      }

      // Profile doc
      const profileRef = doc(db, 'user_profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setUserProfile(profileSnap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          avatarUrl: user.photoURL || '',
          educationLevel: 'Sinh viên đại học',
          careerGoal: 'Tìm kiếm cơ hội thực tập & việc làm đầu tiên',
          bio: 'Học viên chủ động phát triển năng lực tại CareerMaster AI',
          targetIndustry: 'Công nghệ thông tin',
          skills: ['Giao tiếp', 'Làm việc nhóm', 'Tự học'],
          updatedAt: new Date().toISOString(),
        };
        await setDoc(profileRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching user data from Firestore:', err);
      // Non-fatal fallback for UI continuity
      setUserAccount({
        uid: user.uid,
        email: user.email || '',
        fullName: user.displayName || 'Học viên',
        userType: 'university',
        school: '',
        major: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserAccount(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchUserData(res.user);
      closeAuthModal();
    } catch (error: any) {
      let message = 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential'
      ) {
        message = 'Email hoặc mật khẩu không chính xác.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không đúng định dạng.';
      } else if (error.code === 'auth/user-disabled') {
        message = 'Tài khoản này đã bị tạm khóa.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Quá nhiều lần thử sai. Vui lòng chờ vài phút và thử lại.';
      }
      throw new Error(message);
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    userType: UserType,
    school: string = '',
    major: string = ''
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = res.user;

      // Update Firebase Auth display name
      await updateFirebaseProfile(user, { displayName: fullName.trim() });

      // Send verification email
      try {
        await sendEmailVerification(user);
      } catch (err) {
        console.warn('Could not send verification email immediately', err);
      }

      // Create user record in Firestore
      const newAccount: UserAccount = {
        uid: user.uid,
        email: user.email || '',
        fullName: fullName.trim(),
        userType,
        school: school.trim() || 'Chưa cập nhật',
        major: major.trim() || 'Chưa cập nhật',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newProfile: UserProfile = {
        uid: user.uid,
        avatarUrl: '',
        educationLevel: USER_TYPE_LABELS[userType],
        careerGoal: 'Phát triển năng lực nghề nghiệp vững vàng',
        bio: `Thành viên CareerMaster AI – ${USER_TYPE_LABELS[userType]}`,
        targetIndustry: 'Đang định hướng',
        skills: ['Kỹ năng chuyên môn', 'Giải quyết vấn đề'],
        updatedAt: new Date().toISOString(),
      };

      const userPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), newAccount);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, userPath);
      }

      const profilePath = `user_profiles/${user.uid}`;
      try {
        await setDoc(doc(db, 'user_profiles', user.uid), newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, profilePath);
      }

      setUserAccount(newAccount);
      setUserProfile(newProfile);
      closeAuthModal();
    } catch (error: any) {
      let message = 'Đăng ký tài khoản thất bại.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Mật khẩu cần tối thiểu 6 ký tự.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ.';
      }
      throw new Error(message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (!res || !res.user) {
        throw new Error('Firebase Authentication không trả về UserCredential hợp lệ.');
      }
      console.log('Firebase Auth Google Sign-in SUCCESS:', {
        uid: res.user.uid,
        email: res.user.email,
        projectId: auth.app.options.projectId,
        provider: res.user.providerData.map((p) => p.providerId),
      });
      await fetchUserData(res.user);
      closeAuthModal();
    } catch (error: any) {
      console.error('Firebase Auth Google Error:', error);
      let message = `${error.message || 'Đăng nhập bằng Google thất bại.'} [Mã lỗi: ${error.code || 'unknown'}]`;
      if (error.code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'hiện tại';
        message = `Tên miền "${currentHost}" chưa được cấp quyền trong Firebase Authentication. Vui lòng vào Firebase Console (dự án huong-nghiep-ai) → Authentication → Settings → Authorized domains và thêm "${currentHost}". [Mã: auth/unauthorized-domain]`;
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = 'Cửa sổ đăng nhập Google đã được đóng trước khi hoàn tất. [Mã: auth/popup-closed-by-user]';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Trình duyệt đã chặn cửa sổ popup. Vui lòng cấp quyền mở popup cho trang này và thử lại. [Mã: auth/popup-blocked]';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Nhà cung cấp Google chưa được kích hoạt trong Firebase Console (Authentication → Sign-in method → Google → Enable). [Mã: auth/operation-not-allowed]';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Không thể kết nối đến máy chủ xác thực Firebase. Vui lòng kiểm tra lại đường truyền mạng. [Mã: auth/network-request-failed]';
      }
      throw new Error(message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserAccount(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('Không tìm thấy tài khoản với email này.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Địa chỉ email không hợp lệ.');
      }
      throw new Error('Không thể gửi email đặt lại mật khẩu. Vui lòng kiểm tra lại.');
    }
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const updateProfileData = async (
    accountData: Partial<UserAccount>,
    profileData?: Partial<UserProfile>
  ) => {
    if (!currentUser) throw new Error('Vui lòng đăng nhập để cập nhật hồ sơ.');

    const now = new Date().toISOString();

    if (accountData && Object.keys(accountData).length > 0) {
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedAccount = {
        ...userAccount,
        ...accountData,
        uid: currentUser.uid,
        updatedAt: now,
      } as UserAccount;

      try {
        await updateDoc(userRef, {
          ...accountData,
          updatedAt: now,
        });
        setUserAccount(updatedAccount);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }

    if (profileData && Object.keys(profileData).length > 0) {
      const profileRef = doc(db, 'user_profiles', currentUser.uid);
      const updatedProfile = {
        ...userProfile,
        ...profileData,
        uid: currentUser.uid,
        updatedAt: now,
      } as UserProfile;

      try {
        await setDoc(profileRef, updatedProfile, { merge: true });
        setUserProfile(updatedProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `user_profiles/${currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userAccount,
        userProfile,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerification,
        updateProfileData,
        isAuthModalOpen,
        authModalTab,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
