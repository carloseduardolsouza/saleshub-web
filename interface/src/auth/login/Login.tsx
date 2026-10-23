import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { api } from '../../api/client';
import './Login.css';

interface LoginProps {
  onLogin?: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'E-mail obrigatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'E-mail invalido';
    if (!password) next.password = 'Senha obrigatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await api.auth.login(email.trim(), password);
      onLogin?.();
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setErrors({ global: message });
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__orb login-page__orb--1" aria-hidden="true" />
      <div className="login-page__orb login-page__orb--2" aria-hidden="true" />

      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">
            <ShoppingBag size={28} strokeWidth={2} />
          </div>
          <h1 className="login-card__title">SalesHub</h1>
          <p className="login-card__subtitle">Acesse seu painel de pedidos</p>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit} noValidate>
          {errors.global && (
            <div className="login-error" role="alert">
              <AlertCircle size={16} />
              <span>{errors.global}</span>
            </div>
          )}

          <CustomInput
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />

          <div className="login-card__password">
            <CustomInput
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-card__eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <CustomButton type="submit" variant="accent" className="login-card__submit" loading={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </CustomButton>
        </form>
      </div>
    </div>
  );
}
