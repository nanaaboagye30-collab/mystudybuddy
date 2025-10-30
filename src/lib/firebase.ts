import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  "projectId": "studio-2280350664-692c4",
  "appId": "1:1033677824763:web:c7c2f9073400b5a066065e",
  "storageBucket": "studio-2280350664-692c4.firebasestorage.app",
  "apiKey": "AIzaSyBNlrNFTqc-A7nxC7zIL1gEqznBGjl7Lvw",
  "authDomain": "studio-2280350664-692c4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1033677824763"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
