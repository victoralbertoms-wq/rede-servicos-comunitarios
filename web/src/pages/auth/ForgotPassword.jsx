import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit({ email }) {
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Email enviado! Verifique sua caixa de entrada.')
    } catch {
      toast.error('Não foi possível enviar o email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <h1>Recuperar Senha</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.25rem' }}>
            {sent ? 'Verifique seu email' : 'Informe seu email cadastrado'}
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>📧</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
              Enviamos um link de recuperação para o seu email.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
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
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Enviar link'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.88rem' }}>
              <Link to="/login" style={{ color: 'var(--primary)' }}>Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
