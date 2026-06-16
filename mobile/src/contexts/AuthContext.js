import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest(
    googleClientId ? { webClientId: googleClientId } : null
  )

  useEffect(() => {
    if (googleResponse?.type !== 'success') return
    const id_token = googleResponse.params?.id_token
    if (!id_token) return
    const credential = GoogleAuthProvider.credential(id_token)
    signInWithCredential(auth, credential).then(async ({ user: firebaseUser }) => {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!snap.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || '',
          phone: '',
          role: 'user',
          communities: [],
          favorites: { services: [], companies: [] },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    }).catch(() => {})
  }, [googleResponse])

  async function fetchUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      setUserProfile(snap.data())
      return snap.data()
    }
    return null
  }

  async function registerWithEmail(email, password, displayName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName })
    const profile = {
      uid: user.uid, displayName, email, photoURL: '', phone: '',
      role: 'user', communities: [],
      favorites: { services: [], companies: [] },
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', user.uid), profile)
    setUserProfile(profile)
    return user
  }

  async function loginWithEmail(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    await fetchUserProfile(user.uid)
    return user
  }

  async function logout() {
    await signOut(auth)
    setUserProfile(null)
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email)
  }

  useEffect(() => { WebBrowser.maybeCompleteAuthSession() }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) await fetchUserProfile(firebaseUser.uid)
      else setUserProfile(null)
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{
      user, userProfile, loading,
      registerWithEmail, loginWithEmail, logout, resetPassword, fetchUserProfile,
      loginWithGoogle: () => googlePromptAsync?.(),
      isAdmin: userProfile?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
