import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(uid) {
    const snap = await get(ref(db, `users/${uid}`))
    if (snap.exists()) {
      const data = { id: uid, ...snap.val() }
      setProfile(data)
      return data
    }
    return null
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signUp({ email, password, fullName }) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await set(ref(db, `users/${cred.user.uid}`), {
        email,
        fullName,
        createdAt: new Date().toISOString(),
      })
      await fetchProfile(cred.user.uid)
      return { data: cred }
    } catch (error) {
      return { error }
    }
  }

  async function signIn({ email, password }) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await fetchProfile(cred.user.uid)
      return { data: cred }
    } catch (error) {
      return { error }
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}