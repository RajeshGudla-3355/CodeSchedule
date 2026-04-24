import { useState } from 'react';
import type { AvailableLanguage } from '../services/api';
import TechIcon, { type TechKey } from './TechIcon';

const KNOWN_TECH: TechKey[] = ['javascript', 'python', 'typescript', 'react', 'css'];
const isKnownTech = (k: string): k is TechKey => (KNOWN_TECH as string[]).includes(k);

interface Props {
  languages: AvailableLanguage[];
  currentSubscriptions: string[];
  onClose: () => void;
  onAdd: (language: string) => Promise<void>;
}

export default function AddLanguageModal({ languages, currentSubscriptions, onClose, onAdd }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!selected) return;
    setError(null);
    setSaving(true);
    try {
      await onAdd(selected);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not add language');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Add a language</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="muted">Choose a language to start receiving daily lessons.</p>

          <div className="lang-picker">
            {languages.map((lang) => {
              const already = currentSubscriptions.includes(lang.key);
              const isSelected = selected === lang.key;
              return (
                <button
                  key={lang.key}
                  className={`lang-pick ${isSelected ? 'selected' : ''} ${already ? 'muted-pick' : ''}`}
                  onClick={() => setSelected(lang.key)}
                  disabled={saving}
                >
                  {isKnownTech(lang.key) && (
                    <div className="lang-pick-icon">
                      <TechIcon tech={lang.key} size={44} />
                    </div>
                  )}
                  <div className="lang-pick-text">
                    <div className="lang-pick-name">{lang.name}</div>
                    <div className="lang-pick-count">
                      {lang.topicCount} topics{already ? ' · subscribed' : ''}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={!selected || saving}
          >
            {saving ? 'Adding...' : 'Add language'}
          </button>
        </div>
      </div>
    </div>
  );
}
