import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { getCommunities, getServices, getCompanies } from '../services/firestoreService'
import { colors, spacing, radius, shadow } from '../utils/theme'

function StatCard({ icon, label, count, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.statCard, shadow.md]} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

function ServiceCard({ item, onPress }) {
  return (
    <TouchableOpacity style={[styles.serviceCard, shadow.sm]} onPress={onPress}>
      <View style={[styles.cardImgPlaceholder, { backgroundColor: colors.primary }]}>
        <Ionicons name="briefcase" size={32} color="rgba(255,255,255,.6)" />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.badge}><Text style={styles.badgeText}>{item.category}</Text></View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{item.specialty}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.accent} />
          <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({item.reviewCount || 0})</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen({ navigation }) {
  const { userProfile } = useAuth()
  const [communities, setCommunities] = useState([])
  const [services, setServices] = useState([])
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCommunities(4), getServices({ pageSize: 6 }), getCompanies({ pageSize: 4 })])
      .then(([c, s, co]) => { setCommunities(c.docs); setServices(s.docs); setCompanies(co.docs) })
      .finally(() => setLoading(false))
  }, [])

  const firstName = userProfile?.displayName?.split(' ')[0] || 'Usuário'

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.greeting}>Olá, {firstName}! 👋</Text>
        <Text style={styles.bannerSub}>Encontre profissionais da sua comunidade</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar serviços, profissionais..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => navigation.navigate('Services', { query: search })}
          />
        </View>
      </View>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="people" label="Comunidades" count={communities.length} color={colors.primary} onPress={() => navigation.navigate('Communities')} />
          <StatCard icon="briefcase" label="Serviços" count={services.length} color={colors.secondary} onPress={() => navigation.navigate('Services')} />
          <StatCard icon="business" label="Empresas" count={companies.length} color={colors.success} onPress={() => navigation.navigate('Companies')} />
        </View>

        {/* Services */}
        {services.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Serviços em Destaque</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={services}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <ServiceCard item={item} onPress={() => navigation.navigate('ServiceDetail', { id: item.id })} />
              )}
              contentContainerStyle={{ paddingRight: spacing.md }}
            />
          </View>
        )}

        {/* Communities */}
        {communities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comunidades</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Communities')}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {communities.slice(0, 3).map(c => (
              <TouchableOpacity key={c.id} style={[styles.communityCard, shadow.sm]} onPress={() => navigation.navigate('CommunityDetail', { id: c.id })}>
                <View style={[styles.commLogo, { backgroundColor: colors.primary }]}>
                  <Text style={styles.commLogoText}>{c.name?.[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commName} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.commMeta}>{c.memberCount || 0} membros</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  banner: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  greeting: { fontSize: 24, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,.85)', marginTop: 4, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.full, paddingHorizontal: spacing.md },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  content: { padding: spacing.md, marginTop: -spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  statIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  serviceCard: { width: 180, backgroundColor: colors.surface, borderRadius: radius.lg, marginRight: spacing.sm, overflow: 'hidden' },
  cardImgPlaceholder: { height: 100, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: spacing.sm },
  badge: { backgroundColor: `${colors.primary}18`, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.text },
  ratingCount: { fontSize: 11, color: colors.textMuted },
  communityCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  commLogo: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  commLogoText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  commName: { fontSize: 15, fontWeight: '700', color: colors.text },
  commMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
})
