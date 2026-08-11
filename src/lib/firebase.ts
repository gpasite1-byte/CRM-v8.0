import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  collection,
  getDocs,
  getDocFromServer,
  setLogLevel
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Mute verbose internal firestore logs when quota is reached
try { setLogLevel('silent'); } catch {}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

let isQuotaExhausted = false;

try {
  const cachedQuota = localStorage.getItem('gpa_firestore_quota_exhausted');
  if (cachedQuota) {
    const quotaTime = parseInt(cachedQuota, 10);
    // Quota resets daily, cache for 6 hours
    if (Date.now() - quotaTime < 6 * 60 * 60 * 1000) {
      isQuotaExhausted = true;
    } else {
      localStorage.removeItem('gpa_firestore_quota_exhausted');
    }
  }
} catch {}

// Intercept global unhandled rejections for Firebase quota errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason?.code === 'resource-exhausted' || reason?.message?.includes('Quota limit exceeded') || reason?.message?.includes('resource-exhausted')) {
      isQuotaExhausted = true;
      try { localStorage.setItem('gpa_firestore_quota_exhausted', Date.now().toString()); } catch {}
      event.preventDefault(); // Prevent crash or console flood
      console.warn('Firestore quota exceeded. System switched smoothly to local storage & Express API sync.');
    }
  });
}

export function checkIsQuotaExhausted() {
  return isQuotaExhausted;
}

function handleQuotaError(err: any) {
  if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded') || err?.message?.includes('resource-exhausted') || err?.toString().includes('resource-exhausted')) {
    if (!isQuotaExhausted) {
      isQuotaExhausted = true;
      try {
        localStorage.setItem('gpa_firestore_quota_exhausted', Date.now().toString());
      } catch {}
      console.warn("Firestore quota limit reached. Using Express server and localStorage database fallbacks.");
    }
    return true;
  }
  return false;
}

// Validate connection on boot
export async function testFirestoreConnection() {
  if (isQuotaExhausted) return;
  try {
    await getDocFromServer(doc(db, "crm_store", "connection_test"));
  } catch (error: any) {
    if (handleQuotaError(error)) return;
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Firestore connection offline:", error.message);
    }
  }
}
testFirestoreConnection().catch(() => {});

const MAIN_DOC_PATH = doc(db, "crm_store", "gpa_angola_main_db");

let saveDebounceTimer: any = null;
let pendingSavePayload: any = null;

export async function saveCrmDataToFirestore(crmData: any) {
  if (isQuotaExhausted) return;
  pendingSavePayload = crmData;
  
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }

  saveDebounceTimer = setTimeout(async () => {
    if (isQuotaExhausted || !pendingSavePayload) return;
    try {
      const dataToSave = { ...pendingSavePayload, updatedAt: new Date().toISOString() };
      pendingSavePayload = null;
      await setDoc(MAIN_DOC_PATH, dataToSave, { merge: true });
    } catch (err: any) {
      if (handleQuotaError(err)) return;
      console.warn("Firestore write skipped:", err?.message || err);
    }
  }, 1200);
}

export async function loadCrmDataFromFirestore(): Promise<any | null> {
  if (isQuotaExhausted) return null;
  try {
    const snap = await getDoc(MAIN_DOC_PATH);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err: any) {
    if (handleQuotaError(err)) return null;
    console.warn("Firestore read skipped:", err?.message || err);
    return null;
  }
}

export function subscribeCrmDataFromFirestore(onUpdate: (data: any) => void) {
  if (isQuotaExhausted) return () => {};
  try {
    let unsubscribe: (() => void) | null = null;
    unsubscribe = onSnapshot(
      MAIN_DOC_PATH,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data());
        }
      },
      (err: any) => {
        if (handleQuotaError(err)) {
          if (unsubscribe) {
            try { unsubscribe(); } catch {}
          }
          return;
        }
        console.warn("Firestore subscription info:", err?.message || err);
      }
    );
    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch {}
      }
    };
  } catch (e: any) {
    handleQuotaError(e);
    return () => {};
  }
}

// Chat Messages Persistence
export async function saveChatMessageToFirestore(message: any) {
  if (isQuotaExhausted) return;
  try {
    if (!message || !message.id) return;
    const msgDoc = doc(db, "chat_messages", message.id);
    await setDoc(msgDoc, message, { merge: true });
  } catch (err: any) {
    if (handleQuotaError(err)) return;
    console.warn("Firestore chat write skipped:", err?.message || err);
  }
}

export function subscribeChatMessagesFromFirestore(onUpdate: (messages: any[]) => void) {
  if (isQuotaExhausted) return () => {};
  try {
    const chatColl = collection(db, "chat_messages");
    let unsubscribe: (() => void) | null = null;
    unsubscribe = onSnapshot(
      chatColl,
      (snap) => {
        const msgs = snap.docs.map(d => d.data());
        msgs.sort((a, b) => {
          const timeA = a.createdAt || (a.timestamp ? Date.parse(`1970-01-01T${a.timestamp}:00Z`) || 0 : 0);
          const timeB = b.createdAt || (b.timestamp ? Date.parse(`1970-01-01T${b.timestamp}:00Z`) || 0 : 0);
          return timeA - timeB;
        });
        onUpdate(msgs);
      },
      (err: any) => {
        if (handleQuotaError(err)) {
          if (unsubscribe) {
            try { unsubscribe(); } catch {}
          }
          return;
        }
        console.warn("Chat Firestore subscription info:", err?.message || err);
      }
    );
    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch {}
      }
    };
  } catch (e: any) {
    handleQuotaError(e);
    return () => {};
  }
}


