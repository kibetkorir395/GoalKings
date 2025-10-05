import { useLocation } from 'react-router-dom';
import './Pay.scss';
import { useEffect, useState } from 'react';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import Loader from '../../components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import { pricings } from '../../data';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { notificationState, subscriptionState, userState } from '../../recoil/atoms';
import { getUser, updateUser } from '../../firebase';

// PayHero API configuration - replace with your actual credentials
const PAYHERO_CONFIG = {
  baseUrl: 'https://backend.payhero.co.ke/api/v2',
  apiUsername: 'gZNGpGEC2zoZfBnkRNsW',
  apiPassword: 'ZAawtbp3HCACqEVVBPexKy41MYybrK2nyr98xEEm',
  channelId: 3123, // Your registered payment channel ID
};

// Generate Basic Auth token for PayHero
const generateBasicAuthToken = () => {
  const credentials = `${PAYHERO_CONFIG.apiUsername}:${PAYHERO_CONFIG.apiPassword}`;
  const encodedCredentials = btoa(credentials);
  return `Basic ${encodedCredentials}`;
};

/**
 * Initiate PayHero payment (MPESA STK Push)
 */
const initiatePayHeroPayment = async (paymentData) => {
  try {
    const response = await fetch(`${PAYHERO_CONFIG.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateBasicAuthToken(),
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        phone_number: paymentData.phoneNumber,
        channel_id: PAYHERO_CONFIG.channelId,
        provider: "m-pesa",
        external_reference: paymentData.externalReference,
        customer_name: paymentData.customerName,
        // Remove callback_url since we don't want webhooks
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayHero API error: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('PayHero payment initiation failed:', error);
    throw error;
  }
};

export default function Subscription() {
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const location = useLocation();
  const [data, setData] = useState(null);
  const setNotification = useSetRecoilState(notificationState);
  const [subscription, setSubscription] = useRecoilState(subscriptionState);
  const navigate = useNavigate();

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
      getUser(user.email, setUser);
    }).then(() => {
      navigate("/", { replace: true });
    });
  };

  const handlePayHeroPayment = async () => {
    if (!phoneNumber) {
      setNotification({
        message: 'Please enter your phone number',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        amount: Math.round((data && data.price) || subscription.price),
        phoneNumber: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.replace(/^0+/, '')}`,
        externalReference: `SUB-${user.email}-${new Date().getTime()}`,
        customerName: user.email.split('@')[0],
      };

      const result = await initiatePayHeroPayment(paymentData);

      if (result.success) {
        setPaymentInitiated(true);
        setPaymentReference(result.reference);
        setNotification({
          message: 'MPESA payment request sent to your phone. Please complete the prompt on your device.',
          type: 'success'
        });

        // Simple success simulation after delay (replace with manual confirmation)
        setTimeout(() => {
          setNotification({
            message: 'Please confirm if you have completed the MPESA payment on your phone.',
            type: 'info'
          });
        }, 5000);
      } else {
        setNotification({
          message: 'Failed to initiate payment. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        message: `Payment failed: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualConfirmation = async () => {
    setLoading(true);
    try {
      await handleUpgrade();
    } catch (error) {
      setNotification({
        message: 'Failed to activate subscription. Please contact support.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className='pay'>
      <AppHelmet title={"Subscription Payment"} />
      <ScrollToTop />
      
      {loading && <Loader />}

      <div className="payment-container">
        {data && <h4>Payment Of KSH {data.price}</h4>}
        {data && <h4>You Are About To Claim {data.plan} Plan.</h4>}
        
        {!paymentInitiated ? (
          <div className="payment-form">
            <div className="form-group">
              <label htmlFor="phoneNumber">MPESA Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                className="form-control"
                placeholder="e.g., 07XX XXX XXX"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                disabled={loading}
              />
              <small className="form-text">
                Enter your MPESA registered phone number. We'll send a payment request.
              </small>
            </div>
            
            <button 
              className="btn" 
              onClick={handlePayHeroPayment}
              disabled={loading || !phoneNumber}
            >
              {loading ? 'Processing...' : 'Pay with MPESA'}
            </button>
          </div>
        ) : (
          <div className="payment-pending">
            <div className="alert alert-info">
              <h5>Payment Request Sent!</h5>
              <p>We've sent an MPESA prompt to <strong>{phoneNumber}</strong>.</p>
              <p>Please check your phone and enter your MPESA PIN to complete the payment.</p>
              <p>Reference: <strong>{paymentReference}</strong></p>
              
              <div className="confirmation-buttons">
                <p>After completing the payment on your phone:</p>
                <button 
                  className="btn" 
                  onClick={handleManualConfirmation}
                  disabled={loading}
                >
                  {loading ? 'Activating...' : 'I have completed the payment'}
                </button>
                <button 
                  className="btn secondary" 
                  onClick={() => setPaymentInitiated(false)}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
/*import { useLocation } from 'react-router-dom';
import './Pay.scss';
import { useEffect, useState } from 'react';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import Loader from '../../components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import { pricings } from '../../data';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { notificationState, subscriptionState, userState } from '../../recoil/atoms';
import { getUser, updateUser } from '../../firebase';

// PayHero API configuration
const PAYHERO_CONFIG = {
  baseUrl: 'https://backend.payhero.co.ke/api/v2',
  // Replace with your actual PayHero credentials
  apiUsername: 'gZNGpGEC2zoZfBnkRNsW',
  apiPassword: 'ZAawtbp3HCACqEVVBPexKy41MYybrK2nyr98xEEm',
  channelId: 2216, // Your registered payment channel ID
};

// Generate Basic Auth token for PayHero
const generateBasicAuthToken = () => {
  const credentials = `${PAYHERO_CONFIG.apiUsername}:${PAYHERO_CONFIG.apiPassword}`;
  const encodedCredentials = btoa(credentials);
  return `Basic ${encodedCredentials}`;
};

//Initiate PayHero payment (MPESA STK Push)
 
const initiatePayHeroPayment = async (paymentData) => {
  try {
    const response = await fetch(`${PAYHERO_CONFIG.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateBasicAuthToken(),
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        phone_number: paymentData.phoneNumber,
        channel_id: PAYHERO_CONFIG.channelId,
        provider: "m-pesa",
        external_reference: paymentData.externalReference,
        customer_name: paymentData.customerName,
        callback_url: paymentData.callbackUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayHero API error: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('PayHero payment initiation failed:', error);
    throw error;
  }
};

//Check payment status with PayHero

const checkPayHeroPaymentStatus = async (reference) => {
  try {
    // Note: PayHero primarily uses webhooks/callbacks for status updates
    // You might need to implement a separate endpoint to check status if needed
    // This would depend on your backend implementation
    console.log('Payment status checking would be handled via callback URL');
    return null;
  } catch (error) {
    console.error('Failed to check payment status:', error);
    return null;
  }
};

export default function Subscription() {
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const location = useLocation();
  const [data, setData] = useState(null);
  const setNotification = useSetRecoilState(notificationState);
  const [subscription, setSubscription] = useRecoilState(subscriptionState);
  const navigate = useNavigate();

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
      getUser(user.email, setUser);
    }).then(() => {
      navigate("/", { replace: true });
    });
  };

  const handlePayHeroPayment = async () => {
    if (!phoneNumber) {
      setNotification({
        message: 'Please enter your phone number',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        amount: (data && data.price) || subscription.price,
        phoneNumber: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.replace(/^0+/, '')}`,
        externalReference: `SUB-${user.email}-${new Date().getTime()}`,
        customerName: user.email.split('@')[0],
        callbackUrl: `${window.location.origin}/api/payhero-callback`, // Your callback endpoint
      };

      const result = await initiatePayHeroPayment(paymentData);

      if (result.success) {
        setPaymentInitiated(true);
        setNotification({
          message: 'Payment request sent to your phone. Please complete the MPESA prompt.',
          type: 'success'
        });

        // Poll for payment status (optional - primarily rely on webhooks)
        pollPaymentStatus(result.reference);
      } else {
        setNotification({
          message: 'Failed to initiate payment. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        message: `Payment failed: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (reference) => {
    // Simple polling mechanism - in production, rely more on webhooks
    const maxAttempts = 30; // 5 minutes at 10-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;
      
      try {
        // In a real implementation, you'd check your backend which receives webhooks
        // or implement a proper status check endpoint
        const status = await checkPayHeroPaymentStatus(reference);
        
        if (status === 'Success') {
          await handleUpgrade();
          return;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    setTimeout(checkStatus, 10000);
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className='pay'>
      <AppHelmet title={"Subscription Payment"} />
      <ScrollToTop />
      
      {loading && <Loader />}

      <div className="payment-container">
        {data && <h4>Payment Of KSH {data.price}</h4>}
        {data && <h4>You Are About To Claim {data.plan} Plan.</h4>}
        
        {!paymentInitiated ? (
          <div className="payment-form">
            <div className="form-group">
              <label htmlFor="phoneNumber">MPESA Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                className="form-control"
                placeholder="e.g., 07XX XXX XXX"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                disabled={loading}
              />
              <small className="form-text text-muted">
                Enter your MPESA registered phone number. We'll send a payment request.
              </small>
            </div>
            
            <button 
              className="btn btn-primary btn-pay" 
              onClick={handlePayHeroPayment}
              disabled={loading || !phoneNumber}
            >
              {loading ? 'Processing...' : 'Pay with MPESA'}
            </button>
          </div>
        ) : (
          <div className="payment-pending">
            <div className="alert alert-info">
              <h5>Payment Request Sent!</h5>
              <p>We've sent an MPESA prompt to <strong>{phoneNumber}</strong>.</p>
              <p>Please check your phone and enter your MPESA PIN to complete the payment.</p>
              <p>Your subscription will be activated automatically once payment is confirmed.</p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setPaymentInitiated(false)}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}*/

/*import { useLocation } from 'react-router-dom';
import './Pay.scss';
import { useEffect, useState } from 'react';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import Loader from '../../components/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import { pricings } from '../../data';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { notificationState, subscriptionState, userState } from '../../recoil/atoms';
import { PaystackButton } from 'react-paystack';
import { getUser, updateUser } from '../../firebase';


export default function Subscription() {
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [data, setData] = useState(null);
  const setNotification = useSetRecoilState(notificationState);
  const [subscription, setSubscription] = useRecoilState(subscriptionState);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      setData(location.state.subscription)
      setSubscription(location.state.subscription)
    } else {
      setData(pricings[0])
      setSubscription(pricings[0])
    }
  }, [location]);

  const handleUpgrade = async () => {
    const currentDate = new Date().toISOString();
    await updateUser(user.email, true, {
      subDate: currentDate,
      billing: subscription.billing,
      plan: subscription.plan,
    }, setNotification).then(() => {
      getUser(user.email, setUser);
    }).then(() => {
      navigate("/", { replace: true });
    });
  };

  const componentProps = {
		reference: new Date().getTime().toString(),
		email: user ? user.email : "coongames8@gmail.com",
		amount: (data && data.price * 100) || subscription.price * 100,
		publicKey: "pk_live_71bc9718fd9b78e12c120101e663c27d9fc7b1cf",
		currency: "KES",
		metadata: {
			name: user ? user.email : "coongames8@gmail.com",
		},
		text: "PAY NOW",
		onSuccess: (response) => {
			handleUpgrade();
		},
		onClose: () => {
			//console.log('Payment dialog closed');
			// Handle payment closure here
		},
	};

  return (
    <div className='pay'>
      <AppHelmet title={"Booking"} />
      <ScrollToTop />
      {
        loading && <Loader />
      }

      {data && <h4>Payment Of KSH {data.price}</h4>}
      {data && <h4>You Are About To Claim {data.plan} Plan.</h4>}
      <PaystackButton {...componentProps} className='btn' />
    </div>
  )
}*/
