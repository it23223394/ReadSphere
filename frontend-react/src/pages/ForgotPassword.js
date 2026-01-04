import React, { useState } from 'react';
import '../styles/Auth.css';
import { requestPasswordReset } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const publicUrl = process.env.PUBLIC_URL || '';
  const bgImageSrc = `${publicUrl}/images/1.webp`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      const data = await requestPasswordReset(email);
      setMsg(data.message || 'If the email exists, a reset link has been sent.');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Image Background */}
      <img src={bgImageSrc} alt="background" className="video-background" />
      <div className="video-overlay"></div>
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive a reset link</p>
        {error && <div className="error-message">{error}</div>}
        {msg && <div className="success-message">{msg}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="auth-links">
          <a href="/login">Back to login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
