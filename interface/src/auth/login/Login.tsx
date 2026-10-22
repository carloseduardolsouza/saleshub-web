import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'E-mail obrigatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'E-mail invalido';
    if (!password) next.password = 'Senha obrigatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await api.auth.login(email, password);
      onLogin?.();
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setErrors({ global: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">
            <LogIn size={28} strokeWidth={2} />
          </div>
          <h1 className="login-card__title">SalesHub</h1>
          <p className="login-card__subtitle">Acesse seu painel de pedidos</p>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit}>
          {errors.global && <div className="login-error">{errors.global}</div>}

          <CustomInput
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <CustomInput
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          <div className="login-card__actions">
            <a href="/esqueci-senha" className="login-card__forgot">
              Esqueci minha senha
            </a>
          </div>

          <CustomButton type="submit" variant="primary" className="login-card__submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </CustomButton>
        </form>
      </div>
    </div>
  );
}
