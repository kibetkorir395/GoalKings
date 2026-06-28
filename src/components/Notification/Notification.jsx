import { useRecoilState } from 'recoil';
import { notificationState } from '../../recoil/atoms';
import { BsCheckCircle, BsExclamationCircle } from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';
import { BiError } from 'react-icons/bi';
import './Notification.scss';
import { useEffect } from 'react';

export default function Notification() {
  const [notification, setNotification] = useRecoilState(notificationState);

  useEffect(() => {
    if (notification.isVisible) {
      const timer = setTimeout(() => {
        setNotification({
          isVisible: false,
          type: null,
          message: null,
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.isVisible, setNotification]);

  const handleClose = () => {
    setNotification({
      isVisible: false,
      type: null,
      message: null,
    });
  };

  const renderIcon = () => {
    if (notification.type === 'error') return <BiError className="icon" />;
    if (notification.type === 'warning') return <BsExclamationCircle className="icon" />;
    if (notification.type === 'success') return <BsCheckCircle className="icon" />;
    return null;
  };

  return (
    <div className={`notification ${notification.isVisible ? 'show' : 'hide'} ${notification.type}`}>
      {renderIcon()}
      <span className="message">{notification.message}</span>
      <span className="close-btn" onClick={handleClose}>
        <CgClose />
      </span>
    </div>
  );
}
