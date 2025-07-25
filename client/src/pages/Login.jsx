import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
// import logo from '../assets/medimeal-logo.png';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('medimeal_user'));
    if (user && user.email) {
      navigate('/gemini-recommend#recommendations');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      setMsg(res.data.message);
      // Redirect to landing page after successful login
      if (res.data.message && res.data.message.toLowerCase().includes('login successful')) {
        // Store user info in localStorage (prefer name if available)
        const userName = res.data.name || email;
        localStorage.setItem('medimeal_user', JSON.stringify({ name: userName, email }));
        setTimeout(() => navigate('/gemini-recommend#recommendations'), 1000); // 1 second delay for feedback
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed');
    }
  };

  const GOOGLE_CLIENT_ID = '772559724147-utfpmphmr81s84n2eao0fnl7likdp79r.apps.googleusercontent.com';

  return (
    <div
      className="auth-bg"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Background image with overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
          zIndex: 0,
          filter: 'brightness(0.7) blur(1px)',
          transition: 'opacity 1.2s'
        }}
      />
      {/* Animated welcome text */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          color: '#fff',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 600,
          textShadow: '0 2px 12px #0a234299',
          animation: 'fade-in 1.5s'
        }}
      >
        Welcome to Medimeal<br />
        <span style={{ fontSize: '1.1rem', fontWeight: 400 }}>
          Eat healthy, live happy. Your personalized meal journey starts here!
        </span>
      </div>
      {/* Login card */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* <img src={logo} alt="Medimeal Logo" style={{ width: 120, margin: '2rem auto 1rem auto', display: 'block' }} /> */}
        <div className="auth-card">
          <div className="auth-title" style={{ color: '#0a2342' }}>Login</div>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="mb-3">
              <label className="auth-label" style={{ color: '#0a2342' }}>Email</label>
              <input
                type="email"
                className="form-control auth-input"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="auth-label" style={{ color: '#0a2342' }}>Password</label>
              <input
                type="password"
                className="form-control auth-input"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="auth-btn" type="submit" style={{ background: 'linear-gradient(90deg, #0a2342 60%, #274472 100%)', color: '#fff' }}>Login</button>
            {msg && <div className="alert alert-info auth-alert">{msg}</div>}
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={credentialResponse => {
                  fetch('http://localhost:5000/api/google-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: credentialResponse.credential })
                  })
                    .then(res => res.json())
                    .then(data => {
                      if (data.email) {
                        localStorage.setItem('medimeal_user', JSON.stringify({ name: data.name, email: data.email }));
                        setMsg('Login successful');
                        setTimeout(() => navigate('/gemini-recommend#recommendations'), 1000);
                      } else {
                        setMsg('Google login failed.');
                      }
                    });
                }}
                onError={() => {
                  setMsg('Google Login Failed');
                }}
                width="100%"
                size="large"
                text="continue_with"
              />
            </GoogleOAuthProvider>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '1rem' }}>
            Don't have an account?{' '}
            <span
              style={{ color: '#274472', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}