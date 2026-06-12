import { useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { createService } from '../../services/firestoreService'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

const CATEGORIES = ['Construção Civil','Elétrica','Hidráulica','Advocacia','Contabilidade','Saúde','Psicologia','Educação','Mecânica','Tecnologia','Beleza & Estética','Gastronomia','Transporte','Outros']
const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export default function ServiceCreateScreen({ route, navigation }) {
  const { user } = useAuth()
  const communityId = route?.params?.communityId || ''
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], specialty: '', description: '', phone: '', whatsapp: '', email: '', city: '', state: 'SP', address: '', website: '', workingHours: '', instagram: '', communityId })
  const [photoUri, setPhotoUri] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return Alert.alert('Permissão necessária', 'Permita acesso à galeria.')
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function handleSubmit() {
    if (!form.name || !form.city) return Alert.alert('Atenção', 'Preencha os campos obrigatórios.')
    setLoading(true)
    try {
      await createService(form, photoUri, user.uid)
      Alert.alert('Sucesso', 'Serviço cadastrado! Aguarde aprovação.', [{ text: 'OK', onPress: () => navigation.goBack() }])
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar o serviço.')
    } finally {
      setLoading(false)
    }
  }

  function Field({ label, field, placeholder, keyboardType, multiline }) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          placeholder={placeholder || label}
          placeholderTextColor={colors.textLight}
          keyboardType={keyboardType || 'default'}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          value={form[field]}
          onChangeText={v => set(field, v)}
        />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Photo picker */}
        <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
          <Ionicons name="camera" size={28} color={photoUri ? colors.success : colors.textMuted} />
          <Text style={styles.photoText}>{photoUri ? 'Foto selecionada ✓' : 'Adicionar foto'}</Text>
        </TouchableOpacity>

        <Field label="Nome do profissional *" field="name" />

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

        <Field label="Especialidade" field="specialty" />
        <Field label="Descrição" field="description" multiline placeholder="Descreva seus serviços..." />
        <Field label="Telefone" field="phone" keyboardType="phone-pad" placeholder="(00) 00000-0000" />
        <Field label="WhatsApp" field="whatsapp" keyboardType="phone-pad" placeholder="(00) 00000-0000" />
        <Field label="E-mail" field="email" keyboardType="email-address" />
        <Field label="Cidade *" field="city" />

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

        <Field label="Endereço" field="address" placeholder="Rua, número, bairro" />
        <Field label="Horário de atendimento" field="workingHours" placeholder="Seg-Sex 8h-18h" />
        <Field label="Site" field="website" placeholder="https://..." keyboardType="url" />
        <Field label="Instagram" field="instagram" placeholder="@seu_instagram" />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Cadastrando...' : 'Cadastrar Serviço'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  photoPicker: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  photoText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
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
})
