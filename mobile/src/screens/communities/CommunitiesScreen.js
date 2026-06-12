import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCommunities, joinCommunity } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius, shadow } from '../../utils/theme'

function JoinModal({ community, visible, onClose, onJoined }) {
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    setLoading(true)
    try {
      await joinCommunity(community.id, user.uid, password)
      Alert.alert('Sucesso', `Bem-vindo à ${community.name}!`)
      onJoined()
    } catch (err) {
      Alert.alert('Erro', err.message || 'Erro ao entrar na comunidade.')
    } finally {
      setLoading(false)
      setPassword('')
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Entrar em {community?.name}</Text>
          {community?.password && (
            <View style={styles.field}>
              <Text style={styles.label}>Senha da comunidade</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a senha"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          )}
          <Text style={styles.modalDesc}>{community?.description}</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleJoin} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function CommunitiesScreen({ navigation }) {
  const { userProfile } = useAuth()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [joining, setJoining] = useState(null)

  async function load() {
    const { docs } = await getCommunities(50)
    setCommunities(docs)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = communities.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))

  function isMember(community) {
    return userProfile?.communities?.includes(community.id)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunidades</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar comunidade..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, shadow.sm]} onPress={() => navigation.navigate('CommunityDetail', { id: item.id })}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>{item.name?.[0]}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{item.memberCount || 0} membros</Text>
              {item.password && (
                <View style={styles.privateTag}>
                  <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
                  <Text style={styles.privateText}>Privada</Text>
                </View>
              )}
            </View>
            {isMember(item) ? (
              <View style={styles.memberBadge}><Text style={styles.memberText}>Membro</Text></View>
            ) : (
              <TouchableOpacity style={styles.joinBtn} onPress={e => { e.stopPropagation(); setJoining(item) }}>
                <Text style={styles.joinText}>Entrar</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />

      {joining && (
        <JoinModal
          community={joining}
          visible={!!joining}
          onClose={() => setJoining(null)}
          onJoined={() => { setJoining(null); load() }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.md, paddingTop: spacing.xl },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.full, paddingHorizontal: spacing.md },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  logo: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  privateTag: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  privateText: { fontSize: 11, color: colors.textMuted },
  memberBadge: { backgroundColor: `${colors.success}18`, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  memberText: { fontSize: 11, fontWeight: '700', color: colors.success },
  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6 },
  joinText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  modalDesc: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 15, color: colors.text },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  btnSecondary: { flex: 1, backgroundColor: colors.surface2, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: colors.text },
  btn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
