import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB2JCQD_qnCRu7aSLbg2L0YonelJHTTMmE",
  authDomain: "finapp-bi-currency.firebaseapp.com",
  projectId: "finapp-bi-currency",
  storageBucket: "finapp-bi-currency.firebasestorage.app",
  messagingSenderId: "103763075587",
  appId: "1:103763075587:web:f436152ff49d7153352436"
};

// Inicializar App
export const app = initializeApp(firebaseConfig);

// Auth + Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore con CACHÉ PERSISTENTE (Offline & $0 Lecturas repetidas)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// Helper de Login
export async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
}

// Helper de Logout
export async function logout() {
    await signOut(auth);
}

export { onAuthStateChanged };

