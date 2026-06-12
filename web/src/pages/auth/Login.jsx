import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { HiMail, HiLockClosed } from 'react-icons/hi'
import { FcGoogle } from 'react-icons/fc'

export default function Login() {
  const { loginWithEmail, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit({ email, password }) {
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      toast.success('Bem-vindo de volta!')
      navigate('/')
    } catch (err) {
      toast.error(err.code === 'auth/invalid-credential' ? 'Email ou senha inválidos.' : 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Bem-vindo!')
      navigate('/')
    } catch {
      toast.error('Erro ao entrar com Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto',
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 28,
          }}>R</div>
          <h1>Rede de Serviços</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.25rem' }}>
            Entre na sua conta
          </p>
        </div>

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <FcGoogle size={22} />
          Continuar com Google
        </button>

        <div className="auth-divider">ou entre com email</div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <HiMail style={{ position: 'absolute', left: '.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className={`form-input ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                type="email"
                placeholder="seu@email.com"
                {...register('email', { required: 'Informe o email' })}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <HiLockClosed style={{ position: 'absolute', left: '.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Informe a senha' })}
              />
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.25rem', marginTop: '-.5rem' }}>
            <Link to="/esqueci-senha" style={{ fontSize: '.82rem', color: 'var(--primary)', fontWeight: 500 }}>
              Esqueci minha senha
            </Link>
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.88rem', color: 'var(--text-muted)' }}>
          Não tem conta?{' '}
          <Link to="/cadastro" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  )
}
