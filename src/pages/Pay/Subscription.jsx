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
}
