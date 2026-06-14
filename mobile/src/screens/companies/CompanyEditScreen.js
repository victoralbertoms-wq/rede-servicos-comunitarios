import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { getCompany, updateCompany, deleteCompany, uploadImage } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

const CATEGORIES = ['Comércio','Alimentação','Saúde','Educação','Tecnologia','Serviços','Beleza','Transporte','Outros']

export default function CompanyEditScreen({ route, navigation }) {
  const { id } = route.params
  const { user, isAdmin } = useAuth()
  const [company, setCompany] = useState(null)
  const [form, setForm] = useState({})
  const [logoUri, setLogoUri] = useState(null)
  const [photoUri, setPhotoUri] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getCompany(id).then(c => {
      if (!c) { Alert.alert('Erro', 'Empresa não encontrada.'); navigation.goBack(); return }
      const canEdit = isAdmin || c.userId === user?.uid
      if (!canEdit) { Alert.alert('Acesso negado', 'Você não pode editar esta empresa.'); navigation.goBack(); return }
      setCompany(c)
      setForm({
        name: c.name || '', legalName: c.legalName || '', cnpj: c.cnpj || '',
        category: c.category || CATEGORIES[0], description: c.description || '',
        phone: c.phone || '', whatsapp: c.whatsapp || '', email: c.email || '',
        address: c.address || '', website: c.website || '', instagram: c.instagram || '',
        communityId: c.communityId || '',
      })
      setFetching(false)
    })
  }, [id])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function pickImage(setter, clearRemove) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return Alert.alert('Permissão necessária')
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 })
    if (!result.canceled) { setter(result.assets[0].uri); clearRemove(false) }
  }

  async function handleSubmit() {
    if (!form.name) return Alert.alert('Atenção', 'Informe o nome da empresa.')
    setLoading(true)
    try {
      const updates = { ...form }
      if (logoUri) {
        updates.logoURL = await uploadImage('companies', logoUri)
      } else if (removeLogo) {
        updates.logoURL = ''
      }
      if (photoUri) {
        updates.photoURL = await uploadImage('companies', photoUri)
      } else if (removePhoto) {
        updates.photoURL = ''
      }
      await updateCompany(id, updates)
      Alert.alert('Sucesso', 'Empresa atualizada!', [{ text: 'OK', onPress: () => navigation.goBack() }])
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    Alert.alert('Excluir Empresa', 'Tem certeza? Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await deleteCompany(id)
          navigation.goBack()
          navigation.goBack()
        } catch { Alert.alert('Erro', 'Não foi possível excluir.') }
      }},
    ])
  }

  if (fetching) return <View style={styles.center}><ActivityIndicator size="large" color={colors.secondary} /></View>

  function PhotoField({ label, currentURL, newUri, setNewUri, removeFlag, setRemoveFlag }) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        {(currentURL && !removeFlag && !newUri) ? (
          <View>
            <Image source={{ uri: currentURL }} style={styles.currentPhoto} resizeMode="cover" />
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoActionBtn} onPress={() => pickImage(setNewUri, setRemoveFlag)}>
                <Ionicons name="camera" size={16} color={colors.secondary} />
                <Text style={[styles.photoActionText, { color: colors.secondary }]}>Trocar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.photoActionBtn, styles.photoActionDanger]} onPress={() => setRemoveFlag(true)}>
                <Ionicons name="trash" size={16} color={colors.error} />
                <Text style={[styles.photoActionText, { color: colors.error }]}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : removeFlag ? (
          <View style={styles.removeNotice}>
            <Text style={styles.removeNoticeText}>Será removida ao salvar.</Text>
            <TouchableOpacity onPress={() => setRemoveFlag(false)}>
              <Text style={styles.undoText}>Desfazer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoPicker} onPress={() => pickImage(setNewUri, setRemoveFlag)}>
            <Ionicons name="image" size={26} color={newUri ? colors.success : colors.textMuted} />
            <Text style={styles.photoText}>{newUri ? 'Selecionada ✓' : 'Adicionar'}</Text>
          </TouchableOpacity>
        )}
        {newUri && !removeFlag && (
          <View style={{ marginTop: spacing.sm }}>
            <Image source={{ uri: newUri }} style={styles.currentPhoto} resizeMode="cover" />
            <TouchableOpacity style={{ marginTop: 4 }} onPress={() => setNewUri(null)}>
              <Text style={styles.undoText}>Cancelar seleção</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <View style={styles.photoRow}>
          <View style={{ flex: 1 }}>
            <PhotoField label="Logo" currentURL={company?.logoURL} newUri={logoUri} setNewUri={setLogoUri} removeFlag={removeLogo} setRemoveFlag={setRemoveLogo} />
          </View>
          <View style={{ flex: 1 }}>
            <PhotoField label="Fachada" currentURL={company?.photoURL} newUri={photoUri} setNewUri={setPhotoUri} removeFlag={removePhoto} setRemoveFlag={setRemovePhoto} />
          </View>
        </View>

        {[
          { label: 'Nome da empresa *', field: 'name' },
          { label: 'Razão social', field: 'legalName' },
          { label: 'CNPJ', field: 'cnpj', keyboardType: 'numeric' },
          { label: 'Descrição', field: 'description', multiline: true },
          { label: 'Telefone', field: 'phone', keyboardType: 'phone-pad' },
          { label: 'WhatsApp', field: 'whatsapp', keyboardType: 'phone-pad' },
          { label: 'E-mail', field: 'email', keyboardType: 'email-address' },
          { label: 'Endereço completo', field: 'address' },
          { label: 'Site', field: 'website', keyboardType: 'url' },
          { label: 'Instagram', field: 'instagram' },
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
          <Text style={styles.label}>Categoria</Text>
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

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash" size={18} color={colors.error} />
          <Text style={styles.deleteBtnText}>Excluir Empresa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoRow: { flexDirection: 'row', gap: spacing.sm },
  currentPhoto: { width: '100%', height: 120, borderRadius: radius.lg },
  photoActions: { flexDirection: 'row', gap: 6, marginTop: 6 },
  photoActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8, borderRadius: radius.md, backgroundColor: `${colors.secondary}12`, borderWidth: 1, borderColor: `${colors.secondary}30` },
  photoActionDanger: { backgroundColor: `${colors.error}12`, borderColor: `${colors.error}30` },
  photoActionText: { fontSize: 12, fontWeight: '600' },
  photoPicker: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  photoText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  removeNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: `${colors.error}10`, borderRadius: radius.md, borderWidth: 1, borderColor: `${colors.error}30` },
  removeNoticeText: { fontSize: 12, color: colors.error },
  undoText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text, backgroundColor: colors.surface },
  multiline: { height: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: '#fff' },
  btn: { backgroundColor: colors.secondary, borderRadius: radius.md, padding: 16, alignItems: 'center', marginTop: spacing.sm },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md, padding: 14, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.error },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: colors.error },
})
