import { useEffect, useState } from 'react';
import Logo from '../../assets/logo.png';
import './Navbar.scss';
import { IoClose, IoMenu } from 'react-icons/io5';
import { NavLink, useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/atoms';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const Navbar = () => {
  const [opened, setOpened] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  const handleToggle = () => {
    setOpened(!opened);
  };

  const closeMenu = () => {
    setOpened(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (opened) {
        setOpened(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [opened]);

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <NavLink to="/" className="logo" onClick={closeMenu}>
        <img src={Logo} alt="Goal Kings" />
      </NavLink>

      <nav className={opened ? 'active' : ''}>
        <div className="nav-links">
          <NavLink to="/" className="nav-link" onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/about" className="nav-link" onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/#pricing" className="nav-link" onClick={closeMenu}>
            Pricing
          </NavLink>
        </div>
        <div className="btn-container">
          {user ? (
            <span
              className="btn"
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
            >
              Logout
            </span>
          ) : (
            <>
              <NavLink
                className="btn btn-primary"
                to="login"
                onClick={closeMenu}
                state={{ from: location }}
              >
                Login
              </NavLink>
              <NavLink
                className="btn btn-outline"
                to="register"
                onClick={closeMenu}
                state={{ from: location }}
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <div className="icon" id="menu-bars" onClick={handleToggle}>
        {opened ? <IoClose /> : <IoMenu />}
      </div>
    </header>
  );
};

export default Navbar;
