import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Linking, Image, StyleSheet, Alert, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getService, getReviews, addReview, toggleFavorite } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius, shadow } from '../../utils/theme'

function Stars({ value, onChange, size = 24 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange?.(i)} disabled={!onChange}>
          <Ionicons name={i <= value ? 'star' : 'star-outline'} size={size} color={i <= value ? colors.accent : colors.border} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default function ServiceDetailScreen({ route, navigation }) {
  const { id } = route.params
  const { user, userProfile, isAdmin } = useAuth()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isFav, setIsFav] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getService(id), getReviews(id)])
      .then(([s, r]) => { setService(s); setReviews(r) })
    setIsFav((userProfile?.favorites?.services || []).includes(id))
  }, [id])

  async function handleFav() {
    const added = await toggleFavorite(user.uid, id, 'service')
    setIsFav(added)
    Alert.alert('', added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.')
  }

  async function submitReview() {
    if (!newRating) return Alert.alert('Atenção', 'Selecione uma nota.')
    setSubmitting(true)
    try {
      await addReview({ targetId: id, targetType: 'service', userId: user.uid, userName: userProfile.displayName, rating: newRating, comment: newComment })
      setReviews(prev => [{ id: Date.now(), rating: newRating, comment: newComment, userName: userProfile.displayName }, ...prev])
      setNewRating(0); setNewComment('')
      Alert.alert('Sucesso', 'Avaliação enviada!')
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!service) return <View style={styles.center}><Text>Carregando...</Text></View>

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        {service.photoURL
          ? <Image source={{ uri: service.photoURL }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <Ionicons name="briefcase" size={56} color="rgba(255,255,255,.4)" />
        }
      </View>

      {/* Main info */}
      <View style={styles.mainCard}>
        <View style={[styles.badge, { alignSelf: 'flex-start', marginBottom: spacing.xs }]}>
          <Text style={styles.badgeText}>{service.category}</Text>
        </View>
        <Text style={styles.name}>{service.name}</Text>
        {service.specialty && <Text style={styles.specialty}>{service.specialty}</Text>}

        <View style={styles.ratingRow}>
          <Stars value={Math.round(service.rating || 0)} size={20} />
          <Text style={styles.ratingVal}>{(service.rating || 0).toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({service.reviewCount || 0} avaliações)</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleFav}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? colors.error : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Chat', { receiverId: service.userId })}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          {(isAdmin || service.userId === user?.uid) && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: `${colors.primary}15` }]} onPress={() => navigation.navigate('ServiceEdit', { id })}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {service.description && <Text style={styles.description}>{service.description}</Text>}

        {/* Contact buttons */}
        <View style={styles.contactGroup}>
          {service.phone && (
            <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${service.phone}`)}>
              <Ionicons name="call" size={18} color={colors.primary} />
              <Text style={styles.contactText}>{service.phone}</Text>
            </TouchableOpacity>
          )}
          {service.whatsapp && (
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25d36620' }]}
              onPress={() => Linking.openURL(`https://wa.me/55${service.whatsapp.replace(/\D/g,'')}`)} >
              <Ionicons name="logo-whatsapp" size={18} color="#25d366" />
              <Text style={[styles.contactText, { color: '#25d366' }]}>WhatsApp</Text>
            </TouchableOpacity>
          )}
          {service.email && (
            <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`mailto:${service.email}`)}>
              <Ionicons name="mail" size={18} color={colors.secondary} />
              <Text style={[styles.contactText, { color: colors.secondary }]}>{service.email}</Text>
            </TouchableOpacity>
          )}
          {service.website && (
            <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(service.website)}>
              <Ionicons name="globe" size={18} color={colors.textMuted} />
              <Text style={styles.contactText}>Visitar site</Text>
            </TouchableOpacity>
          )}
        </View>

        {(service.city || service.workingHours) && (
          <View style={styles.infoRow}>
            {service.city && <View style={styles.infoItem}><Ionicons name="location" size={14} color={colors.textMuted} /><Text style={styles.infoText}>{service.city}, {service.state}</Text></View>}
            {service.workingHours && <View style={styles.infoItem}><Ionicons name="time" size={14} color={colors.textMuted} /><Text style={styles.infoText}>{service.workingHours}</Text></View>}
          </View>
        )}
      </View>

      {/* Reviews */}
      <View style={[styles.mainCard, { marginTop: spacing.sm }]}>
        <Text style={styles.sectionTitle}>Avaliações</Text>

        {/* New review */}
        <View style={styles.reviewForm}>
          <Stars value={newRating} onChange={setNewRating} />
          <View style={styles.field}>
            <Text style={styles.label}>Comentário (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Conte sua experiência..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              value={newComment}
              onChangeText={setNewComment}
            />
          </View>
          <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={submitReview} disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'Enviando...' : 'Enviar Avaliação'}</Text>
          </TouchableOpacity>
        </View>

        {reviews.map(r => (
          <View key={r.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{r.userName?.[0]}</Text></View>
              <View>
                <Text style={styles.reviewName}>{r.userName}</Text>
                <Stars value={r.rating} size={14} />
              </View>
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
  mainCard: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: radius.xl, padding: spacing.lg },
  badge: { backgroundColor: `${colors.primary}18`, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 4 },
  specialty: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  ratingVal: { fontSize: 15, fontWeight: '700', color: colors.text },
  ratingCount: { fontSize: 13, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  description: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginTop: spacing.md },
  contactGroup: { marginTop: spacing.md, gap: spacing.sm },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${colors.primary}10`, borderRadius: radius.md, padding: 12 },
  contactText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  infoRow: { marginTop: spacing.md, gap: spacing.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: colors.textMuted },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  reviewForm: { backgroundColor: colors.surface2, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  field: { marginTop: spacing.sm },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
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
