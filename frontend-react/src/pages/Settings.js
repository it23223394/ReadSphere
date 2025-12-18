import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { getSettings, updateSettings } from '../services/api';
import { applyTheme, loadTheme, themeOptions } from '../utils/theme';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();
        const current = loadTheme();
        const backendTheme = data.theme === 'dark' ? 'theme-vintage-dark' : 'theme-vintage';
        const initialTheme = data.theme ? backendTheme : current;
        // Do NOT apply theme here to avoid altering current look when opening Settings
        setSettings({ ...data, theme: initialTheme });
      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, []);

  const dirty = useMemo(() => !!settings, [settings]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setMsg('');
    setSaving(true);
    try {
      const payload = {
        readingGoalBooksPerMonth: settings.readingGoalBooksPerMonth ?? null,
        readingGoalPagesPerDay: settings.readingGoalPagesPerDay ?? null,
        theme: (settings.theme === 'theme-vintage-dark' ? 'dark' : 'light'),
        notificationsEnabled: settings.notificationsEnabled
      };
      const data = await updateSettings(payload);
      const backendTheme = data.theme === 'dark' ? 'theme-vintage-dark' : 'theme-vintage';
      const appliedTheme = applyTheme(backendTheme);
      setSettings({ ...data, theme: appliedTheme });
      setMsg(data.message || 'Settings updated');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeSelect = (value) => {
    const next = applyTheme(value);
    setSettings((prev) => ({ ...prev, theme: next }));
  };

  if (!settings) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ maxWidth: 700, margin: '40px auto' }}>
          {error ? <div style={{ color: 'red' }}>{error}</div> : 'Loading settings...'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page" aria-live="polite" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 className="text-2xl font-bold heading-primary mb-4">User Settings</h2>
        {error && <div className="error-message" role="alert">{error}</div>}
        {msg && <div className="success-message">{msg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Reading Goals</h3>
              <span className="badge">Motivation</span>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label className="label" htmlFor="books">Books per month</label>
                <input id="books" className="number" type="number" min="0" value={settings.readingGoalBooksPerMonth ?? ''}
                       onChange={(e)=>setSettings({ ...settings, readingGoalBooksPerMonth: e.target.value === '' ? null : parseInt(e.target.value,10) })} />
                <span className="help">Set a target to keep your streak growing.</span>
              </div>
              <div className="form-row">
                <label className="label" htmlFor="pages">Pages per day</label>
                <input id="pages" className="number" type="number" min="0" value={settings.readingGoalPagesPerDay ?? ''}
                       onChange={(e)=>setSettings({ ...settings, readingGoalPagesPerDay: e.target.value === '' ? null : parseInt(e.target.value,10) })} />
                <span className="help">A realistic daily target works best.</span>
              </div>
              <button className="btn" type="submit" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save Goals'}</button>
            </form>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Preferences</h3>
              <span className="badge">Experience</span>
            </div>
            <div className="form">
              <div className="form-row">
                <label className="label">Theme</label>
                <div className="segmented" role="group" aria-label="Theme selection">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`segmented-btn ${settings.theme === opt.value ? 'active' : ''}`}
                      onClick={() => handleThemeSelect(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="help">Pick light for a warm reading room or dark for a cozy night library.</div>
              </div>
              <div className="form-row">
                <label className="label" htmlFor="notif">Notifications</label>
                <div>
                  <input id="notif" className="checkbox" type="checkbox" checked={!!settings.notificationsEnabled}
                         onChange={(e)=>setSettings({ ...settings, notificationsEnabled: e.target.checked })} />
                  <span className="help" style={{ marginLeft: 8 }}>Receive tips and reminders.</span>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Save Preferences'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
