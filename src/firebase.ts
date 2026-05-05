import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// You can get these from your Firebase Console (Project Settings > General > Your Apps)
const firebaseConfig = {
  apiKey: "AIzaSyBSZB3wz4Ze2VDRWDuUim3dY0NsrhIh-rg",
  authDomain: "ansh-desgin-studio.firebaseapp.com",
  projectId: "ansh-desgin-studio",
  storageBucket: "ansh-desgin-studio.firebasestorage.app",
  messagingSenderId: "171298081894",
  appId: "1:171298081894:web:01e0458e9621b2887cf1a7",
  measurementId: "G-Y45R6GFM17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);
