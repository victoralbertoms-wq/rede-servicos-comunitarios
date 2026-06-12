import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUserProfile(uid) {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
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
      uid: user.uid,
      displayName,
      email,
      photoURL: '',
      phone: '',
      role: 'user',
      communities: [],
      favorites: { services: [], companies: [] },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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

  async function loginWithGoogle() {
    const { user } = await signInWithPopup(auth, googleProvider)
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const profile = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        phone: '',
        role: 'user',
        communities: [],
        favorites: { services: [], companies: [] },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(ref, profile)
      setUserProfile(profile)
    } else {
      setUserProfile(snap.data())
    }
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    fetchUserProfile,
    isAdmin: userProfile?.role === 'admin',
    isCommunityAdmin: (communityId) =>
      userProfile?.role === 'admin' ||
      (userProfile?.adminOf || []).includes(communityId),
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
