import React, { useEffect, useState } from 'react';
import { verifyEmail } from '../services/api';

const VerifyEmail = () => {
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const run = async () => {
      try {
        if (!token) {
          setError('Missing token');
          return;
        }
        const data = await verifyEmail(token);
        setMsg(data.message || 'Email verified successfully.');
      } catch (e) {
        setError(e.message);
      }
    };
    run();
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Email Verification</h1>
        {error && <div className="error-message">{error}</div>}
        {msg && <div className="success-message">{msg}</div>}
        <div className="auth-links">
          <a href="/login">Go to login</a>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
