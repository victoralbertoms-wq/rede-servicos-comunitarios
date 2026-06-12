import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { FcGoogle } from 'react-icons/fc'

export default function Register() {
  const { registerWithEmail, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  async function onSubmit({ name, email, password }) {
    setLoading(true)
    try {
      await registerWithEmail(email, password, name)
      toast.success('Conta criada com sucesso!')
      navigate('/')
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Este email já está em uso.'
        : 'Erro ao criar conta.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Conta criada!')
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
          <h1>Criar Conta</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.25rem' }}>
            Junte-se à comunidade
          </p>
        </div>

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <FcGoogle size={22} />
          Cadastrar com Google
        </button>

        <div className="auth-divider">ou preencha os dados</div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Seu nome"
              {...register('name', { required: 'Informe seu nome', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="seu@email.com"
              {...register('email', { required: 'Informe o email' })}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="Mínimo 6 caracteres"
              {...register('password', { required: 'Informe a senha', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar senha</label>
            <input
              className={`form-input ${errors.confirm ? 'error' : ''}`}
              type="password"
              placeholder="Repita a senha"
              {...register('confirm', {
                required: 'Confirme a senha',
                validate: v => v === watch('password') || 'As senhas não coincidem',
              })}
            />
            {errors.confirm && <span className="form-error">{errors.confirm.message}</span>}
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Criar conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.88rem', color: 'var(--text-muted)' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
