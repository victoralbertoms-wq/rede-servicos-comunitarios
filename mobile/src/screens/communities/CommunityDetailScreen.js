import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCommunity, getServices, getCompanies } from '../../services/firestoreService'
import { colors, spacing, radius, shadow } from '../../utils/theme'

export default function CommunityDetailScreen({ route, navigation }) {
  const { id } = route.params
  const [community, setCommunity] = useState(null)
  const [services, setServices] = useState([])
  const [companies, setCompanies] = useState([])
  const [tab, setTab] = useState('services')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCommunity(id), getServices({ communityId: id }), getCompanies({ communityId: id })])
      .then(([c, s, co]) => { setCommunity(c); setServices(s.docs); setCompanies(co.docs) })
      .finally(() => setLoading(false))
  }, [id])

  if (!community) return <View style={styles.center}><Text>Carregando...</Text></View>

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.heroSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>{community.name?.[0]}</Text>
        </View>
        <Text style={styles.name}>{community.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Ionicons name="people" size={14} color="rgba(255,255,255,.8)" /><Text style={styles.statText}>{community.memberCount || 0} membros</Text></View>
          <View style={styles.stat}><Ionicons name="briefcase" size={14} color="rgba(255,255,255,.8)" /><Text style={styles.statText}>{services.length} serviços</Text></View>
          <View style={styles.stat}><Ionicons name="business" size={14} color="rgba(255,255,255,.8)" /><Text style={styles.statText}>{companies.length} empresas</Text></View>
        </View>
        <Text style={styles.description}>{community.description}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ServiceCreate', { communityId: id })}>
          <Ionicons name="add-circle" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Cadastrar Serviço</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CompanyCreate', { communityId: id })}>
          <Ionicons name="business" size={18} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.secondary }]}>Cadastrar Empresa</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'services' && styles.tabActive]} onPress={() => setTab('services')}>
          <Text style={[styles.tabText, tab === 'services' && styles.tabTextActive]}>Serviços ({services.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'companies' && styles.tabActive]} onPress={() => setTab('companies')}>
          <Text style={[styles.tabText, tab === 'companies' && styles.tabTextActive]}>Empresas ({companies.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.listSection}>
        {tab === 'services' && services.map(s => (
          <TouchableOpacity key={s.id} style={[styles.itemCard, shadow.sm]} onPress={() => navigation.navigate('ServiceDetail', { id: s.id })}>
            <View style={[styles.itemIcon, { backgroundColor: `${colors.primary}18` }]}>
              <Ionicons name="briefcase" size={20} color={colors.primary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={1}>{s.name}</Text>
              <Text style={styles.itemSub}>{s.category} • {s.city}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        ))}
        {tab === 'companies' && companies.map(c => (
          <TouchableOpacity key={c.id} style={[styles.itemCard, shadow.sm]} onPress={() => navigation.navigate('CompanyDetail', { id: c.id })}>
            <View style={[styles.itemIcon, { backgroundColor: `${colors.secondary}18` }]}>
              <Ionicons name="business" size={20} color={colors.secondary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={1}>{c.name}</Text>
              <Text style={styles.itemSub}>{c.category}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroSection: { backgroundColor: colors.primary, padding: spacing.lg, alignItems: 'center' },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,.2)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: 'rgba(255,255,255,.85)' },
  description: { fontSize: 14, color: 'rgba(255,255,255,.8)', textAlign: 'center', lineHeight: 20 },
  actions: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1.5, borderColor: colors.border },
  actionText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.md, backgroundColor: colors.surface2, borderRadius: radius.md, padding: 4, marginBottom: spacing.sm },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.surface },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  listSection: { padding: spacing.md },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  itemIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
})
