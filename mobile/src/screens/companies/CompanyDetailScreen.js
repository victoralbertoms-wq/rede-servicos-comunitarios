import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Linking, Image, TextInput, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCompany, getReviews, addReview, toggleFavorite } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

function Stars({ value, onChange, size = 22 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange?.(i)} disabled={!onChange}>
          <Ionicons name={i <= value ? 'star' : 'star-outline'} size={size} color={i <= value ? colors.accent : colors.border} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default function CompanyDetailScreen({ route, navigation }) {
  const { id } = route.params
  const { user, userProfile, isAdmin } = useAuth()
  const [company, setCompany] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isFav, setIsFav] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getCompany(id), getReviews(id)]).then(([c, r]) => { setCompany(c); setReviews(r) })
    setIsFav((userProfile?.favorites?.companies || []).includes(id))
  }, [id])

  async function handleFav() {
    const added = await toggleFavorite(user.uid, id, 'company')
    setIsFav(added)
    Alert.alert('', added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.')
  }

  async function submitReview() {
    if (!newRating) return Alert.alert('Atenção', 'Selecione uma nota.')
    setSubmitting(true)
    try {
      await addReview({ targetId: id, targetType: 'company', userId: user.uid, userName: userProfile.displayName, rating: newRating, comment: newComment })
      setReviews(p => [{ id: Date.now(), rating: newRating, comment: newComment, userName: userProfile.displayName }, ...p])
      setNewRating(0); setNewComment('')
      Alert.alert('Sucesso', 'Avaliação enviada!')
    } catch { Alert.alert('Erro', 'Não foi possível enviar.') }
    finally { setSubmitting(false) }
  }

  if (!company) return <View style={styles.center}><Text>Carregando...</Text></View>

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { backgroundColor: colors.secondary }]}>
        {company.photoURL
          ? <Image source={{ uri: company.photoURL }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : null
        }
        {company.logoURL
          ? <Image source={{ uri: company.logoURL }} style={styles.heroLogo} resizeMode="contain" />
          : <View style={styles.heroLogo}><Text style={styles.heroLogoText}>{company.name?.[0]}</Text></View>
        }
      </View>

      <View style={styles.card}>
        <View style={[styles.badge, { alignSelf: 'flex-start', marginBottom: spacing.xs }]}>
          <Text style={styles.badgeText}>{company.category}</Text>
        </View>
        <Text style={styles.name}>{company.name}</Text>
        {company.legalName && <Text style={styles.legalName}>{company.legalName}</Text>}
        {company.cnpj && <Text style={styles.cnpj}>CNPJ: {company.cnpj}</Text>}

        <View style={styles.ratingRow}>
          <Stars value={Math.round(company.rating || 0)} size={18} />
          <Text style={styles.ratingVal}>{(company.rating || 0).toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({company.reviewCount || 0})</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleFav}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? colors.error : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Chat', { receiverId: company.userId })}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          {(isAdmin || company.userId === user?.uid) && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: `${colors.secondary}15` }]} onPress={() => navigation.navigate('CompanyEdit', { id })}>
              <Ionicons name="pencil" size={20} color={colors.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {company.description && <Text style={styles.description}>{company.description}</Text>}

        <View style={styles.contactGroup}>
          {company.phone && <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${company.phone}`)}>
            <Ionicons name="call" size={18} color={colors.primary} /><Text style={styles.contactText}>{company.phone}</Text>
          </TouchableOpacity>}
          {company.whatsapp && <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25d36620' }]} onPress={() => Linking.openURL(`https://wa.me/55${company.whatsapp.replace(/\D/g,'')}`)} >
            <Ionicons name="logo-whatsapp" size={18} color="#25d366" /><Text style={[styles.contactText, { color: '#25d366' }]}>WhatsApp</Text>
          </TouchableOpacity>}
          {company.website && <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(company.website)}>
            <Ionicons name="globe" size={18} color={colors.textMuted} /><Text style={styles.contactText}>Site</Text>
          </TouchableOpacity>}
        </View>
        {company.address && <View style={styles.infoItem}><Ionicons name="location" size={14} color={colors.textMuted} /><Text style={styles.infoText}>{company.address}</Text></View>}
      </View>

      <View style={[styles.card, { marginTop: spacing.sm }]}>
        <Text style={styles.sectionTitle}>Avaliações</Text>
        <View style={styles.reviewForm}>
          <Stars value={newRating} onChange={setNewRating} />
          <TextInput style={[styles.input, { marginTop: spacing.sm }]} placeholder="Comentário..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} value={newComment} onChangeText={setNewComment} />
          <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={submitReview} disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'Enviando...' : 'Enviar Avaliação'}</Text>
          </TouchableOpacity>
        </View>
        {reviews.map(r => (
          <View key={r.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{r.userName?.[0]}</Text></View>
              <View><Text style={styles.reviewName}>{r.userName}</Text><Stars value={r.rating} size={14} /></View>
            </View>
            {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 180, alignItems: 'center', justifyContent: 'center' },
  heroLogo: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(255,255,255,.3)', alignItems: 'center', justifyContent: 'center' },
  heroLogoText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  card: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: radius.xl, padding: spacing.lg },
  badge: { backgroundColor: `${colors.secondary}18`, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.secondary },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  legalName: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  cnpj: { fontSize: 12, color: colors.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  ratingVal: { fontSize: 15, fontWeight: '700', color: colors.text },
  ratingCount: { fontSize: 12, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  description: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginTop: spacing.md },
  contactGroup: { marginTop: spacing.md, gap: spacing.sm },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${colors.primary}10`, borderRadius: radius.md, padding: 12 },
  contactText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  infoText: { fontSize: 13, color: colors.textMuted },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  reviewForm: { backgroundColor: colors.surface2, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 12, alignItems: 'center', marginTop: spacing.sm },
  submitText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  reviewItem: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  reviewName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  reviewComment: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
})
