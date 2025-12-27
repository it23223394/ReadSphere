import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const publicUrl = process.env.PUBLIC_URL || '';
  const videoSrc = `${publicUrl}/videos/books-falling.mp4.mp4`;
  const posterSrc = `${publicUrl}/videos/books-falling.jpg`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Decode role from JWT to ensure accuracy
      const decodeRoleFromToken = (tok) => {
        try {
          const payload = JSON.parse(atob(tok.split('.')[1] || ''));
          return payload && payload.role ? payload.role : null;
        } catch {
          return null;
        }
      };

      const jwtRole = decodeRoleFromToken(data.token) || data.role || 'USER';

      // Store auth data with decoded role
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', jwtRole);

      // Use AuthContext login function to update global state
      login(data.userId, jwtRole);

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        // Route based on actual role
        if (jwtRole === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Video Background */}
      <video
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="video-background"
        poster={posterSrc}
        onLoadedData={() => setVideoLoaded(true)}
        onError={(e) => {
          console.error('Background video failed to load:', videoSrc, e);
          setVideoError(true);
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="video-overlay"></div>

      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Login to your ReadSphere account</p>
        {/* Optional tiny status hint for debugging only; remove if undesired */}
        {videoError && (
          <div className="error-message">Background video failed to load. Check /public/videos/books-falling.mp4</div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <a href="/forgot-password">Forgot password?</a>
          <a href="/register">Create account</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
