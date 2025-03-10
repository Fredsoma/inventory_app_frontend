// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDTHVtwI81c6_FV4NP0gx6qr3CKBD2SAv8",
  authDomain: "inventory-management-app-bde9f.firebaseapp.com",
  projectId: "inventory-management-app-bde9f",
  storageBucket: "inventory-management-app-bde9f.firebasestorage.app",
  messagingSenderId: "561635061153",
  appId: "1:561635061153:web:2d43a4c436b96ac0166fe0",
  //measurementId: "G-VVM4HDD8WR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
