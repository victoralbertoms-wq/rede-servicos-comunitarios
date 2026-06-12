import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset() {
    if (!email) return Alert.alert('Atenção', 'Informe seu email.')
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o email. Verifique o endereço.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Senha</Text>
        {sent ? (
          <>
            <Text style={styles.icon}>📧</Text>
            <Text style={styles.sentText}>Email enviado! Verifique sua caixa de entrada.</Text>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.btnText}>Voltar ao login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Informe seu email para receber o link de recuperação.</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleReset} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Enviando...' : 'Enviar link'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
              <Text style={{ textAlign: 'center', color: colors.primary, fontWeight: '600' }}>Voltar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: spacing.lg, justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  icon: { fontSize: 48, textAlign: 'center', marginVertical: spacing.lg },
  sentText: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center', marginTop: spacing.sm },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
