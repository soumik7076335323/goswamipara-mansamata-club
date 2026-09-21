import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { SectionHead } from '../../components/ui';
import { TextField } from './components/fields';
import { Modal } from '../../components/ui';
import { formatDate } from '../../utils/format';

function ChangePassword() {
  const { t } = useLanguage();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/api/auth/change-password', form);
      toast.success(t('admin.profile.passwordChanged'));
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit} style={{ maxWidth: 460 }}>
      <TextField label={t('admin.profile.currentPassword')} type="password" value={form.currentPassword} onChange={(v) => setForm((f) => ({ ...f, currentPassword: v }))} required />
      <TextField label={t('admin.profile.newPassword')} type="password" value={form.newPassword} onChange={(v) => setForm((f) => ({ ...f, newPassword: v }))} required hint="Min 8 characters, letters and numbers" />
      <button type="submit" className="btn btn-primary" disabled={busy}>{t('admin.profile.changePassword')}</button>
    </form>
  );
}

function UserManagement() {
  const { t } = useLanguage();
  const toast = useToast();
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' });

  const load = useCallback(async () => {
    const { data } = await api.get('/api/auth/users');
    setUsers(data.items);
  }, []);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const create = async () => {
    try {
      await api.post('/api/auth/users', form);
      toast.success(t('common.created'));
      setOpen(false);
      setForm({ name: '', email: '', password: '', role: 'editor' });
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  };

  const patchUser = async (u, update) => {
    try {
      await api.patch(`/api/auth/users/${u._id}`, update);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  };

  if (!users) return null;
  return (
    <div className="mt-4">
      <div className="admin-page-head">
        <div><h2 style={{ fontSize: '1.2rem' }}>{t('admin.profile.users')}</h2></div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>＋ {t('admin.profile.addUser')}</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>{t('contact.name')}</th><th>{t('common.email')}</th><th>{t('admin.profile.role')}</th><th>{t('common.status')}</th><th>{t('common.actions')}</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role === 'admin' ? t('admin.profile.roleAdmin') : t('admin.profile.roleEditor')}</td>
                <td><span className={`badge-dot ${u.active ? 'text-green' : 'text-danger'}`}>{u.active ? t('common.active') : t('common.inactive')}</span></td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="icon-btn" onClick={() => patchUser(u, { role: u.role === 'admin' ? 'editor' : 'admin' })}>
                      {u.role === 'admin' ? '→ ' + t('admin.profile.roleEditor') : '→ ' + t('admin.profile.roleAdmin')}
                    </button>
                    <button type="button" className="icon-btn" disabled={u._id === me._id} onClick={() => patchUser(u, { active: !u.active })}>
                      {u.active ? t('common.inactive') : t('common.active')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={t('admin.profile.addUser')}>
        <TextField label={t('contact.name')} value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
        <TextField label={t('common.email')} type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
        <TextField label={t('admin.login.password')} type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} required />
        <TextField
          label={t('admin.profile.role')}
          value={form.role}
          options={[{ value: 'editor', label: t('admin.profile.roleEditor') }, { value: 'admin', label: t('admin.profile.roleAdmin') }]}
          onChange={(v) => setForm((f) => ({ ...f, role: v }))}
        />
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={() => setOpen(false)}>{t('common.cancel')}</button>
          <button type="button" className="btn btn-primary" onClick={create}>{t('admin.form.create')}</button>
        </div>
      </Modal>
    </div>
  );
}

export default function Profile() {
  const { t, lang } = useLanguage();
  const { user, isAdmin } = useAuth();
  return (
    <div>
      <div className="admin-page-head">
        <div><h1>{t('admin.profile.title')}</h1></div>
      </div>
      <div className="admin-form" style={{ maxWidth: 460, marginBottom: 22 }}>
        <dl className="kv">
          <dt>{t('admin.profile.loggedInAs')}</dt>
          <dd>{user?.name} ({user?.email})</dd>
          <dt>{t('admin.profile.role')}</dt>
          <dd>{user?.role === 'admin' ? t('admin.profile.roleAdmin') : t('admin.profile.roleEditor')}</dd>
          <dt>{t('admin.profile.lastLogin')}</dt>
          <dd>{user?.lastLoginAt ? formatDate(user.lastLoginAt, lang) : '—'}</dd>
        </dl>
      </div>
      <SectionHead title={t('admin.profile.changePassword')} />
      <ChangePassword />
      {isAdmin && <UserManagement />}
    </div>
  );
}
