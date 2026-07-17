import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC4ShV1yv9Xd8RNtf-z0OsxDKAb6VRCXS8',
  authDomain: 'medassistai-b1433.firebaseapp.com',
  projectId: 'medassistai-b1433',
  storageBucket: 'medassistai-b1433.firebasestorage.app',
  messagingSenderId: '901412182945',
  appId: '1:901412182945:web:27d0e24b75da0650cd09e0',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export default app;
