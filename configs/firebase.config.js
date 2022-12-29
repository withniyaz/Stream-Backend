import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";
import config from "./config.js";

dotenv.config("./.env");

// Initialize Firebase
const app = initializeApp(config.FIREBASE_CONFIG);

const db = getFirestore(app);

export default { app, db };
