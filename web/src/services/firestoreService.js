import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, onSnapshot,
  serverTimestamp, increment, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { uploadToCloudinary } from '../utils/cloudinary'

// ── Generic helpers ────────────────────────────────────────────────────────────

export async function uploadImage(folder, file) {
  return uploadToCloudinary(file, folder)
}

// Cloudinary não precisa de deleção manual por URL (imagens ficam na conta)
export async function deleteImage(_url) {}

// ── Communities ────────────────────────────────────────────────────────────────

export async function createCommunity(data, logoFile, photoFile) {
  let logoURL = '', photoURL = ''
  const docRef = await addDoc(collection(db, 'communities'), {
    ...data, logoURL, photoURL, memberCount: 0, isActive: true,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  if (logoFile) logoURL = await uploadImage('communities', logoFile)
  if (photoFile) photoURL = await uploadImage('communities', photoFile)
  await updateDoc(docRef, { logoURL, photoURL })
  return docRef.id
}

export async function getCommunities(pageSize = 100, lastDoc = null) {
  let q = query(
    collection(db, 'communities'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )
  if (lastDoc) q = query(q, startAfter(lastDoc))
  const snap = await getDocs(q)
  const docs = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false)
  return { docs, lastDoc: snap.docs[snap.docs.length - 1] }
}

export async function getCommunity(id) {
  const snap = await getDoc(doc(db, 'communities', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateCommunity(id, data) {
  await updateDoc(doc(db, 'communities', id), { ...data, updatedAt: serverTimestamp() })
}

export async function joinCommunity(communityId, userId, password) {
  const community = await getCommunity(communityId)
  if (!community) throw new Error('Comunidade não encontrada')
  if (community.password && community.password !== password) throw new Error('Senha incorreta')
  const memberId = `${communityId}_${userId}`
  await setDoc(doc(db, 'community_members', memberId), {
    communityId, userId, role: 'member',
    status: community.requireApproval ? 'pending' : 'approved',
    joinedAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'communities', communityId), { memberCount: increment(1) })
}

export async function getCommunityMembers(communityId) {
  const q = query(
    collection(db, 'community_members'),
    where('communityId', '==', communityId),
    orderBy('joinedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Services ───────────────────────────────────────────────────────────────────

export async function createService(data, photoFile, userId) {
  let photoURL = ''
  const docRef = await addDoc(collection(db, 'services'), {
    ...data, userId, photoURL, rating: 0, reviewCount: 0,
    status: 'pending', isSponsored: false,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  if (photoFile) {
    photoURL = await uploadImage('services', photoFile)
    await updateDoc(docRef, { photoURL })
  }
  return docRef.id
}

export async function getServices({ communityId, pageSize = 100, lastDoc = null } = {}) {
  let constraints = [orderBy('createdAt', 'desc'), limit(pageSize)]
  if (communityId) constraints = [where('communityId', '==', communityId), ...constraints]
  if (lastDoc) constraints = [...constraints, startAfter(lastDoc)]
  const q = query(collection(db, 'services'), ...constraints)
  const snap = await getDocs(q)
  const docs = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.status === 'approved')
  return { docs, lastDoc: snap.docs[snap.docs.length - 1] }
}

export async function getService(id) {
  const snap = await getDoc(doc(db, 'services', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateService(id, data) {
  await updateDoc(doc(db, 'services', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteService(id) {
  await deleteDoc(doc(db, 'services', id))
}

// ── Companies ──────────────────────────────────────────────────────────────────

export async function createCompany(data, logoFile, photoFile, userId) {
  let logoURL = '', photoURL = ''
  const docRef = await addDoc(collection(db, 'companies'), {
    ...data, userId, logoURL, photoURL, rating: 0, reviewCount: 0,
    status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  if (logoFile) logoURL = await uploadImage('companies', logoFile)
  if (photoFile) photoURL = await uploadImage('companies', photoFile)
  await updateDoc(docRef, { logoURL, photoURL })
  return docRef.id
}

export async function getCompanies({ communityId, pageSize = 100, lastDoc = null } = {}) {
  let constraints = [orderBy('createdAt', 'desc'), limit(pageSize)]
  if (communityId) constraints = [where('communityId', '==', communityId), ...constraints]
  if (lastDoc) constraints = [...constraints, startAfter(lastDoc)]
  const q = query(collection(db, 'companies'), ...constraints)
  const snap = await getDocs(q)
  const docs = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.status === 'approved')
  return { docs, lastDoc: snap.docs[snap.docs.length - 1] }
}

export async function getCompany(id) {
  const snap = await getDoc(doc(db, 'companies', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ── Reviews ────────────────────────────────────────────────────────────────────

export async function addReview({ targetId, targetType, userId, userName, userPhoto, rating, comment }) {
  const ref = await addDoc(collection(db, 'reviews'), {
    targetId, targetType, userId, userName, userPhoto, rating, comment,
    createdAt: serverTimestamp(),
  })
  const col = targetType === 'service' ? 'services' : 'companies'
  const targetRef = doc(db, col, targetId)
  const snap = await getDoc(targetRef)
  if (snap.exists()) {
    const { rating: cur = 0, reviewCount: cnt = 0 } = snap.data()
    const newCount = cnt + 1
    const newRating = ((cur * cnt) + rating) / newCount
    await updateDoc(targetRef, { rating: Math.round(newRating * 10) / 10, reviewCount: newCount })
  }
  return ref.id
}

export async function getReviews(targetId, pageSize = 10) {
  const q = query(
    collection(db, 'reviews'),
    where('targetId', '==', targetId),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Favorites ──────────────────────────────────────────────────────────────────

export async function toggleFavorite(userId, targetId, targetType) {
  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  const favorites = snap.data()?.favorites || { services: [], companies: [] }
  const list = favorites[targetType === 'service' ? 'services' : 'companies'] || []
  const exists = list.includes(targetId)
  const key = targetType === 'service' ? 'favorites.services' : 'favorites.companies'
  await updateDoc(userRef, { [key]: exists ? arrayRemove(targetId) : arrayUnion(targetId) })
  return !exists
}

// ── Messages ───────────────────────────────────────────────────────────────────

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

export async function sendMessage(senderId, receiverId, text) {
  const chatId = getChatId(senderId, receiverId)
  const chatRef = doc(db, 'messages', chatId)
  const chatSnap = await getDoc(chatRef)
  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [senderId, receiverId],
      lastMessage: text, lastSenderId: senderId,
      updatedAt: serverTimestamp(),
    })
  } else {
    await updateDoc(chatRef, { lastMessage: text, lastSenderId: senderId, updatedAt: serverTimestamp() })
  }
  await addDoc(collection(db, 'messages', chatId, 'messages'), {
    senderId, text, type: 'text', read: false, createdAt: serverTimestamp(),
  })
}

export function subscribeToMessages(chatId, callback) {
  const q = query(
    collection(db, 'messages', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export function subscribeToChats(userId, callback) {
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

// ── Admin stats ────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const [users, communities, services, companies, reviews] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'communities')),
    getDocs(collection(db, 'services')),
    getDocs(collection(db, 'companies')),
    getDocs(collection(db, 'reviews')),
  ])
  return {
    users: users.size,
    communities: communities.size,
    services: services.size,
    companies: companies.size,
    reviews: reviews.size,
  }
}

export async function getPendingItems() {
  const [services, companies, members] = await Promise.all([
    getDocs(query(collection(db, 'services'), where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'companies'), where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'community_members'), where('status', '==', 'pending'))),
  ])
  return {
    services: services.docs.map(d => ({ id: d.id, ...d.data() })),
    companies: companies.docs.map(d => ({ id: d.id, ...d.data() })),
    members: members.docs.map(d => ({ id: d.id, ...d.data() })),
  }
}
