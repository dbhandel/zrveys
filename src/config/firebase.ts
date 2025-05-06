import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFgt5hmEEQwjJSIKOynNkOrXcdIKJzwo4",
  authDomain: "zrveys.firebaseapp.com",
  projectId: "zrveys",
  storageBucket: "zrveys.appspot.com",
  messagingSenderId: "782133813712",
  appId: "1:782133813712:web:30240192e5e6653103d9d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
