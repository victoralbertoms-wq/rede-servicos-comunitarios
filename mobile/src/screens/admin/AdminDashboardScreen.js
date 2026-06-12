import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, shadow } from '../../utils/theme'

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({ users: 0, communities: 0, services: 0, companies: 0 })
  const [pendingServices, setPendingServices] = useState([])
  const [pendingCompanies, setPendingCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const [users, communities, services, companies] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'communities')),
      getDocs(collection(db, 'services')),
      getDocs(collection(db, 'companies')),
    ])
    setStats({ users: users.size, communities: communities.size, services: services.size, companies: companies.size })
    setPendingServices(services.docs.filter(d => d.data().status === 'pending').map(d => ({ id: d.id, ...d.data() })))
    setPendingCompanies(companies.docs.filter(d => d.data().status === 'pending').map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(col, id, name) {
    await updateDoc(doc(db, col, id), { status: 'approved' })
    Alert.alert('Aprovado', `${name} foi aprovado!`)
    load()
  }

  async function reject(col, id, name) {
    await updateDoc(doc(db, col, id), { status: 'rejected' })
    Alert.alert('Rejeitado', `${name} foi rejeitado.`)
    load()
  }

  const statCards = [
    { icon: 'people', label: 'Usuários', value: stats.users, color: colors.primary },
    { icon: 'people-circle', label: 'Comunidades', value: stats.communities, color: colors.secondary },
    { icon: 'briefcase', label: 'Serviços', value: stats.services, color: colors.success },
    { icon: 'business', label: 'Empresas', value: stats.companies, color: colors.warning },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel Admin</Text>
        <Text style={styles.subtitle}>Gestão completa da plataforma</Text>
      </View>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          {statCards.map(({ icon, label, value, color }) => (
            <View key={label} style={[styles.statCard, shadow.md]}>
              <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
                <Ionicons name={icon} size={24} color={color} />
              </View>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Pending services */}
        <View style={[styles.section, shadow.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Serviços Pendentes</Text>
            <View style={styles.countBadge}><Text style={styles.countText}>{pendingServices.length}</Text></View>
          </View>
          {pendingServices.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum pendente</Text>
          ) : (
            pendingServices.map(s => (
              <View key={s.id} style={styles.pendingItem}>
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.pendingCat}>{s.category}</Text>
                </View>
                <TouchableOpacity style={styles.approveBtn} onPress={() => approve('services', s.id, s.name)}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => reject('services', s.id, s.name)}>
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Pending companies */}
        <View style={[styles.section, shadow.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Empresas Pendentes</Text>
            <View style={styles.countBadge}><Text style={styles.countText}>{pendingCompanies.length}</Text></View>
          </View>
          {pendingCompanies.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma pendente</Text>
          ) : (
            pendingCompanies.map(c => (
              <View key={c.id} style={styles.pendingItem}>
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingName} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.pendingCat}>{c.category}</Text>
                </View>
                <TouchableOpacity style={styles.approveBtn} onPress={() => approve('companies', c.id, c.name)}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => reject('companies', c.id, c.name)}>
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,.8)', marginTop: 4 },
  content: { padding: spacing.md, gap: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center' },
  statIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  section: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  countBadge: { backgroundColor: colors.warning, borderRadius: radius.full, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', padding: spacing.md },
  pendingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.surface2, gap: spacing.sm },
  pendingInfo: { flex: 1 },
  pendingName: { fontSize: 14, fontWeight: '700', color: colors.text },
  pendingCat: { fontSize: 12, color: colors.textMuted },
  approveBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
})
