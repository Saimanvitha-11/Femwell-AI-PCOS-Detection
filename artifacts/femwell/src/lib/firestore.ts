import {
  collection, addDoc, getDocs, getDoc, doc, query, orderBy, Timestamp, serverTimestamp, updateDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { getAuth, updateProfile as firebaseUpdateProfile } from "firebase/auth";

export type ScreeningData = {
  surveyData: Record<string, unknown>;
  result: {
    probability: number;
    likelihood: "Unlikely" | "Possible" | "Likely";
    factors: string[];
  };
  ultrasoundResult?: {
    prediction: string;
    confidence: number;
  };
  createdAt: Timestamp;
};

/**
 * Save a completed screening result to Firestore
 */
export async function saveScreeningResult(
  userId: string,
  surveyData: Record<string, unknown>,
  result: { probability: number; likelihood: string; factors: string[] },
  ultrasoundResult?: { prediction: string; confidence: number }
): Promise<string> {
  const screeningsRef = collection(db, "users", userId, "screenings");
  const docRef = await addDoc(screeningsRef, {
    surveyData,
    result,
    ...(ultrasoundResult && { ultrasoundResult }),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Get all screening history for a user, ordered by most recent first
 */
export async function getScreeningHistory(userId: string): Promise<(ScreeningData & { id: string })[]> {
  const screeningsRef = collection(db, "users", userId, "screenings");
  const q = query(screeningsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as (ScreeningData & { id: string })[];
}

/**
 * Get a single screening result by ID
 */
export async function getScreeningById(
  userId: string,
  screeningId: string
): Promise<(ScreeningData & { id: string }) | null> {
  const docRef = doc(db, "users", userId, "screenings", screeningId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() } as ScreeningData & { id: string };
}

/**
 * Update User Profile (display name)
 */
export async function updateUserProfile(displayName: string) {
  const auth = getAuth();
  if (auth.currentUser) {
    await firebaseUpdateProfile(auth.currentUser, { displayName });
    // Force Firebase to emit a new auth state with the updated display name globally
    await auth.updateCurrentUser(auth.currentUser);
  }
}
