import { useLocation } from 'react-router-dom';
import './Pay.scss';
import { useEffect, useState, useRef } from 'react';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import Loader from '../../components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import { pricings } from '../../data';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { notificationState, subscriptionState, userState } from '../../recoil/atoms';
import { getUser, updateUser } from '../../firebase';
import Swal from 'sweetalert2';

// Twitter Events Utility Functions
const trackTwitterEvent = (eventId, parameters = {}) => {
  if (typeof window !== 'undefined' && window.twq) {
    window.twq('event', eventId, parameters);
  } else {
    console.warn('X Twitter pixel not loaded yet');
    if (typeof window !== 'undefined') {
      window.twitterEventQueue = window.twitterEventQueue || [];
      window.twitterEventQueue.push({ eventId, parameters });
    }
  }
};

const trackPurchase = (value, currency = 'KES', contents = []) => {
  trackTwitterEvent('tw-ql57w-ql57x', {
    value: value,
    currency: currency,
    contents: contents,
    conversion_id: 'goal-kings-subscription'
  });
};

// Twitter Pixel Queue Hook
const useTwitterPixelQueue = () => {
  useEffect(() => {
    const processQueue = () => {
      if (window.twitterEventQueue && window.twitterEventQueue.length > 0) {
        window.twitterEventQueue.forEach(({ eventId, parameters }) => {
          if (window.twq) {
            window.twq('event', eventId, parameters);
          }
        });
        window.twitterEventQueue = [];
      }
    };

    const interval = setInterval(() => {
      if (window.twq) {
        processQueue();
        clearInterval(interval);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => clearInterval(interval);
  }, []);
};

export default function PesapalSubscription() {
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollingNotification, setPollingNotification] = useState(null);
  const [orderTrackingId, setOrderTrackingId] = useState(null);
  const location = useLocation();
  const [data, setData] = useState(null);
  const setNotification = useSetRecoilState(notificationState);
  const [subscription, setSubscription] = useRecoilState(subscriptionState);
  const navigate = useNavigate();
  const pollIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  // Initialize Twitter pixel queue
  useTwitterPixelQueue();

  useEffect(() => {
    if (location.state) {
      setData(location.state.subscription);
      setSubscription(location.state.subscription);
    } else {
      setData(pricings[0]);
      setSubscription(pricings[0]);
    }
  }, [location]);

  const handleUpgrade = async () => {
    const currentDate = new Date().toISOString();
    await updateUser(user.email, true, {
      subDate: currentDate,
      billing: subscription.billing,
      plan: subscription.plan,
    }, setNotification).then(() => {
      return getUser(user.email, setUser);
    }).then(() => {
      // Track successful purchase conversion
      trackPurchase(
        data?.price || subscription.price,
        'KES',
        [
          {
            id: subscription.plan,
            quantity: 1,
            item_price: data?.price || subscription.price
          }
        ]
      );

      // Show success message
      Swal.fire({
        icon: 'success',
        title: '🎉 Welcome to VIP!',
        html: `
          <div style="text-align: center;">
            <h3 style="color: #4CAF50; margin-bottom: 15px;">Payment Successful!</h3>
            <p style="font-size: 16px; margin: 8px 0;">You are now a <strong>${subscription.plan}</strong> VIP member</p>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">Enjoy exclusive tips and premium content</p>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonColor: '#4CAF50',
        confirmButtonText: 'Start Exploring!',
        timer: 5000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          htmlContainer: 'swal-custom-html',
          confirmButton: 'swal-custom-confirm-success'
        }
      }).then(() => {
        // Clear any pending polling states
        clearPolling();
        navigate("/", { replace: true });
      });
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Upgrade Failed',
        text: error.message,
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          htmlContainer: 'swal-custom-html',
          confirmButton: 'swal-custom-confirm'
        }
      });
    });
  };

  // Clear all polling related states and intervals
  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setPolling(false);
    setPollingNotification(null);
    setOrderTrackingId(null);
  };

  // Show persistent notification for polling status
  const showPollingNotification = (message, type = 'info') => {
    // Close existing notification
    if (pollingNotification) {
      pollingNotification.close();
    }

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: null,
      timerProgressBar: false,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    const notification = Toast.fire({
      icon: type,
      title: message,
      timer: undefined,
      showConfirmButton: type === 'error' || type === 'warning',
      confirmButtonText: 'Reset',
      showCloseButton: true,
      customClass: {
        popup: 'polling-toast'
      }
    });

    setPollingNotification(notification);
    return notification;
  };

  // Function to check payment status
  const checkPaymentStatus = async (orderTrackingId, handleUpgrade, stopPolling) => {
    const paymentData = {
      orderTrackingId,
      consumerKey: "nbZBtDnSEt9X+l0cHNDFren+7dTQIJXl",
      consumerSecret: "3p2NhatNMO64hzQpqGUs062LTvE="
    };

    try {
      const res = await fetch(`https://all-payments-api-production.up.railway.app/api/pesapal/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
    
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Payment Status:', data);
      
      const status = data.payment_status_description || '';
      const statusCode = data.status_code;
      
      // COMPLETED - Payment successful
      if (status === 'COMPLETED' || statusCode === 1) {
        stopPolling();
        await handleUpgrade();
        return { completed: true, status: 'success' };
      } 
      // FAILED - Payment failed
      else if (status === 'FAILED' || statusCode === 2) {
        stopPolling();
        showPollingNotification('Payment failed. Please try again.', 'error');
        return { completed: false, status: 'failed' };
      }
      // REVERSED - Payment was reversed
      else if (status === 'REVERSED' || statusCode === 3) {
        stopPolling();
        showPollingNotification('Payment was reversed. Please contact support.', 'warning');
        return { completed: false, status: 'reversed' };
      }
      // INVALID - Payment not yet processed
      else if (status === 'INVALID' || statusCode === 0) {
        return { completed: false, status: 'pending' };
      }
      
      return { completed: false, status: 'pending' };
    } catch (err) {
      return { completed: false, status: 'error', error: err.message };
    }
  };

  // Function to open the payment modal
  const openPaymentModal = (paymentUrl, trackingId) => {
    let pollCount = 0;
    const MAX_POLLS = 60;
    let isModalClosed = false;
    
    // Show initial polling notification
    showPollingNotification('Waiting for payment confirmation...', 'info');
    
    Swal.fire({
      title: 'Complete Your Payment',
      html: `
        <div style="width: 100%; height: 500px; overflow: hidden; position: relative;">
          <iframe 
            src="${paymentUrl}" 
            style="width: 100%; height: 100%; border: none;"
            title="Pesapal Payment"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-top-navigation-by-user-activation"
            allow="payment *;"
          ></iframe>
        </div>
        <div class="payment-status" style="margin-top: 10px; text-align: center; font-size: 12px; color: #666;">
          Complete payment in the window above. This will close automatically when payment is confirmed.
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '900px',
      customClass: {
        popup: 'payment-modal-popup'
      },
      didOpen: () => {
        // Start polling after 15 seconds
        pollingTimeoutRef.current = setTimeout(() => {
          if (isModalClosed) return;
          
          setPolling(true);
          
          pollIntervalRef.current = setInterval(async () => {
            if (isModalClosed) return;
            
            pollCount++;
            console.log(`Polling payment status (${pollCount}/${MAX_POLLS}) for:`, trackingId);
            
            // Update notification with progress
            if (pollCount % 6 === 0) { // Update every 30 seconds
              showPollingNotification(`Still verifying payment (${Math.floor(pollCount * 5 / 60)} min)...`, 'info');
            }
            
            try {
              const result = await checkPaymentStatus(
                trackingId, 
                handleUpgrade, 
                () => {
                  isModalClosed = true;
                  clearPolling();
                  Swal.close();
                }
              );
              
              if (result.completed && result.status === 'success') {
                isModalClosed = true;
                clearPolling();
                Swal.close();
              } else if (result.status === 'failed' || result.status === 'reversed') {
                isModalClosed = true;
                clearPolling();
                Swal.close();
              }
              
              if (pollCount >= MAX_POLLS && !isModalClosed) {
                isModalClosed = true;
                clearPolling();
                Swal.close();
                
                setTimeout(async () => {
                  const result = await Swal.fire({
                    icon: 'warning',
                    title: 'Payment Status Timeout',
                    html: `
                      <div style="text-align: center;">
                        <p>We're still waiting for payment confirmation.</p>
                        <p>Please check your email for payment receipt.</p>
                        <button id="check-status-btn" style="background: #4CAF50; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                          Check Status Again
                        </button>
                      </div>
                    `,
                    showConfirmButton: false,
                    showCloseButton: true,
                    didOpen: () => {
                      const checkBtn = document.getElementById('check-status-btn');
                      if (checkBtn) {
                        checkBtn.onclick = async () => {
                          Swal.close();
                          // Allow user to manually check status
                          await checkPaymentStatusManually(trackingId);
                        };
                      }
                    }
                  });
                }, 300);
              }
            } catch (err) {
              console.error('Error in polling:', err);
            }
          }, 5000);
        }, 15000);
      },
      willClose: () => {
        isModalClosed = true;
        
        // If modal is closed but we're still polling, ask if they want to keep checking
        if (pollIntervalRef.current && !pollingNotification?.isDismissed) {
          Swal.fire({
            icon: 'question',
            title: 'Payment Still Processing?',
            text: 'Your payment might still be processing. Do you want to continue checking the status?',
            showCancelButton: true,
            confirmButtonText: 'Yes, keep checking',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#d33'
          }).then((result) => {
            if (result.isConfirmed) {
              // Keep polling in background
              showPollingNotification('Continuing to check payment status...', 'info');
            } else {
              // Cancel polling and reset button state
              clearPolling();
              setProcessing(false);
              setPolling(false);
              
              // Reset button state
              Swal.fire({
                icon: 'info',
                title: 'Payment Cancelled',
                text: 'You can try again whenever you\'re ready.',
                confirmButtonText: 'OK',
                timer: 3000
              });
            }
          });
        }
        
        // Clean up
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
      }
    });
  };

  // Manual status check function
  const checkPaymentStatusManually = async (trackingId) => {
    Swal.fire({
      title: 'Checking Payment Status',
      text: 'Please wait...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const result = await checkPaymentStatus(trackingId, handleUpgrade, clearPolling);
    
    Swal.close();
    
    if (result.completed && result.status === 'success') {
      // Success already handled in checkPaymentStatus
    } else if (result.status === 'failed') {
      await Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: 'Your payment was not successful. Please try again.',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#4CAF50'
      });
      clearPolling();
      setProcessing(false);
    } else if (result.status === 'pending') {
      await Swal.fire({
        icon: 'info',
        title: 'Still Processing',
        text: 'Your payment is still being processed. Please check your email for updates or try again later.',
        confirmButtonText: 'OK'
      });
    }
  };

  // Function to handle payment
  const handlePayment = async () => {
    // Reset any previous polling states
    clearPolling();
    setProcessing(false);
    setPolling(false);
    
    if (!user) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login first to continue with payment',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Login Now',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    // Confirm payment
    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirm Payment',
      html: `
        <div style="text-align: left; padding: 5px;">
          <p><strong>Plan:</strong> ${subscription.plan}</p>
          <p><strong>Amount:</strong> KSH ${data?.price || subscription.price}</p>
          <p><strong>Billing:</strong> ${subscription.billing}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    const paymentData = {
      amount: data?.price || subscription.price,
      email: user.email,
      description: `${subscription.plan} Subscription (${subscription.billing})`,
      countryCode: "KE",
      currency: "KES",
      url: window.location.origin + window.location.pathname,
      callbackUrl: window.location.origin, //+ '/payment-callback',
      consumerKey: "nbZBtDnSEt9X+l0cHNDFren+7dTQIJXl",
      consumerSecret: "3p2NhatNMO64hzQpqGUs062LTvE="
    };

    // Track subscription page view
    trackTwitterEvent('tw-ql57w-ql57x', {
      value: data?.price || subscription.price,
      currency: 'KES',
      contents: [
        {
          id: subscription.plan,
          quantity: 1,
          item_price: data?.price || subscription.price
        }
      ],
      event_type: 'subscription_payment_initiated'
    });

    setProcessing(true);
    try {
      const res = await fetch('https://all-payments-api-production.up.railway.app/api/pesapal/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const myData = await res.json();
      
      if (myData.order_tracking_id) {
        setOrderTrackingId(myData.order_tracking_id);
      }
      
      await Swal.fire({
        icon: 'success',
        title: 'Payment Initialized!',
        text: 'Redirecting you to payment gateway...',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      
      setProcessing(false);
      
      setTimeout(() => {
        openPaymentModal(myData.redirect_url, myData.order_tracking_id);
      }, 100);
      
    } catch (err) {
      setProcessing(false);
      clearPolling();
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error: ' + err.message,
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          htmlContainer: 'swal-custom-html',
          confirmButton: 'swal-custom-confirm'
        }
      });
    }
  };

  // Handle callback from Pesapal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingId = urlParams.get('OrderTrackingId');
    const merchantRef = urlParams.get('OrderMerchantReference');
    const notificationType = urlParams.get('OrderNotificationType');
    
    if (trackingId && notificationType === 'CALLBACKURL' && !polling && !processing) {
      setProcessing(true);
      
      Swal.fire({
        title: 'Verifying Payment',
        text: 'Please wait while we confirm your payment...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      checkPaymentStatus(trackingId, handleUpgrade, () => {
        setProcessing(false);
        clearPolling();
        Swal.close();
      });
    }
  }, []);

  // Track page view
  useEffect(() => {
    if (data) {
      trackTwitterEvent('tw-ql57w-ql57x', {
        value: data.price,
        currency: 'KES',
        contents: [
          {
            id: data.plan,
            quantity: 1,
            item_price: data.price
          }
        ],
        event_type: 'subscription_page_view'
      });
    }
  }, [data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  return (
    <div className='pay'>
      <AppHelmet title={"Subscription Payment"} />
      <ScrollToTop />
      {
        (loading || processing) && <Loader />
      }

      <div className="subscription-details">
        {data && <h4>Payment Of KSH {data.price}</h4>}
        {data && <h4>You Are About To Claim {data.plan} Plan.</h4>}
        {data && <p className="billing-info">Billing: {subscription.billing}</p>}
      </div>
      
      <button 
        className='btn' 
        onClick={handlePayment}
        disabled={processing || polling || !data}
      >
        {processing ? (
          <span><i className="fas fa-spinner fa-spin"></i> PROCESSING...</span>
        ) : polling ? (
          <span><i className="fas fa-clock"></i> CHECKING PAYMENT...</span>
        ) : (
          <span><i className="fas fa-lock"></i> PAY NOW </span>
        )}
      </button>
    </div>
  );
}

// Add necessary styles
const additionalStyles = `
/* Payment Modal Specific Styles */
.payment-modal-popup {
  height: 600px !important;
  max-width: 900px !important;
  padding: 0 !important;
}

/* Toast notification for polling */
.polling-toast {
  border-radius: 8px !important;
  font-size: 14px !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  animation: slideInRight 0.3s ease-out !important;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.swal-custom-popup {
  border-radius: 15px !important;
  padding: 20px !important;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
}

.swal-custom-title {
  font-size: 22px !important;
  font-weight: 600 !important;
  color: #333 !important;
  margin-top: 5px !important;
}

.swal-custom-html {
  font-size: 15px !important;
  color: #555 !important;
  margin: 10px 0 !important;
}

.swal-custom-confirm {
  background-color: #d33 !important;
  border-radius: 8px !important;
  padding: 10px 25px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  box-shadow: 0 4px 10px rgba(211, 51, 51, 0.3) !important;
}

.swal-custom-confirm-success {
  background-color: #4CAF50 !important;
  border-radius: 8px !important;
  padding: 10px 25px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3) !important;
}

.swal-custom-cancel {
  background-color: #d33 !important;
  border-radius: 8px !important;
  padding: 10px 25px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  margin-left: 10px !important;
}

.btn {
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  margin-top: 20px;
  width: 100%;
  max-width: 300px;
}

.btn i {
  margin-right: 8px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #a0a0a0 0%, #808080 100%);
  transform: none !important;
  box-shadow: none;
}

.btn:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

.billing-info {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: -10px;
}

.subscription-details {
  margin-bottom: 30px;
}

.swal2-popup.payment-modal-popup {
  padding: 0 !important;
}

.swal2-popup.payment-modal-popup .swal2-title {
  padding: 1rem !important;
  margin: 0 !important;
}

.payment-status {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: #666;
}

/* Loading spinner for button */
.fa-spinner {
  animation: spin 1s linear infinite;
}
`;

// Add styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = additionalStyles;
  document.head.appendChild(style);
}
