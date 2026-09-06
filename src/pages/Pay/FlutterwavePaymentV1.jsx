import { useLocation, useNavigate } from 'react-router-dom';
import './Pay.scss';
import { useEffect, useState } from 'react';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import Loader from '../../components/Loader/Loader';
import { pricings } from '../../data';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { notificationState, subscriptionState, userState } from '../../recoil/atoms';
import { getUser, updateUser } from '../../firebase';
import { useCurrency } from '../../context/CurrencyContext';
import { FlutterWaveButton, useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function FlutterwavePaymentV1() {
    const [user, setUser] = useRecoilState(userState);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [data, setData] = useState(null);
    const setNotification = useSetRecoilState(notificationState);
    const [subscription, setSubscription] = useRecoilState(subscriptionState);
    const navigate = useNavigate();
    const { symbol, currency, convertPrice } = useCurrency();

    useEffect(() => {
        if (location.state && location.state.subscription) {
            const sub = location.state.subscription;
            setData({
                ...sub,
                price: sub.price != null ? sub.price : convertPrice(sub.price),
                currency: sub.currency || symbol,
            });
            setSubscription(sub);
        } else {
            const fallback = { ...pricings[0], price: convertPrice(pricings[0].price), currency: symbol };
            setData(fallback);
            setSubscription(fallback);
        }
    }, [location]);

    const handleUpgrade = async () => {
        const currentDate = new Date().toISOString();
        await updateUser(
            user.email,
            true,
            {
                subDate: currentDate,
                billing: subscription.billing,
                plan: subscription.plan,
            },
            setNotification
        )
            .then(() => getUser(user.email, setUser))
            .then(() => navigate('/', { replace: true }));
    };

    const handlePayment = () => {
        const config = {
            public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
            tx_ref: new Date().getTime().toString(),//`tx-${Date.now()}`, // Must be unique for every transaction
            amount: data != null ? data.price : convertPrice(subscription.price),
            currency: currency,
            payment_options: 'card, mobilemoney, ussd, banktransfer',
            customer: {
              email: user?.email || 'coongames8@gmail.com',
              //phone_number: '',
              name: user?.username || user?.email,
            },
            customizations: {
              title: `Get ${subscription.plan} VIP Subcription`,
              description: `Payment for ${subscription.billing} VIP Plan`,
              logo: 'https://goalkings.onrender.com/assets/logo-BFf6YmWu.png',
            },
        };

        const handleFlutterPayment = useFlutterwave(config);

        handleFlutterPayment({
            callback: (response) => {
                console.log("Payment response Data: ", response);
                // 2. STAGEFRONT VERIFICATION CHECKPOINTS
                // Do NOT trust the response blindly. Cross-check your parameters:
                const isStatusValid = response.status === "successful" //|| response.status === "completed";
                const isAmountValid = Number(response.amount) === data.price;
                const isCurrencyValid = response.currency === currency;
                const hasTxRef = response.tx_ref === config.tx_ref;

                if (isStatusValid && isAmountValid && isCurrencyValid && hasTxRef) {
                  handleUpgrade()
                } else {
                  // Fraud prevention triggered
                  //alert("Payment verification failed! Data mismatch detected.");
                  setNotification({
                    isVisible: true,
                    type: 'error',
                    message: err.message || 'Payment failed. Please try again.',
                  });
                }
               closePaymentModal(); // Programmatically close the modal
            },
            onClose: () => {
              setNotification({
                isVisible: true,
                type: 'error',
                message: "Payment modal closed by user.",
              });
              setPaying(false);
            },
        });
    };

    const displaySymbol = data?.currency || symbol;

    return (
        <div className="pay">
            <AppHelmet title="Subscribe" />
            <ScrollToTop />
            {loading && <Loader />}
            {data && (
                <div className="pay-card">
                    <span className="plan-badge">{data.plan}</span>
                    <div className="price">
                        <span className="amount">{displaySymbol} {data.price.toLocaleString()}</span>
                    </div>
                    <span className="plan-name">{data.plan} Subscription</span>
                    <div className="plan-features">
                        <span className="feature">{data.billing} billing</span>
                        <span className="feature">Premium predictions</span>
                        <span className="feature">Daily VIP tips</span>
                    </div>
                    <button onClick={handlePayment} className="btn btn-primary">
                        Pay Now
                    </button>
                </div>
            )}
        </div>
    );
}
