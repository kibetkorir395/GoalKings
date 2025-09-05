import { useState } from 'react';
import Logo from '../../assets/logo.png';
import './Navbar.scss';

import { IoClose, IoMenu } from "react-icons/io5";

import { NavLink, useLocation } from "react-router-dom";
import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/atoms';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';


const Navbar = () => {
    const [opened, setOpened] = useState(false)
    const [user, setUser] = useRecoilState(userState);
    const location = useLocation();

    const handleLogout = () => {
        signOut(auth);
        setUser(null);
    }

    const handleToggle = () => {
        //document.querySelector('#menu-bars').classList.toggle('displayed');
        setOpened(!opened);
        document.querySelector('nav').classList.toggle('active');
    }

    window.addEventListener('scroll', () => {
        if (document.querySelector('nav').classList.contains('active')) {
            document.querySelector('nav').classList.remove('active');
            setOpened(false)
        } else {
            return;
        }
    })
    return (
        <header>
            <NavLink to="/" className='logo' onClick={handleToggle}>
                <img src={Logo} />
            </NavLink>
            <nav>
                <div className="btn-container">
                    {
                        user ? <span className='btn' onClick={() => {
                            handleLogout()
                            handleToggle()
                        }}>Logout</span> : <>
                            <NavLink className="btn" to="login" onClick={handleToggle} state={{ from: location }}>Login</NavLink>
                            <NavLink className="btn" to="register" onClick={handleToggle} state={{ from: location }}>Register</NavLink>
                        </>
                    }
                </div>
            </nav>


            <div className="icon" id='menu-bars' onClick={handleToggle}>
                {opened ? <IoClose /> : <IoMenu />}
            </div>
        </header>
    );
}

export default Navbar;
