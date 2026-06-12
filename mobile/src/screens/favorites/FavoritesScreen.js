import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius, shadow } from '../../utils/theme'

export default function FavoritesScreen({ navigation }) {
  const { userProfile } = useAuth()
  const [services, setServices] = useState([])
  const [companies, setCompanies] = useState([])
  const [tab, setTab] = useState('services')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const favServices = userProfile?.favorites?.services || []
      const favCompanies = userProfile?.favorites?.companies || []
      const [svcDocs, compDocs] = await Promise.all([
        Promise.all(favServices.map(id => getDoc(doc(db, 'services', id)))),
        Promise.all(favCompanies.map(id => getDoc(doc(db, 'companies', id)))),
      ])
      setServices(svcDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })))
      setCompanies(compDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [userProfile])

  const data = tab === 'services' ? services : companies
  const emptyMsg = tab === 'services' ? 'Nenhum serviço favorito' : 'Nenhuma empresa favorita'
  const emptyTo = tab === 'services' ? 'Services' : 'Companies'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'services' && styles.tabActive]} onPress={() => setTab('services')}>
          <Text style={[styles.tabText, tab === 'services' && styles.tabTextActive]}>Serviços ({services.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'companies' && styles.tabActive]} onPress={() => setTab('companies')}>
          <Text style={[styles.tabText, tab === 'companies' && styles.tabTextActive]}>Empresas ({companies.length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading && (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>{emptyMsg}</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate(emptyTo)}>
              <Text style={styles.emptyBtnText}>Explorar</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, shadow.sm]}
            onPress={() => navigation.navigate(tab === 'services' ? 'ServiceDetail' : 'CompanyDetail', { id: item.id })}
          >
            <View style={[styles.icon, { backgroundColor: tab === 'services' ? `${colors.primary}18` : `${colors.secondary}18` }]}>
              <Ionicons name={tab === 'services' ? 'briefcase' : 'business'} size={22} color={tab === 'services' ? colors.primary : colors.secondary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.category}{item.city ? ` • ${item.city}` : ''}</Text>
            </View>
            <Ionicons name="heart" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.error, padding: spacing.md, paddingTop: spacing.xl },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  tabBar: { flexDirection: 'row', margin: spacing.md, backgroundColor: colors.surface2, borderRadius: radius.md, padding: 4 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.surface },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 64, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 24, paddingVertical: 10 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
})
