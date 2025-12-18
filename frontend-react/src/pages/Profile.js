import React, { useEffect, useMemo, useState } from 'react';
import { getProfile, updateProfile, changePassword, resendVerification } from '../services/api';
import { Navbar } from '../components/Navbar';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [updateForm, setUpdateForm] = useState({ name: '', email: '' });
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setUpdateForm({ name: data.name || '', email: data.email || '' });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const emailValid = useMemo(() => /.+@.+\..+/.test(updateForm.email), [updateForm.email]);
  const nameValid = useMemo(() => updateForm.name.trim().length > 1, [updateForm.name]);
  const profileDirty = useMemo(() => profile && (updateForm.name !== (profile.name || '') || updateForm.email !== (profile.email || '')), [profile, updateForm]);

  const pwdValid = useMemo(() => {
    const lenOk = pwdForm.newPassword.length >= 6;
    const match = pwdForm.newPassword === pwdForm.confirmPassword;
    const hasOld = pwdForm.oldPassword.length > 0;
    return lenOk && match && hasOld;
  }, [pwdForm]);

  const handleUpdate = async (e) => {
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

  const handleResendVerification = async () => {
    setError('');
    setMsg('');
    try {
      const data = await resendVerification();
      setMsg(data.message || 'Verification email sent');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page" aria-live="polite">
        <h2 className="text-2xl font-bold heading-primary mb-4">Your Profile</h2>
        {loading && <div className="text-muted">Loading profile…</div>}
        {error && <div className="error-message" role="alert">{error}</div>}
        {msg && <div className="success-message">{msg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Profile Information</h3>
              <span className="badge">Account</span>
            </div>

            {profile && (
              <div className="text-sm text-muted mb-3">
                <div><strong>Name:</strong> {profile.name}</div>
                <div><strong>Email:</strong> {profile.email}</div>
                <button className="btn mt-3" type="button" onClick={handleResendVerification}>Resend verification email</button>
              </div>
            )}

            <div className="divider" />
            <h4 className="font-semibold mb-2">Update Profile</h4>
            <form className="form" onSubmit={handleUpdate}>
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
