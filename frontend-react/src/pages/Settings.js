import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { getSettings, updateSettings, getProfile, updateProfile, changePassword } from '../services/api';
import { applyTheme, loadTheme, themeOptions } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { updateTheme } = useAuth();
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [updateForm, setUpdateForm] = useState({ name: '', email: '' });
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsData, profileData] = await Promise.all([getSettings(), getProfile()]);
        const current = loadTheme();
        const backendTheme = settingsData.theme === 'dark' ? 'theme-vintage-dark' : 'theme-vintage';
        const initialTheme = settingsData.theme ? backendTheme : current;
        // Apply the theme so user sees their saved preference
        applyTheme(initialTheme);
        setSettings({ ...settingsData, theme: initialTheme });
        setProfile(profileData);
        setUpdateForm({ name: profileData.name || '', email: profileData.email || '' });
      } catch (e) {
        setError(e.message);
      }
    };
    load();
  }, []);

  const dirty = useMemo(() => !!settings, [settings]);
  const profileDirty = useMemo(() => profile && (updateForm.name !== (profile.name || '') || updateForm.email !== (profile.email || '')), [profile, updateForm]);
  const emailValid = useMemo(() => /.+@.+\..+/.test(updateForm.email), [updateForm.email]);
  const nameValid = useMemo(() => updateForm.name.trim().length > 1, [updateForm.name]);
  const pwdValid = useMemo(() => {
    const lenOk = pwdForm.newPassword.length >= 6;
    const match = pwdForm.newPassword === pwdForm.confirmPassword;
    const hasOld = pwdForm.oldPassword.length > 0;
    return lenOk && match && hasOld;
  }, [pwdForm]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setMsg('');
    setSaving(true);
    try {
      const payload = {
        theme: (settings.theme === 'theme-vintage-dark' ? 'dark' : 'light'),
        notificationsEnabled: settings.notificationsEnabled
      };
      const data = await updateSettings(payload);
      const backendTheme = data.theme === 'dark' ? 'theme-vintage-dark' : 'theme-vintage';
      const appliedTheme = applyTheme(backendTheme);
      setSettings({ ...data, theme: appliedTheme });
      // Update theme in AuthContext
      updateTheme(data.theme);
      setMsg(data.message || 'Settings updated');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!emailValid || !nameValid) return;
    setSavingProfile(true);
    try {
      const data = await updateProfile(updateForm);
      setProfile(data);
      setMsg(data.message || 'Profile updated successfully');
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!pwdValid) return;
    setSavingPwd(true);
    try {
      const data = await changePassword(pwdForm);
      setMsg(data.message || 'Password changed successfully');
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingPwd(false);
    }
  };

  const handleThemeSelect = (value) => {
    const next = applyTheme(value);
    setSettings((prev) => ({ ...prev, theme: next }));
  };

  if (!settings || !profile) {
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
        <h2 className="text-2xl font-bold heading-primary mb-4">Your Settings & Profile</h2>
        {error && <div className="error-message" role="alert">{error}</div>}
        {msg && <div className="success-message">{msg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Profile Information</h3>
              <span className="badge">Account</span>
            </div>
            <div className="text-sm text-muted mb-3">
              <div><strong>Name:</strong> {profile.name}</div>
              <div><strong>Email:</strong> {profile.email}</div>
            </div>
            <div className="divider" />
            <h4 className="font-semibold mb-2">Update Profile</h4>
            <form className="form" onSubmit={handleUpdateProfile}>
              <div className="form-row">
                <label className="label" htmlFor="name">Name</label>
                <input id="name" className="input" type="text" value={updateForm.name} onChange={(e)=>setUpdateForm({ ...updateForm, name: e.target.value })} required />
                {!nameValid && <span className="help">Name must be at least 2 characters.</span>}
              </div>
              <div className="form-row">
                <label className="label" htmlFor="email">Email</label>
                <input id="email" className="input" type="email" value={updateForm.email} onChange={(e)=>setUpdateForm({ ...updateForm, email: e.target.value })} required />
                {!emailValid && <span className="help">Enter a valid email address.</span>}
              </div>
              <button className="btn" type="submit" disabled={!profileDirty || !emailValid || !nameValid || savingProfile}>
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Change Password</h3>
              <span className="badge">Security</span>
            </div>
            <form className="form" onSubmit={handleChangePwd}>
              <div className="form-row">
                <label className="label" htmlFor="old">Current Password</label>
                <input id="old" className="input" type="password" value={pwdForm.oldPassword} onChange={(e)=>setPwdForm({ ...pwdForm, oldPassword: e.target.value })} required />
              </div>
              <div className="form-row">
                <label className="label" htmlFor="new">New Password</label>
                <input id="new" className="input" type="password" value={pwdForm.newPassword} onChange={(e)=>setPwdForm({ ...pwdForm, newPassword: e.target.value })} required />
                {pwdForm.newPassword && pwdForm.newPassword.length < 6 && <span className="help">At least 6 characters.</span>}
              </div>
              <div className="form-row">
                <label className="label" htmlFor="confirm">Confirm Password</label>
                <input id="confirm" className="input" type="password" value={pwdForm.confirmPassword} onChange={(e)=>setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} required />
                {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && <span className="help">Passwords must match.</span>}
              </div>
              <button className="btn" type="submit" disabled={!pwdValid || savingPwd}>
                {savingPwd ? 'Changing…' : 'Change Password'}
              </button>
            </form>
          </div>

          <div className="card md:col-span-2">
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
              <button className="btn" onClick={handleSubmit} disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save Preferences'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
