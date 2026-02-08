// ============================================================
// LUZON RENAL CARE — Firebase Configuration & SDK Setup
// Project: yepbro-e3468
// ============================================================

import { initializeApp }          from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction
} from "firebase/firestore";


// ============================================================
// 1. Firebase App Config
// ============================================================
const firebaseConfig = {
  apiKey:            "AIzaSyAy3V0HpECz611eo3gpVE50KjNC_BRo608",
  authDomain:        "yepbro-e3468.firebaseapp.com",
  projectId:         "yepbro-e3468",
  storageBucket:     "yepbro-e3468.firebasestorage.app",
  messagingSenderId: "616963714633",
  appId:             "1:616963714633:web:ef2f7fa085c6e989f2d998",
  measurementId:     "G-GG3N0299VE"
};

const app       = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// ============================================================
// 2. Service Instances (export for use across your app)
// ============================================================
export const db   = getFirestore(app);   // Firestore
export const auth = getAuth(app);        // Authentication


// ============================================================
// 3. Collection Path Constants
//    Centralised here so a rename never breaks anything.
// ============================================================
export const COL = {
  // config sub-collections
  CATEGORIES:     "config/categories",
  LAB_TYPES:      "config/lab_types",
  DEPARTMENTS:    "config/departments",
  TIME_PRESETS:   "config/time_presets",

  // top-level collections
  USERS:          "users",
  PRODUCTS:       "products",
  PRODUCT_SALES:  "product_sales",
  PATIENTS:       "patients",
  CHARGE_SLIPS:   "charge_slips",
  SALES:          "sales",
  LEAVE_REQUESTS: "leave_requests",
  ATTENDANCE:     "attendance",
  PAYROLL:        "payroll",
  PRINT_QUEUE:    "print_queue"
};


// ============================================================
// 4. Auth Helpers
// ============================================================

/**
 * Listen for auth state changes.
 * On sign-in we immediately fetch the user's profile from
 * Firestore so the sidebar can show name + role.
 *
 * @param {(user: object | null) => void} callback
 */
export function listenAuth(callback) {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) return callback(null);

    const snap = await getDoc(doc(db, COL.USERS, firebaseUser.uid));
    const profile = snap.exists()
      ? { uid: firebaseUser.uid, ...snap.data() }
      : { uid: firebaseUser.uid, email: firebaseUser.email, role: "nurse" };

    callback(profile);
  });
}

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}


// ============================================================
// 5. Firestore CRUD Shortcuts
//    Thin wrappers so every page uses the same pattern.
// ============================================================

/** Add a new document (auto-generated ID) */
export async function addDoc_(collectionPath, data) {
  const { addDoc: _addDoc } = await import("firebase/firestore");
  return _addDoc(collection(db, collectionPath), {
    ...data,
    createdAt: serverTimestamp()
  });
}

/** Set / overwrite a document by ID */
export async function setDocument(collectionPath, docId, data, options = {}) {
  return setDoc(doc(db, collectionPath, docId), data, options);
}

/** Fetch a single document */
export async function getDocument(collectionPath, docId) {
  const snap = await getDoc(doc(db, collectionPath, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Fetch all documents in a collection (optional query filters) */
export async function getDocuments(collectionPath, filters = []) {
  let q = collection(db, collectionPath);
  filters.forEach(([field, op, value]) => {
    q = query(q, where(field, op, value));
  });
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Update specific fields on an existing document */
export async function updateDocument(collectionPath, docId, data) {
  return updateDoc(doc(db, collectionPath, docId), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

/** Delete a document */
export async function removeDocument(collectionPath, docId) {
  return deleteDoc(doc(db, collectionPath, docId));
}

/** Real-time listener on a collection */
export function listenCollection(collectionPath, callback, filters = []) {
  let q = collection(db, collectionPath);
  filters.forEach(([field, op, value]) => {
    q = query(q, where(field, op, value));
  });
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}


// ============================================================
// 6. Domain-Specific Helpers (Charge Slip + Sales atomic write)
// ============================================================

/**
 * Save a charge slip AND create the matching sales record
 * AND decrement product stock — all in one transaction.
 *
 * @param {object} slipData   – { patientName, nurseId, nurseName, date, items[] }
 * @param {string} slipId     – auto-generated receipt ID
 */
export async function saveChargeSlip(slipData, slipId) {
  const total = slipData.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice, 0
  );

  await runTransaction(db, async (tx) => {
    // 1. Write charge_slip
    tx.set(doc(db, COL.CHARGE_SLIPS, slipId), {
      ...slipData,
      total,
      status:    "saved",
      createdAt: serverTimestamp()
    });

    // 2. Write matching sales record
    tx.set(doc(db, COL.SALES, slipId), {
      receiptId:   slipId,
      patientName: slipData.patientName,
      nurseId:     slipData.nurseId,
      nurseName:   slipData.nurseName,
      date:        slipData.date,
      total,
      itemCount:   slipData.items.reduce((s, i) => s + i.quantity, 0),
      items:       slipData.items,
      createdAt:   serverTimestamp()
    });

    // 3. Update product stock + daily sales for each item
    slipData.items.forEach((item) => {
      // Decrement live stock
      tx.update(doc(db, COL.PRODUCTS, item.productId), {
        currentStock: increment(-item.quantity),
        updatedAt:    serverTimestamp()
      });

      // Upsert daily product_sales record
      const salesDocId = `${item.productId}_${slipData.date}`;
      tx.set(doc(db, COL.PRODUCT_SALES, salesDocId), {
        productId:   item.productId,
        productName: item.productName,
        date:        slipData.date,
        soldBy:      slipData.nurseId,
        receiptId:   slipId,
        quantity:    increment(item.quantity),
        createdAt:   serverTimestamp()
      }, { merge: true });
    });
  });
}


// ============================================================
// 7. Re-export Firestore utilities your pages may need directly
// ============================================================
export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction
};