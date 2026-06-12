import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCompanies } from '../../services/firestoreService'
import { colors, spacing, radius, shadow } from '../../utils/theme'

export default function CompaniesScreen({ navigation }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getCompanies({ search, pageSize: 30 }).then(({ docs }) => setCompanies(docs)).finally(() => setLoading(false))
  }, [search])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Empresas</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Buscar empresa..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
        </View>
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CompanyCreate', {})}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={companies}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading && (
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma empresa encontrada</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, shadow.sm]} onPress={() => navigation.navigate('CompanyDetail', { id: item.id })}>
            <View style={[styles.logo, { backgroundColor: colors.secondary }]}>
              <Text style={styles.logoText}>{item.name?.[0]}</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.badge}><Text style={styles.badgeText}>{item.category}</Text></View>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{item.description}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={colors.accent} />
                <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({item.reviewCount || 0})</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.secondary, padding: spacing.md, paddingTop: spacing.xl },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.full, paddingHorizontal: spacing.md },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', zIndex: 10, elevation: 8 },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 80 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  logo: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  cardContent: { flex: 1 },
  badge: { backgroundColor: `${colors.secondary}18`, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.secondary },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.text },
  ratingCount: { fontSize: 11, color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 64, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
})
