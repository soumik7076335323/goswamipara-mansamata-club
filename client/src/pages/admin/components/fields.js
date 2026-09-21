import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

/** Bilingual text input with BN/EN tabs. */
export function LocalizedField({ label, value = {}, onChange, textarea = false, required, placeholder }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('bn');
  const val = typeof value === 'object' && value !== null ? value : { bn: '', en: '' };
  const set = (v) => onChange({ ...val, [tab]: v });
  const Comp = textarea ? 'textarea' : 'input';
  return (
    <div className="field">
      <label>
        {label} {required && <span style={{ color: 'var(--red-danger)' }}>*</span>}
      </label>
      <div className="localized-tabs" role="tablist">
        <button type="button" className={tab === 'bn' ? 'active' : ''} onClick={() => setTab('bn')}>{t('admin.form.bengali')}</button>
        <button type="button" className={tab === 'en' ? 'active' : ''} onClick={() => setTab('en')}>{t('admin.form.english')}</button>
      </div>
      <Comp
        className={textarea ? 'textarea' : 'input'}
        value={val[tab] || ''}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
      />
      {!textarea && !val.bn && !val.en && required && (
        <div className="hint">{t('common.required')}</div>
      )}
    </div>
  );
}

export function TextField({ label, value, onChange, type = 'text', hint, required, options }) {
  return (
    <div className="field">
      <label>{label}{required && <span style={{ color: 'var(--red-danger)' }}>*</span>}</label>
      {options ? (
        <select className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function CheckField({ label, checked, onChange }) {
  return (
    <div className="field">
      <label className="checkbox-row">
        <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    </div>
  );
}
