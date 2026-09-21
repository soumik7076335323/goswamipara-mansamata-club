import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { MotifMark } from '../../components/ui';

export default function AdminLogin() {
  const { t, L } = useLanguage();
  const { user, login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.friendlyMessage || t('admin.login.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="center" style={{ marginBottom: 6 }}>
          <span className="brand-logo" style={{ width: 58, height: 58, margin: '0 auto' }}>
            <MotifMark width={36} height={36} />
          </span>
        </div>
        <h1>{t('admin.login.title')}</h1>
        <p className="sub">{settings ? L(settings.clubName) : ''} — {t('admin.login.subtitle')}</p>
        {error && <div className="empty-state" style={{ padding: 12, marginBottom: 14, color: 'var(--red-danger)' }} role="alert">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="a-email">{t('common.email')}</label>
            <input id="a-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
          </div>
          <div className="field">
            <label htmlFor="a-pass">{t('admin.login.password')}</label>
            <input id="a-pass" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? t('admin.login.submitting') : t('admin.login.submit')}
          </button>
        </form>
        <p className="sub" style={{ marginTop: 18, marginBottom: 0, fontSize: '0.78rem' }}>
          গোস্বামীপাড়া মনসামাতা ক্লাব · Goswamipara Mansa Mata Club
        </p>
      </div>
    </div>
  );
}
