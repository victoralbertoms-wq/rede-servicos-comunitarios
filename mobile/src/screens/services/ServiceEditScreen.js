import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { getService, updateService, deleteService, uploadImage } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

const CATEGORIES = ['Construção Civil','Elétrica','Hidráulica','Advocacia','Contabilidade','Saúde','Psicologia','Educação','Mecânica','Tecnologia','Beleza & Estética','Gastronomia','Transporte','Outros']
const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export default function ServiceEditScreen({ route, navigation }) {
  const { id } = route.params
  const { user, isAdmin } = useAuth()
  const [service, setService] = useState(null)
  const [form, setForm] = useState({})
  const [photoUri, setPhotoUri] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getService(id).then(s => {
      if (!s) { Alert.alert('Erro', 'Serviço não encontrado.'); navigation.goBack(); return }
      const canEdit = isAdmin || s.userId === user?.uid
      if (!canEdit) { Alert.alert('Acesso negado', 'Você não pode editar este serviço.'); navigation.goBack(); return }
      setService(s)
      setForm({
        name: s.name || '', category: s.category || CATEGORIES[0], specialty: s.specialty || '',
        description: s.description || '', phone: s.phone || '', whatsapp: s.whatsapp || '',
        email: s.email || '', city: s.city || '', state: s.state || 'SP', address: s.address || '',
        website: s.website || '', workingHours: s.workingHours || '', instagram: s.instagram || '',
        communityId: s.communityId || '',
      })
      setFetching(false)
    })
  }, [id])

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return Alert.alert('Permissão necessária', 'Permita acesso à galeria.')
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 })
    if (!result.canceled) { setPhotoUri(result.assets[0].uri); setRemovePhoto(false) }
  }

  async function handleSubmit() {
    if (!form.name || !form.city) return Alert.alert('Atenção', 'Preencha os campos obrigatórios.')
    setLoading(true)
    try {
      const updates = { ...form }
      if (photoUri) {
        updates.photoURL = await uploadImage('services', photoUri)
      } else if (removePhoto) {
        updates.photoURL = ''
      }
      await updateService(id, updates)
      Alert.alert('Sucesso', 'Serviço atualizado!', [{ text: 'OK', onPress: () => navigation.goBack() }])
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    Alert.alert('Excluir Serviço', 'Tem certeza? Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await deleteService(id)
          navigation.goBack()
          navigation.goBack()
        } catch { Alert.alert('Erro', 'Não foi possível excluir.') }
      }},
    ])
  }

  if (fetching) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>

  const currentPhoto = service?.photoURL

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Foto */}
        <View style={styles.field}>
          <Text style={styles.label}>Foto</Text>
          {(currentPhoto && !removePhoto && !photoUri) ? (
            <View>
              <Image source={{ uri: currentPhoto }} style={styles.currentPhoto} resizeMode="cover" />
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoActionBtn} onPress={pickImage}>
                  <Ionicons name="camera" size={16} color={colors.primary} />
                  <Text style={[styles.photoActionText, { color: colors.primary }]}>Trocar foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoActionBtn, styles.photoActionDanger]} onPress={() => setRemovePhoto(true)}>
                  <Ionicons name="trash" size={16} color={colors.error} />
                  <Text style={[styles.photoActionText, { color: colors.error }]}>Remover foto</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : removePhoto ? (
            <View style={styles.removeNotice}>
              <Text style={styles.removeNoticeText}>Foto será removida ao salvar.</Text>
              <TouchableOpacity onPress={() => setRemovePhoto(false)}>
                <Text style={styles.undoText}>Desfazer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
              <Ionicons name="camera" size={28} color={photoUri ? colors.success : colors.textMuted} />
              <Text style={styles.photoText}>{photoUri ? 'Nova foto selecionada ✓' : 'Adicionar foto'}</Text>
            </TouchableOpacity>
          )}
          {photoUri && !removePhoto && (
            <View style={{ marginTop: spacing.sm }}>
              <Image source={{ uri: photoUri }} style={styles.currentPhoto} resizeMode="cover" />
              <TouchableOpacity style={{ marginTop: 4 }} onPress={() => setPhotoUri(null)}>
                <Text style={styles.undoText}>Cancelar seleção</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nome do profissional *</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={v => set('name', v)} placeholderTextColor={colors.textLight} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoria *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[styles.chip, form.category === c && styles.chipActive]} onPress={() => set('category', c)}>
                  <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {[
          { label: 'Especialidade', field: 'specialty' },
          { label: 'Descrição', field: 'description', multiline: true },
          { label: 'Telefone', field: 'phone', keyboardType: 'phone-pad' },
          { label: 'WhatsApp', field: 'whatsapp', keyboardType: 'phone-pad' },
          { label: 'E-mail', field: 'email', keyboardType: 'email-address' },
          { label: 'Cidade *', field: 'city' },
        ].map(({ label, field, keyboardType, multiline }) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, multiline && styles.multiline]}
              value={form[field]}
              onChangeText={v => set(field, v)}
              keyboardType={keyboardType || 'default'}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              placeholderTextColor={colors.textLight}
            />
          </View>
        ))}

        <View style={styles.field}>
          <Text style={styles.label}>Estado</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {STATES.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, form.state === s && styles.chipActive]} onPress={() => set('state', s)}>
                  <Text style={[styles.chipText, form.state === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {[
          { label: 'Endereço', field: 'address' },
          { label: 'Horário de atendimento', field: 'workingHours' },
          { label: 'Site', field: 'website', keyboardType: 'url' },
          { label: 'Instagram', field: 'instagram' },
        ].map(({ label, field, keyboardType }) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={styles.input} value={form[field]} onChangeText={v => set(field, v)} keyboardType={keyboardType || 'default'} placeholderTextColor={colors.textLight} />
          </View>
        ))}

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash" size={18} color={colors.error} />
          <Text style={styles.deleteBtnText}>Excluir Serviço</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  currentPhoto: { width: '100%', height: 180, borderRadius: radius.lg },
  photoActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  photoActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: radius.md, backgroundColor: `${colors.primary}12`, borderWidth: 1, borderColor: `${colors.primary}30` },
  photoActionDanger: { backgroundColor: `${colors.error}12`, borderColor: `${colors.error}30` },
  photoActionText: { fontSize: 13, fontWeight: '600' },
  photoPicker: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  photoText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  removeNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: `${colors.error}10`, borderRadius: radius.md, borderWidth: 1, borderColor: `${colors.error}30` },
  removeNoticeText: { fontSize: 13, color: colors.error },
  undoText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text, backgroundColor: colors.surface },
  multiline: { height: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: '#fff' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center', marginTop: spacing.sm },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md, padding: 14, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.error },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: colors.error },
})
