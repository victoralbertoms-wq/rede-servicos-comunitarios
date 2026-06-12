import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getServices } from '../../services/firestoreService'
import { colors, spacing, radius, shadow } from '../../utils/theme'

export default function ServicesScreen({ navigation, route }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(route?.params?.query || '')

  useEffect(() => {
    setLoading(true)
    getServices({ search, pageSize: 30 })
      .then(({ docs }) => setServices(docs))
      .finally(() => setLoading(false))
  }, [search])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Serviços</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar profissional..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ServiceCreate', {})}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={services}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
              <Text style={styles.emptySub}>Seja o primeiro a cadastrar!</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, shadow.sm]} onPress={() => navigation.navigate('ServiceDetail', { id: item.id })}>
            <View style={[styles.cardImgPlaceholder, { backgroundColor: colors.primary }]}>
              <Ionicons name="briefcase" size={28} color="rgba(255,255,255,.6)" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.badgeRow}>
                <View style={styles.badge}><Text style={styles.badgeText}>{item.category}</Text></View>
                {item.isSponsored && <View style={[styles.badge, { backgroundColor: `${colors.accent}20` }]}><Text style={[styles.badgeText, { color: colors.accent }]}>Destaque</Text></View>}
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{item.specialty}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color={colors.accent} />
                <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({item.reviewCount || 0})</Text>
                {item.city && <Text style={styles.city}> · {item.city}, {item.state}</Text>}
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
  header: { backgroundColor: colors.primary, padding: spacing.md, paddingTop: spacing.xl },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.full, paddingHorizontal: spacing.md },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 80 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  cardImgPlaceholder: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, padding: spacing.sm },
  badgeRow: { flexDirection: 'row', gap: 4, marginBottom: 3 },
  badge: { backgroundColor: `${colors.primary}18`, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.text },
  ratingCount: { fontSize: 11, color: colors.textMuted },
  city: { fontSize: 11, color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 64, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted },
})
