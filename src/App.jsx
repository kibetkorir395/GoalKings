// App.js
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { notificationState, userState } from './recoil/atoms';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getUser, recordWebsiteVisit  } from './firebase';
import { IoArrowUp } from "react-icons/io5";

import Topbar from './components/Topbar/Topbar';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import NotFound from './pages/NotFound/NotFound';
import AddTip from './Admin/Tips/AddTip';
import EditTip from './Admin/Tips/EditTip';
import ListUsers from './Admin/Users/ListUsers';
import EditUser from './Admin/Users/EditUser';
import ProtectedRoute from './utils/ProtectedRoute';
import ProtectedAuthRoute from './utils/ProtectedAuthRoute';
import ProtectedAdminRoute from './utils/ProtectedAdminRoute';
import { checkSubscriptionStatus, checkLocality, getUserPlatform } from './utils/subscription';
import KoraPayments from './pages/Pay/KoraPayments';
import PaystackPayments from './pages/Pay/PaystackPayments';
import Notification from './components/Notification/Notification';
import InstallPrompt from './components/InstallPrompt/InstallPrompt';

import { useCurrency } from './context/CurrencyContext';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useRecoilState(userState);
  const [isScrolled, setIsScrolled] = useState(false);
  const setNotification = useSetRecoilState(notificationState);
  const { symbol, currency, convertPrice, locality  } = useCurrency();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        getUser(currentUser.email, setUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    checkSubscriptionStatus(user, setNotification);
  }, [user]);

  useEffect(() => {
    if (user && locality !== undefined) {
      checkLocality(user, locality);
      const device = getUserPlatform()
      if (navigator.userAgentData) {
        navigator.userAgentData.getHighEntropyValues([
          "architecture", 
          "model", 
          "platformVersion", 
          "fullVersionList"
        ])
        .then(info => {
          recordWebsiteVisit(user.email, window.location.hostname, {device,...info});
        });
      }
      
    }
  }, [user]); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      {loading ? <Loader /> : (
        <>
          <Topbar />
          <Navbar />
          <Notification />
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="subscribe" element={<ProtectedRoute>{currency === "KES" ? <PaystackPayments /> : <KoraPayments />}</ProtectedRoute>} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<ProtectedAuthRoute><Login /></ProtectedAuthRoute>} />
            <Route path="register" element={<ProtectedAuthRoute><Register /></ProtectedAuthRoute>} />
            <Route path="add-tip" element={<ProtectedAdminRoute><AddTip /></ProtectedAdminRoute>} />
            <Route path="edit-tip" element={<ProtectedAdminRoute><EditTip /></ProtectedAdminRoute>} />
            <Route path="users" element={<ProtectedAdminRoute><ListUsers /></ProtectedAdminRoute>} />
            <Route path="users/:id" element={<ProtectedAdminRoute><EditUser /></ProtectedAdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {isScrolled && (
            <button className="btn top" title="to top" onClick={handleScrollToTop}>
              <IoArrowUp />
            </button>
          )}
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
