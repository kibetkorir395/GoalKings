import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Auth.scss'
import { signInUser } from '../../firebase';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import { notificationState } from '../../recoil/atoms';
import { useSetRecoilState } from 'recoil';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <button type='submit' className='btn'>Sign In</button>
        </form>
      </div>
      <span className="auth-footer">
        Don't have an account? Register <NavLink to='/register'>here</NavLink>
      </span>
    </div>
  )
}
