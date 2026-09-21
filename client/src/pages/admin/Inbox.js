import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Modal, ConfirmDialog, Spinner, Pagination, EmptyState } from '../../components/ui';
import { formatDate } from '../../utils/format';

export default function Inbox() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('inbox'); // inbox | unread | archived
  const [open, setOpen] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const params = { page, limit: 15 };
      if (view === 'archived') params.archived = 'true';
      if (view === 'unread') params.read = 'false';
      const { data: d } = await api.get('/api/contact/messages', { params });
      setData(d);
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  }, [page, view, toast]);

  useEffect(() => { load(); }, [load]);

  const patch = async (msg, update) => {
    try {
      await api.patch(`/api/contact/messages/${msg._id}`, update);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  };

  const openMsg = async (msg) => {
    setOpen(msg);
    if (!msg.read) await patch(msg, { read: true });
  };

  const remove = async () => {
    try {
      await api.delete(`/api/contact/messages/${toDelete._id}`);
      toast.success(t('common.deleted'));
      setToDelete(null);
      setOpen(null);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  };

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>{t('admin.inbox.title')}</h1>
          {data && <p>{t('admin.stats.unread')}: {data.unread}</p>}
        </div>
      </div>
      <div className="filter-bar">
        <div className="localized-tabs">
          <button type="button" className={view === 'inbox' ? 'active' : ''} onClick={() => { setView('inbox'); setPage(1); }}>{t('admin.inbox.all')}</button>
          <button type="button" className={view === 'unread' ? 'active' : ''} onClick={() => { setView('unread'); setPage(1); }}>{t('admin.inbox.unread')}</button>
          <button type="button" className={view === 'archived' ? 'active' : ''} onClick={() => { setView('archived'); setPage(1); }}>{t('admin.inbox.archived')}</button>
        </div>
      </div>
      {!data ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <EmptyState icon="✉" title={t('admin.inbox.empty')} />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>{t('contact.name')}</th><th>{t('contact.subject')}</th><th>{t('common.date')}</th><th>{t('common.status')}</th><th>{t('common.actions')}</th></tr>
            </thead>
            <tbody>
              {data.items.map((m) => (
                <tr key={m._id} style={{ fontWeight: m.read ? 400 : 600 }}>
                  <td>{m.name}<div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{m.email}</div></td>
                  <td>{m.subject}</td>
                  <td>{formatDate(m.createdAt, lang)}</td>
                  <td>
                    <span className={`badge-dot ${m.read ? 'text-muted2' : 'text-green'}`}>
                      {m.read ? t('admin.inbox.markRead') : t('admin.inbox.unread')}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => openMsg(m)}>{t('common.view')}</button>
                      <button type="button" className="icon-btn" onClick={() => patch(m, { read: !m.read })}>
                        {m.read ? t('admin.inbox.markUnread') : t('admin.inbox.markRead')}
                      </button>
                      <button type="button" className="icon-btn" onClick={() => patch(m, { archived: !m.archived })}>
                        {m.archived ? t('admin.inbox.unarchive') : t('admin.inbox.archive')}
                      </button>
                      {isAdmin && <button type="button" className="icon-btn danger" onClick={() => setToDelete(m)}>{t('common.delete')}</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />}

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open ? open.subject : ''}>
        {open && (
          <div>
            <div className="kv">
              <dt>{t('contact.name')}</dt><dd>{open.name}</dd>
              <dt>{t('common.email')}</dt><dd><a href={`mailto:${open.email}`}>{open.email}</a></dd>
              {open.phone && (<><dt>{t('common.phone')}</dt><dd><a href={`tel:${open.phone}`}>{open.phone}</a></dd></>)}
              <dt>{t('common.date')}</dt><dd>{formatDate(open.createdAt, lang)}</dd>
            </div>
            <div className="prose mt-2" style={{ background: 'var(--cream)', padding: 16, borderRadius: 10 }}>{open.message}</div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={remove} title={t('common.delete')} text={t('common.deleteConfirm')} />
    </div>
  );
}
