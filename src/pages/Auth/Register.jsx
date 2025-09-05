import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Auth.scss'
import { registerUser } from '../../firebase';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import { useSetRecoilState } from 'recoil';
import { notificationState } from '../../recoil/atoms';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setNotification = useSetRecoilState(notificationState);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (email && password) {
      registerUser(username, email, password, setNotification);
    } else {
      setNotification({
        isVisible: true,
        type: 'warning',
        message: "You have entered an invalid email address!",
      });
    };
    return;
  }

  return (
    <div className='auth'>
      <AppHelmet title={"Register"} />
      <ScrollToTop />
      <form onSubmit={handleRegister}>
        <h1>Get Started</h1>
        <label htmlFor="email">Email:</label>
        <input type="email" id='email' placeholder="example@company.com" value={email} onChange={(e) => setEmail(e.target.value)} pattern='/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/' required />
        <label htmlFor="username">Username:</label>
        <input type="text" id='username' placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} pattern={'/^[a-zA-Z0-9._-]{4,15}$/'} required />
        <span>username should be between 4 and 15 characters long and can include letters, numbers, underscores (_), periods (.), and hyphens (-).</span>
        <label htmlFor="password">Password:</label>
        <input type="password" id='password' placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type='submit' className='btn'>SIGN UP</button>
      </form>
      <span>
        Already registered? Login <NavLink to='/login' className='login'>here</NavLink>
      </span>
    </div>
  )
}