import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, setLogLevel, type Firestore } from "firebase/firestore";
import { Platform } from "react-native";
import { firebaseConfig } from "./config";

const isNew = getApps().length === 0;
const app = isNew ? initializeApp(firebaseConfig) : getApp();

setLogLevel("error");

function createAuth(): Auth {
    if (!isNew || Platform.OS === "web") return getAuth(app);
    try {
        // Keeps the student signed in between app launches.
        return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
        return getAuth(app);
    }
}

function createDb(): Firestore {
    if (!isNew) return getFirestore(app);
    try {
        // Long polling is more reliable than WebChannel streaming on Android networks.
        return initializeFirestore(app, { experimentalForceLongPolling: Platform.OS !== "web" });
    } catch {
        return getFirestore(app);
    }
}

export const auth = createAuth();
export const db = createDb();
export default app;
