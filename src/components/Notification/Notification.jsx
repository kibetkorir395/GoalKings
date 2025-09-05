import { useRecoilState } from 'recoil';
import { notificationState } from '../../recoil/atoms';
import { BsCheckCircle, BsExclamationCircle } from 'react-icons/bs';
import { CgClose } from 'react-icons/cg';
import { BiError } from 'react-icons/bi';
import './Notification.scss';
import { useEffect } from 'react';

export default function Notification() {
  const [notification, setNotification] = useRecoilState(notificationState);

  // Automatically hide notification after 2 seconds
  /*useEffect(() => {
    if (notification.isVisible) {
      const timer = setTimeout(() => {
        setNotification({
          isVisible: false,
          type: null,
          message: null,
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);*/

  useEffect(() => {
    if (notification.isVisible) {
      // Set visibility to false after 3 seconds
      const visibilityTimer = setTimeout(() => {
        setNotification((prev) => ({
          ...prev,
          isVisible: false,
        }));
  
        // Set type and message to null after an additional 1 second
        const resetTimer = setTimeout(() => {
          setNotification((prev) => ({
            ...prev,
            type: null,
            message: null,
          }));
        }, 1000);
  
        // Clear the reset timer if the component unmounts or notification changes
        return () => clearTimeout(resetTimer);
      }, 3000);
  
      // Clear the visibility timer if the component unmounts or notification changes
      return () => clearTimeout(visibilityTimer);
    }
  }, [notification.isVisible, setNotification]);
  

  /*const handleClose = () => {
    setNotification({
      isVisible: false,
      type: null,
      message: null,
    });
  };*/


  const handleClose = () => {
    // Set visibility to false after 3 seconds
    const visibilityTimer = setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        isVisible: false,
      }));
  
      // Set type and message to null after an additional 1 second
      const resetTimer = setTimeout(() => {
        setNotification((prev) => ({
          ...prev,
          type: null,
          message: null,
        }));
      }, 1000);
  
      // Clear the reset timer if needed
      return () => clearTimeout(resetTimer);
    }, 3000);
  
    // Clear the visibility timer if needed
    return () => clearTimeout(visibilityTimer);
  };
  

  const renderIcon = () => {
    if (notification.type === 'error') return <BiError className="icon" />;
    if (notification.type === 'warning') return <BsExclamationCircle className="icon" />;
    if (notification.type === 'success') return <BsCheckCircle className="icon" />;
    return null;
  };

  return (<div className={`notification ${notification.isVisible ? "show" : "hide"} ${notification.type}`}>
      {renderIcon()}
      <span className="message">{notification.message}</span>
      <span className="close-btn" onClick={handleClose}>
        <CgClose />
      </span>
    </div>
  );
}