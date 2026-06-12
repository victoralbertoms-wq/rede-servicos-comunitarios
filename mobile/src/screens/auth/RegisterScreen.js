import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

export default function RegisterScreen({ navigation }) {
  const { registerWithEmail } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password) return Alert.alert('Atenção', 'Preencha todos os campos.')
    if (password !== confirm) return Alert.alert('Atenção', 'As senhas não coincidem.')
    if (password.length < 6) return Alert.alert('Atenção', 'Senha com mínimo 6 caracteres.')
    setLoading(true)
    try {
      await registerWithEmail(email.trim(), password, name.trim())
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Este email já está em uso.' : 'Erro ao criar conta.'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}><Text style={styles.logoLetter}>R</Text></View>
          <Text style={styles.appName}>Criar Conta</Text>
          <Text style={styles.appSubtitle}>Junte-se à comunidade</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: 'Nome completo', value: name, setter: setName, placeholder: 'Seu nome', type: 'default' },
            { label: 'Email', value: email, setter: setEmail, placeholder: 'seu@email.com', type: 'email-address' },
            { label: 'Senha', value: password, setter: setPassword, placeholder: 'Mínimo 6 caracteres', secure: true },
            { label: 'Confirmar senha', value: confirm, setter: setConfirm, placeholder: 'Repita a senha', secure: true },
          ].map(({ label, value, setter, placeholder, type, secure }) => (
            <View key={label} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.textLight}
                keyboardType={type || 'default'}
                autoCapitalize={type === 'email-address' ? 'none' : 'sentences'}
                autoCorrect={false}
                secureTextEntry={secure}
                value={value}
                onChangeText={setter}
              />
            </View>
          ))}

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Criando conta...' : 'Criar conta'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Já tem conta? <Text style={styles.linkBold}>Entrar</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  scroll: { flexGrow: 1, padding: spacing.lg },
  logoWrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  logoBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.2)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  logoLetter: { fontSize: 32, fontWeight: '800', color: '#fff' },
  appName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  appSubtitle: { fontSize: 14, color: 'rgba(255,255,255,.8)' },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center', marginTop: spacing.sm },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,.8)' },
  linkBold: { fontWeight: '700', color: '#fff' },
})
