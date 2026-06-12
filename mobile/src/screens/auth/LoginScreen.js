import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { colors, spacing, radius } from '../../utils/theme'

export default function LoginScreen({ navigation }) {
  const { loginWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha email e senha.')
    setLoading(true)
    try {
      await loginWithEmail(email.trim(), password)
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' ? 'Email ou senha inválidos.' : 'Erro ao fazer login.'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>R</Text>
          </View>
          <Text style={styles.appName}>Rede de Serviços</Text>
          <Text style={styles.appSubtitle}>Comunitários</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Entrar na sua conta</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotLink}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>
            Não tem conta? <Text style={styles.registerLinkBold}>Cadastre-se grátis</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,.2)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  logoLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  appName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  appSubtitle: { fontSize: 16, color: 'rgba(255,255,255,.8)', marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  field: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.text, backgroundColor: colors.surface },
  forgotLink: { fontSize: 13, color: colors.primary, fontWeight: '600', textAlign: 'right', marginBottom: spacing.md, marginTop: -spacing.sm },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerLink: { textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,.8)' },
  registerLinkBold: { fontWeight: '700', color: '#fff' },
})
