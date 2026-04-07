import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

let app: App;

export function getFirebaseAdmin(): App {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable');
  }

  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    app = initializeApp({ credential: cert(serviceAccount) });
    console.log('[firebase-admin] App initialized for project:', serviceAccount.project_id);
  } else {
    app = getApps()[0];
  }

  return app;
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseAdmin());
}
