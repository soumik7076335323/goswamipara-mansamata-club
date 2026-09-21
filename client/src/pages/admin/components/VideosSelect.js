import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useLanguage } from '../../../contexts/LanguageContext';

/** Checkbox list of published videos for linking to mandir/memories. */
export default function VideosSelect({ label, value = [], onChange }) {
  const { t, L } = useLanguage();
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    api.get('/api/videos/admin/list', { params: { limit: 100 } })
      .then(({ data }) => setVideos(data.items))
      .catch(() => setVideos([]));
  }, []);

  const toggle = (id) => {
    const arr = value.includes(id) ? value.filter((v) => v !== id) : [...value, id];
    onChange(arr);
  };

  return (
    <div className="field">
      <label>{label}</label>
      {!videos ? (
        <div className="hint">{t('common.loading')}</div>
      ) : videos.length === 0 ? (
        <div className="hint">{t('videos.empty')}</div>
      ) : (
        <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 10, padding: 8 }}>
          {videos.map((v) => (
            <label className="checkbox-row" key={v._id} style={{ padding: '4px 6px' }}>
              <input type="checkbox" checked={value.includes(v._id)} onChange={() => toggle(v._id)} />
              <span>{L(v.title)} <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>({v.provider})</span></span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
