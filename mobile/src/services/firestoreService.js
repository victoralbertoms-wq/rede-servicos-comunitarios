import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, increment, arrayUnion, arrayRemove, onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { uploadToCloudinary } from '../utils/cloudinary'

export async function uploadImage(folder, uri) {
  return uploadToCloudinary(uri, folder)
}

export async function getCommunities(pageSize = 100) {
  const q = query(collection(db, 'communities'), orderBy('createdAt', 'desc'), limit(pageSize))
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.isActive !== false)
  return { docs }
}

export async function getCommunity(id) {
  const snap = await getDoc(doc(db, 'communities', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function joinCommunity(communityId, userId, password) {
  const community = await getCommunity(communityId)
  if (!community) throw new Error('Comunidade não encontrada')
  if (community.password && community.password !== password) throw new Error('Senha incorreta')
  const memberId = `${communityId}_${userId}`
  await setDoc(doc(db, 'community_members', memberId), {
    communityId, userId, role: 'member', status: 'approved', joinedAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'communities', communityId), { memberCount: increment(1) })
}

export async function getServices({ communityId, category, pageSize = 100, search } = {}) {
  let constraints = [orderBy('createdAt', 'desc'), limit(pageSize)]
  if (communityId) constraints = [where('communityId', '==', communityId), ...constraints]
  const q = query(collection(db, 'services'), ...constraints)
  const snap = await getDocs(q)
  let docs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.status === 'approved')
  if (search) {
    const s = search.toLowerCase()
    docs = docs.filter(d => d.name?.toLowerCase().includes(s) || d.category?.toLowerCase().includes(s) || d.city?.toLowerCase().includes(s))
  }
  if (category) docs = docs.filter(d => d.category === category)
  return { docs }
}

export async function getService(id) {
  const snap = await getDoc(doc(db, 'services', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createService(data, photoUri, userId) {
  let photoURL = ''
  const docRef = await addDoc(collection(db, 'services'), {
    ...data, userId, photoURL, rating: 0, reviewCount: 0,
    status: 'pending', isSponsored: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  if (photoUri) {
    photoURL = await uploadImage('services', photoUri)
    await updateDoc(docRef, { photoURL })
  }
  return docRef.id
}

export async function getCompanies({ communityId, pageSize = 100, search } = {}) {
  let constraints = [orderBy('createdAt', 'desc'), limit(pageSize)]
  if (communityId) constraints = [where('communityId', '==', communityId), ...constraints]
  const q = query(collection(db, 'companies'), ...constraints)
  const snap = await getDocs(q)
  let docs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.status === 'approved')
  if (search) {
    const s = search.toLowerCase()
    docs = docs.filter(d => d.name?.toLowerCase().includes(s) || d.category?.toLowerCase().includes(s))
  }
  return { docs }
}

export async function getCompany(id) {
  const snap = await getDoc(doc(db, 'companies', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createCompany(data, logoUri, photoUri, userId) {
  let logoURL = '', photoURL = ''
  const docRef = await addDoc(collection(db, 'companies'), {
    ...data, userId, logoURL, photoURL, rating: 0, reviewCount: 0,
    status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  if (logoUri) logoURL = await uploadImage('companies', logoUri)
  if (photoUri) photoURL = await uploadImage('companies', photoUri)
  if (logoUri || photoUri) await updateDoc(docRef, { logoURL, photoURL })
  return docRef.id
}

export async function getReviews(targetId, pageSize = 10) {
  const q = query(collection(db, 'reviews'), where('targetId', '==', targetId), orderBy('createdAt', 'desc'), limit(pageSize))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addReview({ targetId, targetType, userId, userName, rating, comment }) {
  await addDoc(collection(db, 'reviews'), { targetId, targetType, userId, userName, rating, comment, createdAt: serverTimestamp() })
  const col = targetType === 'service' ? 'services' : 'companies'
  const targetRef = doc(db, col, targetId)
  const snap = await getDoc(targetRef)
  if (snap.exists()) {
    const { rating: cur = 0, reviewCount: cnt = 0 } = snap.data()
    const newCount = cnt + 1
    const newRating = ((cur * cnt) + rating) / newCount
    await updateDoc(targetRef, { rating: Math.round(newRating * 10) / 10, reviewCount: newCount })
  }
}

export async function toggleFavorite(userId, targetId, targetType) {
  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  const favorites = snap.data()?.favorites || { services: [], companies: [] }
  const key = targetType === 'service' ? 'favorites.services' : 'favorites.companies'
  const list = favorites[targetType === 'service' ? 'services' : 'companies'] || []
  const exists = list.includes(targetId)
  await updateDoc(userRef, { [key]: exists ? arrayRemove(targetId) : arrayUnion(targetId) })
  return !exists
}

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

export async function sendMessage(senderId, receiverId, text) {
  const chatId = getChatId(senderId, receiverId)
  const chatRef = doc(db, 'messages', chatId)
  const chatSnap = await getDoc(chatRef)
  if (!chatSnap.exists()) {
    await setDoc(chatRef, { participants: [senderId, receiverId], lastMessage: text, lastSenderId: senderId, updatedAt: serverTimestamp() })
  } else {
    await updateDoc(chatRef, { lastMessage: text, lastSenderId: senderId, updatedAt: serverTimestamp() })
  }
  await addDoc(collection(db, 'messages', chatId, 'messages'), { senderId, text, type: 'text', read: false, createdAt: serverTimestamp() })
}

export function subscribeToMessages(chatId, callback) {
  const q = query(collection(db, 'messages', chatId, 'messages'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function subscribeToChats(userId, callback) {
  const q = query(collection(db, 'messages'), where('participants', 'array-contains', userId), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
