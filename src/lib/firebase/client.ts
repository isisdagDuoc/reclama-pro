import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth as firebaseGetAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

export function getFirebaseApp() {
  if (getApps().length > 0) return getApp()

  const { apiKey, authDomain, projectId } = firebaseConfig
  if (!apiKey || !authDomain || !projectId) {
    throw new Error(
      'Missing Firebase client config: check NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    )
  }

  const app = initializeApp({ apiKey, authDomain, projectId })
  console.log('[firebase-client] App initialized for project:', projectId)
  return app
}

export function getAuth() {
  return firebaseGetAuth(getFirebaseApp())
}
