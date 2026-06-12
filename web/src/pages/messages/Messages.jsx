import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { subscribeToChats, subscribeToMessages, sendMessage, getChatId } from '../../services/firestoreService'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { HiPaperAirplane, HiChat } from 'react-icons/hi'

export default function Messages() {
  const { user, userProfile } = useAuth()
  const { chatId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toUserId = searchParams.get('to')

  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [activeChat, setActiveChat] = useState(chatId || null)
  const [otherUser, setOtherUser] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const unsub = subscribeToChats(user.uid, setChats)
    return unsub
  }, [user.uid])

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

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 73px)', margin: '-2rem -2.5rem', overflow: 'hidden' }}>
      {/* Chat list */}
      <div style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Mensagens</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.88rem' }}>
              Nenhuma conversa ainda
            </div>
          ) : (
            chats.map(chat => {
              const otherId = chat.participants?.find(id => id !== user.uid)
              const isActive = chat.id === activeChat
              return (
                <button
                  key={chat.id}
                  onClick={() => { setActiveChat(chat.id); navigate(`/mensagens/${chat.id}`) }}
                  style={{
                    width: '100%', padding: '1rem 1.25rem', border: 'none', textAlign: 'left',
                    background: isActive ? 'var(--surface2)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.75rem',
                  }}
                >
                  <div className="avatar avatar-sm avatar-placeholder" style={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
                    {otherId?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontWeight: 600, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {otherId}
                    </p>
                    <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            <HiChat size={48} />
            <p style={{ marginTop: '1rem', fontWeight: 500 }}>Selecione uma conversa</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div className="avatar avatar-sm avatar-placeholder" style={{ width: 40, height: 40, fontSize: 16 }}>
                {otherUser?.displayName?.[0] || '?'}
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>{otherUser?.displayName || 'Usuário'}</p>
              </div>
            </div>

            {/* Messages */}
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

            {/* Input */}
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
    </div>
  )
}
