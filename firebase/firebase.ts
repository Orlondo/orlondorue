import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCFExAAQ7VPu1EcID6jXoPuVTgdsn2PyYU',
  authDomain: 'orlondorue-b6504.firebaseapp.com',
  projectId: 'orlondorue-b6504',
  storageBucket: 'orlondorue-b6504.appspot.com',
  messagingSenderId: '1003115197927',
  appId: '1:1003115197927:web:d3f7a76b686510bf97b942',
  measurementId: 'G-HSQKWVVTYV',
  automaticDataCollectionEnabled: true,
}
const app = initializeApp(clientCredentials)

if (typeof window !== 'undefined') {
  import('firebase/app-check').then(firebaseAppCheck => {
    firebaseAppCheck.initializeAppCheck(app, {
      provider: new firebaseAppCheck.ReCaptchaV3Provider(
        '6LctFtUkAAAAAGgZQ58fQcDOHB4Orf7BHMi5z0Al',
      ),
      isTokenAutoRefreshEnabled: true,
    })
  })
}

export const db = getFirestore(app)

export default function initFirebase() {
  if (!getApps?.length) {
    initializeApp(clientCredentials)
    console.log('Firebase app initialized')
  }
}
