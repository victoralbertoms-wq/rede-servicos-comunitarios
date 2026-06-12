import { useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { createCompany } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

const CATEGORIES = ['Comércio','Alimentação','Saúde','Educação','Tecnologia','Serviços','Beleza','Transporte','Outros']

export default function CompanyCreateScreen({ route, navigation }) {
  const { user } = useAuth()
  const communityId = route?.params?.communityId || ''
  const [form, setForm] = useState({ name: '', legalName: '', cnpj: '', category: CATEGORIES[0], description: '', phone: '', whatsapp: '', email: '', address: '', website: '', instagram: '', communityId })
  const [logoUri, setLogoUri] = useState(null)
  const [photoUri, setPhotoUri] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function pickImage(setter) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return Alert.alert('Permissão necessária')
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 })
    if (!result.canceled) setter(result.assets[0].uri)
  }

  async function handleSubmit() {
    if (!form.name) return Alert.alert('Atenção', 'Informe o nome da empresa.')
    setLoading(true)
    try {
      await createCompany(form, logoUri, photoUri, user.uid)
      Alert.alert('Sucesso', 'Empresa cadastrada! Aguarde aprovação.', [{ text: 'OK', onPress: () => navigation.goBack() }])
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoPicker} onPress={() => pickImage(setLogoUri)}>
            <Ionicons name="image" size={24} color={logoUri ? colors.success : colors.textMuted} />
            <Text style={styles.photoText}>{logoUri ? 'Logo ✓' : 'Logo'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoPicker} onPress={() => pickImage(setPhotoUri)}>
            <Ionicons name="camera" size={24} color={photoUri ? colors.success : colors.textMuted} />
            <Text style={styles.photoText}>{photoUri ? 'Fachada ✓' : 'Fachada'}</Text>
          </TouchableOpacity>
        </View>

        {[
          { label: 'Nome da empresa *', field: 'name' },
          { label: 'Razão social', field: 'legalName' },
          { label: 'CNPJ', field: 'cnpj', placeholder: '00.000.000/0000-00', keyboardType: 'numeric' },
          { label: 'Descrição', field: 'description', multiline: true },
          { label: 'Telefone', field: 'phone', keyboardType: 'phone-pad', placeholder: '(00) 00000-0000' },
          { label: 'WhatsApp', field: 'whatsapp', keyboardType: 'phone-pad' },
          { label: 'E-mail', field: 'email', keyboardType: 'email-address' },
          { label: 'Endereço completo', field: 'address' },
          { label: 'Site', field: 'website', placeholder: 'https://', keyboardType: 'url' },
          { label: 'Instagram', field: 'instagram', placeholder: '@empresa' },
        ].map(({ label, field, placeholder, keyboardType, multiline }) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
              placeholder={placeholder || label}
              placeholderTextColor={colors.textLight}
              keyboardType={keyboardType || 'default'}
              multiline={multiline}
              value={form[field]}
              onChangeText={v => set(field, v)}
            />
          </View>
        ))}

        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[styles.chip, form.category === c && styles.chipActive]} onPress={() => set('category', c)}>
                  <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Cadastrando...' : 'Cadastrar Empresa'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  photoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  photoPicker: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', gap: spacing.xs, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  photoText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text, backgroundColor: colors.surface },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: '#fff' },
  btn: { backgroundColor: colors.secondary, borderRadius: radius.md, padding: 16, alignItems: 'center', marginTop: spacing.sm },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})
