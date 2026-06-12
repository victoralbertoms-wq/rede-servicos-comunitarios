import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { subscribeToChats } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius, shadow } from '../../utils/theme'

export default function MessagesScreen({ navigation }) {
  const { user } = useAuth()
  const [chats, setChats] = useState([])

  useEffect(() => {
    const unsub = subscribeToChats(user.uid, setChats)
    return unsub
  }, [user.uid])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensagens</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma conversa</Text>
            <Text style={styles.emptySub}>Inicie contato com um profissional!</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const otherId = item.participants?.find(id => id !== user.uid)
          return (
            <TouchableOpacity
              style={[styles.chatItem, shadow.sm]}
              onPress={() => navigation.navigate('Chat', { chatId: item.id, receiverId: otherId })}
            >
              <View style={styles.avatar}><Text style={styles.avatarText}>{otherId?.[0]?.toUpperCase()}</Text></View>
              <View style={styles.chatContent}>
                <Text style={styles.chatName}>{otherId}</Text>
                <Text style={styles.chatLast} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.md, paddingTop: spacing.xl },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  chatItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  chatContent: { flex: 1 },
  chatName: { fontSize: 15, fontWeight: '700', color: colors.text },
  chatLast: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textMuted },
})
