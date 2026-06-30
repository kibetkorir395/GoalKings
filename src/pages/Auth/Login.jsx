import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Auth.scss'
import { signInUser, resetPassword } from '../../firebase';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import { notificationState } from '../../recoil/atoms';
import { useSetRecoilState } from 'recoil';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const setNotification = useSetRecoilState(notificationState);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      signInUser(email, password, setNotification);
    } else {
      setNotification({
        isVisible: true,
        type: 'warning',
        message: "You have entered an invalid email address!",
      });
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setNotification({
        isVisible: true,
        type: 'warning',
        message: "Please enter your email address",
      });
      return;
    }

    await resetPassword(resetEmail, setNotification, setResetLoading);
    setShowResetModal(false);
    setResetEmail('');
  }

  return (
    <div className='auth'>
      <AppHelmet title={"Login"} />
      <ScrollToTop />
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id='email' placeholder="example@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id='password' placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <span className="forgot-link" onClick={() => setShowResetModal(true)}>
            Forgot Password?
          </span>
          <button type='submit' className='btn'>Sign In</button>
        </form>
      </div>
      <span className="auth-footer">
        Don't have an account? Register <NavLink to='/register'>here</NavLink>
      </span>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reset Password</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="reset-email">Email</label>
                <input
                  type="email"
                  id='reset-email'
                  placeholder="example@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className='btn btn-secondary' onClick={() => setShowResetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className='btn' disabled={resetLoading}>
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
