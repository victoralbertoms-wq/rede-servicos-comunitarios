import { useState, useEffect, useRef } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { subscribeToMessages, sendMessage, getChatId } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

export default function ChatScreen({ route, navigation }) {
  const { receiverId, chatId: existingChatId } = route.params
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  const chatId = existingChatId || getChatId(user.uid, receiverId)

  useEffect(() => {
    navigation.setOptions({ title: receiverId || 'Chat' })
    const unsub = subscribeToMessages(chatId, msgs => {
      setMessages(msgs.reverse())
      setTimeout(() => listRef.current?.scrollToOffset({ offset: 0 }), 100)
    })
    return unsub
  }, [chatId])

  async function handleSend() {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await sendMessage(user.uid, receiverId, text.trim())
      setText('')
    } finally {
      setSending(false)
    }
  }

  const formatTime = ts => {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={88}>
      <FlatList
        ref={listRef}
        data={messages}
        inverted
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const mine = item.senderId === user.uid
          return (
            <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.text}</Text>
              <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>{formatTime(item.createdAt)}</Text>
            </View>
          )
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={colors.textLight}
          value={text}
          onChangeText={setText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.md, paddingBottom: 8 },
  bubble: { maxWidth: '75%', borderRadius: 18, padding: 12, marginBottom: 8 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  bubbleTextMine: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
  bubbleTimeMine: { color: 'rgba(255,255,255,.7)' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm, paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.surface2, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, color: colors.text, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
})
