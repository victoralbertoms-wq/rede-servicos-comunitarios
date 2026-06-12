import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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
