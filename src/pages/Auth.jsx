import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { Mail, Lock, User, MapPin, ArrowRight, Leaf, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    city: 'Bangalore'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        navigate('/');
      } else {
        await signUp(formData.email, formData.password, formData.fullName, formData.city);
        setSuccessMsg('Account created successfully! You can now log in immediately.');
        setIsLogin(true);
      }
    } catch (err) {
      if (err.message && (err.message.toLowerCase().includes('email not confirmed') || err.message.toLowerCase().includes('email_not_confirmed'))) {
        setError('Email not confirmed. Please check your inbox (and spam folder) for the verification link. Alternatively, if this is a development environment, you can disable this requirement by going to your Supabase Dashboard -> Authentication -> Providers -> Email, and toggling "Confirm email" to OFF.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'OAuth error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container page-transition">
        {/* Left: Branding Panel */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="auth-logo">
              <Leaf size={32} />
              <span>UrbanRoots</span>
            </div>
            <h1>Grow Green<br />in the City</h1>
            <p>Your personal plant care companion for urban gardening in Karnataka.</p>
            <div className="branding-features">
              <div className="bf-item">🌿 AI-Powered Disease Detection</div>
              <div className="bf-item">📖 Karnataka Plant Encyclopedia</div>
              <div className="bf-item">👨‍🌾 Expert Consultations</div>
              <div className="bf-item">🛒 Gardening Marketplace</div>
            </div>
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="auth-form-panel">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
            >
              Log In
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
            >
              Sign Up
            </button>
          </div>

          <h2 className="auth-heading">
            {isLogin ? 'Welcome back, Gardener!' : 'Join the community'}
          </h2>

          {!isSupabaseConfigured && (
            <div className="auth-error" style={{ backgroundColor: '#fff3cd', color: '#856404', borderColor: '#ffeeba', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem', lineHeight: '1.4' }}>
              <strong>⚠️ Database Connection Error:</strong> Supabase has not been configured on Vercel yet. 
              Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your Vercel project environment variables and redeploy. 
              Localhost works because it reads them from your local <code>.env</code> file.
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {successMsg && <div className="auth-success">{successMsg}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <MapPin size={18} className="input-icon" />
                  <select
                    value={formData.city}
                    onChange={e => handleChange('city', e.target.value)}
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mysore">Mysore</option>
                    <option value="Mangalore">Mangalore</option>
                    <option value="Hubli">Hubli</option>
                    <option value="Dharwad">Dharwad</option>
                    <option value="Belgaum">Belgaum</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </div>

            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                minLength={6}
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-spinner"></span>
              ) : (
                <>
                  {isLogin ? 'Log In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="oauth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <span className="google-icon">G</span>
            Sign In with Google
          </button>

          <p className="auth-footer-text">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="auth-switch-btn"
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
