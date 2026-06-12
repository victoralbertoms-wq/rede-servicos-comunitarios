import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from '../../firebase/config'
import { uploadToCloudinary } from '../../utils/cloudinary'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius, shadow } from '../../utils/theme'

export default function ProfileScreen({ navigation }) {
  const { user, userProfile, logout, fetchUserProfile, isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(userProfile?.displayName || '')
  const [phone, setPhone] = useState(userProfile?.phone || '')
  const [photoUri, setPhotoUri] = useState(null)
  const [loading, setLoading] = useState(false)

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function handleSave() {
    if (!name.trim()) return Alert.alert('Atenção', 'Informe seu nome.')
    setLoading(true)
    try {
      let photoURL = userProfile?.photoURL || ''
      if (photoUri) photoURL = await uploadToCloudinary(photoUri, 'users')
      await updateProfile(auth.currentUser, { displayName: name, photoURL })
      await updateDoc(doc(db, 'users', user.uid), { displayName: name, phone, photoURL, updatedAt: new Date() })
      await fetchUserProfile(user.uid)
      setEditing(false)
      Alert.alert('Sucesso', 'Perfil atualizado!')
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ])
  }

  const roleLabel = { admin: 'Administrador', community_admin: 'Admin Comunidade', user: 'Membro' }
  const roleColor = { admin: colors.error, community_admin: colors.warning, user: colors.primary }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={editing ? pickPhoto : undefined} style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userProfile?.displayName?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          {editing && (
            <View style={styles.avatarEdit}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        {!editing && (
          <>
            <Text style={styles.name}>{userProfile?.displayName}</Text>
            <Text style={styles.email}>{userProfile?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: `${roleColor[userProfile?.role] || colors.primary}30` }]}>
              <Text style={[styles.roleText, { color: roleColor[userProfile?.role] || colors.primary }]}>
                {roleLabel[userProfile?.role] || 'Membro'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.content}>
        {!editing ? (
          <>
            {/* Info card */}
            <View style={[styles.card, shadow.sm]}>
              {[
                { icon: 'person', label: 'Nome', value: userProfile?.displayName },
                { icon: 'mail', label: 'Email', value: userProfile?.email },
                { icon: 'call', label: 'Telefone', value: userProfile?.phone || 'Não informado' },
              ].map(({ icon, label, value }) => (
                <View key={label} style={styles.infoRow}>
                  <View style={styles.infoIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View>
                  <View>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, shadow.sm]}>
                <Text style={styles.statValue}>{userProfile?.communities?.length || 0}</Text>
                <Text style={styles.statLabel}>Comunidades</Text>
              </View>
              <View style={[styles.statCard, shadow.sm]}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {(userProfile?.favorites?.services?.length || 0) + (userProfile?.favorites?.companies?.length || 0)}
                </Text>
                <Text style={styles.statLabel}>Favoritos</Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity style={[styles.card, styles.actionRow, shadow.sm]} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
              <Text style={styles.actionText}>Editar perfil</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, styles.actionRow, shadow.sm]} onPress={() => navigation.navigate('Messages')}>
              <Ionicons name="chatbubbles-outline" size={22} color={colors.secondary} />
              <Text style={styles.actionText}>Mensagens</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity style={[styles.card, styles.actionRow, shadow.sm]} onPress={() => navigation.navigate('AdminDashboard')}>
                <Ionicons name="shield-checkmark" size={22} color={colors.warning} />
                <Text style={styles.actionText}>Painel Admin</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.card, styles.actionRow, styles.logoutRow, shadow.sm]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Sair da conta</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.card, shadow.sm]}>
            <Text style={styles.editTitle}>Editar Perfil</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={colors.textLight} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" placeholderTextColor={colors.textLight} />
            </View>
            {photoUri && <Text style={styles.photoSelected}>📷 Foto selecionada</Text>}
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
                <Text style={styles.saveText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: colors.primary, padding: spacing.xl, alignItems: 'center', paddingBottom: spacing.xxl },
  avatarWrap: { position: 'relative', marginBottom: spacing.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  avatarEdit: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff' },
  email: { fontSize: 14, color: 'rgba(255,255,255,.8)', marginTop: 4 },
  roleBadge: { marginTop: spacing.sm, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 4 },
  roleText: { fontSize: 12, fontWeight: '700' },
  content: { padding: spacing.md, marginTop: -spacing.lg, gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surface2 },
  infoIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: `${colors.primary}12`, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: colors.text, fontWeight: '500', marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionText: { fontSize: 15, fontWeight: '600', color: colors.text },
  logoutRow: { borderWidth: 1.5, borderColor: `${colors.error}30` },
  editTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text },
  photoSelected: { fontSize: 13, color: colors.success, marginBottom: spacing.sm },
  editActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { flex: 1, backgroundColor: colors.surface2, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.text },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
