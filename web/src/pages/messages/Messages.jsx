import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { subscribeToChats, subscribeToMessages, sendMessage, getChatId, getCommunityMembers } from '../../services/firestoreService'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { HiPaperAirplane, HiChat, HiPencilAlt, HiSearch, HiX } from 'react-icons/hi'

function Avatar({ user, size = 40, fontSize = 16 }) {
  const name = user?.displayName || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: user?.photoURL ? `url(${user.photoURL}) center/cover` : 'linear-gradient(135deg,var(--primary),var(--secondary))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize,
    }}>
      {!user?.photoURL && name[0]?.toUpperCase()}
    </div>
  )
}

function NewMessageModal({ onClose, onSelect, currentUserId }) {
  const { userProfile } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const communities = userProfile?.communities || []
    if (communities.length === 0) { setLoading(false); return }

    Promise.all(communities.map(cid => getCommunityMembers(cid)))
      .then(results => {
        const seen = new Set()
        const all = []
        for (const list of results) {
          for (const m of list) {
            if (m.userId !== currentUserId && !seen.has(m.userId)) {
              seen.add(m.userId)
              all.push(m)
            }
          }
        }
        setMembers(all)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter(m => {
    const name = m.user?.displayName || ''
    const email = m.user?.email || ''
    const s = search.toLowerCase()
    return name.toLowerCase().includes(s) || email.toLowerCase().includes(s)
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">Nova Mensagem</h2>
          <button className="btn-icon btn-sm" onClick={onClose}><HiX /></button>
        </div>
        <div style={{ padding: '0 1.5rem .75rem' }}>
          <div className="search-box">
            <HiSearch className="search-icon" size={16} />
            <input
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Buscar membro..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '0 .75rem .75rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '.88rem' }}>
              {members.length === 0 ? 'Entre em uma comunidade para enviar mensagens.' : 'Nenhum membro encontrado.'}
            </p>
          ) : (
            filtered.map(m => (
              <button
                key={m.userId}
                onClick={() => onSelect(m.userId, m.user)}
                style={{
                  width: '100%', padding: '.75rem', border: 'none', background: 'none',
                  display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer',
                  borderRadius: 'var(--radius)', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Avatar user={m.user} size={40} fontSize={16} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{m.user?.displayName || 'Usuário'}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{m.user?.email || ''}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function Messages() {
  const { user, userProfile } = useAuth()
  const { chatId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toUserId = searchParams.get('to')

  const [chats, setChats] = useState([])
  const [chatUsers, setChatUsers] = useState({})
  const [messages, setMessages] = useState([])
  const [activeChat, setActiveChat] = useState(chatId || null)
  const [otherUser, setOtherUser] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const unsub = subscribeToChats(user.uid, setChats)
    return unsub
  }, [user.uid])

  // Load names for all chats
  useEffect(() => {
    for (const chat of chats) {
      const otherId = chat.participants?.find(id => id !== user.uid)
      if (otherId && !chatUsers[otherId]) {
        getDoc(doc(db, 'users', otherId)).then(snap => {
          if (snap.exists()) {
            setChatUsers(prev => ({ ...prev, [otherId]: snap.data() }))
          }
        })
      }
    }
  }, [chats])

  useEffect(() => {
    if (toUserId && !activeChat) {
      const id = getChatId(user.uid, toUserId)
      setActiveChat(id)
      loadOtherUser(toUserId)
    }
  }, [toUserId])

  useEffect(() => {
    if (!activeChat) return
    const unsub = subscribeToMessages(activeChat, setMessages)
    const otherId = activeChat.split('_').find(id => id !== user.uid)
    if (otherId) loadOtherUser(otherId)
    return unsub
  }, [activeChat])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadOtherUser(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) setOtherUser(snap.data())
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !activeChat) return
    setSending(true)
    const otherId = activeChat.split('_').find(id => id !== user.uid)
    try {
      await sendMessage(user.uid, otherId, text.trim())
      setText('')
    } finally {
      setSending(false)
    }
  }

  function handleSelectMember(uid, memberUser) {
    setShowNew(false)
    const id = getChatId(user.uid, uid)
    setActiveChat(id)
    setOtherUser(memberUser)
    navigate(`/mensagens/${id}`)
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 73px)', margin: '-2rem -2.5rem', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Mensagens</h2>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.78rem' }}
            onClick={() => setShowNew(true)}
            title="Nova mensagem"
          >
            <HiPencilAlt size={14} /> Nova
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
              <HiChat size={32} style={{ margin: '0 auto .75rem', display: 'block', opacity: .4 }} />
              Nenhuma conversa ainda.<br />
              <button onClick={() => setShowNew(true)} style={{ marginTop: '.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '.85rem' }}>
                Iniciar conversa
              </button>
            </div>
          ) : (
            chats.map(chat => {
              const otherId = chat.participants?.find(id => id !== user.uid)
              const chatUser = chatUsers[otherId]
              const isActive = chat.id === activeChat
              return (
                <button
                  key={chat.id}
                  onClick={() => { setActiveChat(chat.id); navigate(`/mensagens/${chat.id}`) }}
                  style={{
                    width: '100%', padding: '.875rem 1.25rem', border: 'none', textAlign: 'left',
                    background: isActive ? 'var(--surface2)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.75rem',
                  }}
                >
                  <Avatar user={chatUser} size={40} fontSize={15} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontWeight: 600, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chatUser?.displayName || 'Carregando...'}
                    </p>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeChat ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <HiChat size={52} style={{ opacity: .3 }} />
            <p style={{ marginTop: '1rem', fontWeight: 500 }}>Selecione uma conversa</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setShowNew(true)}>
              <HiPencilAlt /> Nova mensagem
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <Avatar user={otherUser} size={40} fontSize={16} />
              <div>
                <p style={{ fontWeight: 700 }}>{otherUser?.displayName || 'Usuário'}</p>
                {otherUser?.email && <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{otherUser.email}</p>}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {messages.map(msg => {
                const mine = msg.senderId === user.uid
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%', padding: '.65rem 1rem', borderRadius: 16,
                      borderBottomRightRadius: mine ? 4 : 16,
                      borderBottomLeftRadius: mine ? 16 : 4,
                      background: mine ? 'var(--primary)' : 'var(--surface2)',
                      color: mine ? '#fff' : 'var(--text)',
                    }}>
                      <p style={{ fontSize: '.9rem', lineHeight: 1.5 }}>{msg.text}</p>
                      <p style={{ fontSize: '.7rem', opacity: .7, textAlign: 'right', marginTop: '.25rem' }}>{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.75rem', background: 'var(--surface)' }}>
              <input
                className="form-input"
                style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
                placeholder="Digite sua mensagem..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '.6rem 1rem' }}
                disabled={sending || !text.trim()}
              >
                <HiPaperAirplane style={{ transform: 'rotate(90deg)' }} />
              </button>
            </form>
          </>
        )}
      </div>

      {showNew && (
        <NewMessageModal
          onClose={() => setShowNew(false)}
          onSelect={handleSelectMember}
          currentUserId={user.uid}
        />
      )}
    </div>
  )
}
