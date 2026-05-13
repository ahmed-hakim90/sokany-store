import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase-app";

let firestoreSingleton: Firestore | null = null;

/** Firebase Firestore — import only from client trees that need it so `firebase/firestore` stays out of the storefront bundle. */
export function getFirebaseFirestore(): Firestore {
  if (!firestoreSingleton) {
    firestoreSingleton = getFirestore(getFirebaseApp());
  }
  return firestoreSingleton;
}
