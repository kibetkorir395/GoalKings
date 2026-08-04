import { useLocation, useNavigate } from 'react-router-dom';
import './Pay.scss';
import { useEffect, useState, useRef } from 'react';
import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import Loader from '../../components/Loader/Loader';
import { pricings } from '../../data';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { notificationState, subscriptionState, userState } from '../../recoil/atoms';
import { getUser, updateUser } from '../../firebase';
import { useCurrency } from '../../context/CurrencyContext';
import Swal from 'sweetalert2';

// Flutterwave API Configuration
const FLUTTERWAVE_API_BASE = "https://stackblitz-starters-esjaecw1-production.up.railway.app/api";

export default function FlutterwavePayment() {
    const [user, setUser] = useRecoilState(userState);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const location = useLocation();
    const [data, setData] = useState(null);
    const setNotification = useSetRecoilState(notificationState);
    const [subscription, setSubscription] = useRecoilState(subscriptionState);
    const navigate = useNavigate();
    const { symbol, currency, convertPrice } = useCurrency();
    
    // Flutterwave states
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [awaitingOtp, setAwaitingOtp] = useState(false);
    const [step, setStep] = useState(0);
    const [flutterwaveError, setFlutterwaveError] = useState(null);
    const pollRef = useRef(null);
    const referenceRef = useRef(null);

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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollRef.current) {
                pollRef.current.cancel();
            }
        };
    }, []);

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

    // Helper functions
    const safeJson = async (response) => {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            return { error: "Invalid JSON response", raw: text, status: response.status };
        }
    };

    const handleFlutterwaveError = (data, response, fallback) => {
        const message =
            data?.message ||
            data?.error ||
            data?.flutterwave_error?.message ||
            data?.error_type ||
            `${fallback}: ${response.status}`;
        return new Error(message);
    };

    const formatPhone = (p) => {
        let clean = p.replace(/\D/g, '');
        
        if (!clean) return '';
        
        if (clean.startsWith('0')) {
            return clean;
        }
        
        if (clean.startsWith('254')) {
            return '0' + clean.slice(3);
        }
        
        if (clean.startsWith('7') || clean.startsWith('1')) {
            return '0' + clean;
        }
        
        if (clean.startsWith('+')) {
            return clean;
        }
        
        return clean;
    };

    const isValidPhoneNumber = (phone) => {
        const digits = phone.replace(/\D/g, "");
        const cleanDigits = digits.replace(/^\+/, '');
        
        const isValid = 
            (digits.length === 10 && (digits.startsWith('07') || digits.startsWith('01'))) ||
            (digits.length === 12 && (digits.startsWith('2547') || digits.startsWith('2541'))) ||
            (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) ||
            (digits.length === 13 && digits.startsWith('2547')) ||
            (digits.length === 13 && digits.startsWith('2541'));
        
        return isValid;
    };

    const normalizePhoneNumber = (phone) => {
        let clean = phone.replace(/\D/g, '');
        
        if (clean.startsWith('0')) {
            return clean;
        }
        
        if (clean.startsWith('254')) {
            return '0' + clean.slice(3);
        }
        
        if (clean.startsWith('7') || clean.startsWith('1')) {
            return '0' + clean;
        }
        
        if (clean.startsWith('254')) {
            return '0' + clean.slice(3);
        }
    
        return clean;
    };

    // Flutterwave API Functions
    const initiateFlutterwavePayment = async ({ email, amount, phone, userId, activation_type }) => {
        const response = await fetch(`${FLUTTERWAVE_API_BASE}/flow/initiate/mpesa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                amount: amount.toString(),
                phone,
                userId: userId || "anonymous",
                activation_type: activation_type || "account_activation",
                fullname: user?.displayName || user?.name || 'Customer',
                currency: data?.currency || 'KES',
            }),
        });
        const responseData = await safeJson(response);
        if (!response.ok || !responseData.success) {
            throw handleFlutterwaveError(responseData, response, "Payment initialization failed");
        }
        return responseData;
    };

    const checkFlutterwaveStatus = async (checkoutId) => {
        const response = await fetch(`${FLUTTERWAVE_API_BASE}/flow/status/${encodeURIComponent(checkoutId)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const responseData = await safeJson(response);
        if (!response.ok || !responseData.success) {
            throw handleFlutterwaveError(responseData, response, "Status check failed");
        }
        return responseData;
    };

    const verifyFlutterwavePayment = async (reference) => {
        const response = await fetch(`${FLUTTERWAVE_API_BASE}/transactions/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tx_ref: reference }),
        });
        const responseData = await safeJson(response);
        if (!response.ok || !responseData.success) {
            throw handleFlutterwaveError(responseData, response, "Verification failed");
        }
        return responseData;
    };

    const submitFlutterwaveOtp = async (reference, otpCode) => {
        const response = await fetch(`${FLUTTERWAVE_API_BASE}/flow/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                checkoutId: reference,
                otp: otpCode.toString() 
            }),
        });
        const responseData = await safeJson(response);
        if (!response.ok || !responseData.success) {
            throw handleFlutterwaveError(responseData, response, "OTP submission failed");
        }
        return responseData;
    };

    const pollFlutterwaveTransaction = (checkoutId, onSuccess, onFailure, onRequireOtp, maxAttempts = 36) => {
        let attempts = 0;
        let suspended = false;
        let cancelled = false;
        let timer = null;

        const tick = async () => {
            if (cancelled || suspended) return;
            attempts++;
            try {
                const statusData = await checkFlutterwaveStatus(checkoutId);
                if (cancelled) return;

                // Check if payment is completed
                const isCompleted = statusData?.status?.status === 'completed' || 
                                   statusData?.status === 'completed' ||
                                   statusData?.data?.status === 'completed';
                
                if (isCompleted) {
                    const verified = await verifyFlutterwavePayment(checkoutId).catch(() => null);
                    onSuccess(verified || statusData);
                    return;
                }
                
                // Check if payment failed
                const isFailed = statusData?.status?.status === 'failed' || 
                                statusData?.status === 'failed' ||
                                statusData?.data?.status === 'failed';
                
                if (isFailed) {
                    onFailure({ message: statusData.message || "Payment failed. Please try again." });
                    return;
                }
                
                // Check if OTP is required
                if (statusData.requires_action && statusData.status === "send_otp" && onRequireOtp) {
                    suspended = true;
                    onRequireOtp(checkoutId);
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    onFailure({ timeout: true, message: "Payment timeout. Please try again." });
                }
            } catch (error) {
                if (cancelled) return;
                if (attempts >= maxAttempts) {
                    onFailure({ timeout: true, error: error.message });
                }
            }
        };

        timer = setInterval(tick, 5000);
        tick();

        return {
            async resume() {
                if (cancelled) return;
                suspended = false;
                attempts = 0;
                tick();
            },
            cancel() {
                cancelled = true;
                if (timer) clearInterval(timer);
            },
        };
    };

    const initiatePayment = async (phoneNumber) => {
        setProcessing(true);
        setAwaitingOtp(false);
        setOtp('');
        setFlutterwaveError(null);
    
        Swal.fire({
            title: "Initiating Payment",
            html: "Connecting to M-Pesa...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    
        try {
            const formattedPhone = formatPhone(phoneNumber);
            
            if (!isValidPhoneNumber(formattedPhone)) {
                throw new Error("Invalid phone number format. Please use a valid Kenyan number.");
            }
    
            const email = user?.email;
            const amount = data != null ? data.price : convertPrice(subscription.price);
    
            if (!email) {
                throw new Error("User email not found. Please login again.");
            }
    
            console.log('Formatted phone for API:', formattedPhone);
    
            const response = await initiateFlutterwavePayment({
                email: email,
                amount: amount,
                phone: formattedPhone,
                userId: user?.email || "anonymous",
                activation_type: "vip_subscription",
            });
    
            if (!response.checkoutId && !response.tx_ref) {
                throw new Error('No reference returned from payment gateway');
            }
    
            Swal.close();
            referenceRef.current = response.checkoutId || response.tx_ref;
            setStep(1);
    
            const displayPriceLocal = displayPrice; // Capture current value
    
            pollRef.current = pollFlutterwaveTransaction(
                referenceRef.current,
                async () => {
                    setProcessing(false);
                    setLoading(true);
                    Swal.fire({
                        title: "Payment Successful! 🎉",
                        html: `
                            <div style="text-align: center;">
                                <i class="fas fa-check-circle" style="font-size: 48px; color: #10b981;"></i>
                                <h3 style="margin: 15px 0;">${displaySymbol} ${displayPriceLocal.toLocaleString()} Paid</h3>
                                <p>Your VIP subscription payment was successful!</p>
                            </div>
                        `,
                        icon: "success",
                        confirmButtonText: "Activate Subscription",
                        confirmButtonColor: "#059669",
                    }).then(() => {
                        handleUpgrade();
                    });
                },
                (err) => {
                    setProcessing(false);
                    setStep(0);
                    const errorMsg = err?.timeout 
                        ? 'Payment timed out. Please check your transaction status.' 
                        : (err?.message || 'Payment failed. Please try again.');
                    setFlutterwaveError(errorMsg);
                    setNotification({
                        isVisible: true,
                        type: 'error',
                        message: errorMsg,
                    });
                    Swal.fire({
                        title: "Payment Failed",
                        text: errorMsg,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                },
                (reference) => {
                    setAwaitingOtp(true);
                    setProcessing(false);
                    setStep(0);
                    Swal.close();
                    Swal.fire({
                        title: "OTP Required",
                        text: "A one-time code has been sent to your phone. Please enter it below.",
                        icon: "info",
                        confirmButtonText: "OK",
                    });
                }
            );
        } catch (e) {
            Swal.close();
            setProcessing(false);
            const errorMsg = e.message || "Unable to process payment. Please try again.";
            setFlutterwaveError(errorMsg);
            setNotification({
                isVisible: true,
                type: 'error',
                message: errorMsg,
            });
            Swal.fire({
                title: "Payment Failed",
                text: errorMsg,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handleSubmitOtp = async () => {
        if (!otp) {
            setFlutterwaveError('Please enter the OTP sent to your phone');
            return;
        }
        setFlutterwaveError(null);
        setProcessing(true);
        try {
            await submitFlutterwaveOtp(referenceRef.current, otp);
            setAwaitingOtp(false);
            setProcessing(true);
            setStep(1);
            if (pollRef.current) {
                await pollRef.current.resume();
            }
        } catch (e) {
            setProcessing(false);
            const errorMsg = e.message || "Invalid OTP. Please try again.";
            setFlutterwaveError(errorMsg);
            setNotification({
                isVisible: true,
                type: 'error',
                message: errorMsg,
            });
            Swal.fire({
                title: "OTP Verification Failed",
                text: errorMsg,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handlePayment = async () => {
        if (!user) {
            Swal.fire({
                title: "Login Required",
                text: "Please login first",
                icon: "warning",
                confirmButtonText: "OK",
            });
            return;
        }
    
        const { value: phoneNumber } = await Swal.fire({
            title: "Enter M-Pesa Phone Number",
            html: `
                <div style="text-align: center; margin-bottom: 15px;">
                    <i class="fas fa-mobile-alt" style="font-size: 48px; color: #065f46;"></i>
                </div>
                <p style="margin-bottom: 15px;">Enter the M-Pesa phone number to receive the payment prompt.</p>
                <p style="font-size: 0.8rem; color: #666;">
                    Accepted formats: 
                    07XXXXXXXX, 01XXXXXXXX, 
                    2547XXXXXXXX, 2541XXXXXXXX,
                    7XXXXXXXX, 1XXXXXXXX
                </p>
            `,
            input: "tel",
            inputPlaceholder: "e.g., 0712345678 or 254712345678",
            showCancelButton: true,
            confirmButtonText: "Continue",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#059669",
            cancelButtonColor: "#6c757d",
            reverseButtons: true,
            inputValidator: (value) => {
                if (!value) {
                    return "Phone number is required!";
                }
                if (!isValidPhoneNumber(value)) {
                    return "Please enter a valid phone number.\nFormats: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX";
                }
                return null;
            }
        });
    
        if (!phoneNumber) return;
    
        setPhone(phoneNumber);
        await initiatePayment(phoneNumber);
    };

    // Declare display values before use
    const displaySymbol = data?.currency || symbol;
    const displayPrice = data?.price || convertPrice(subscription?.price);

    return (
        <div className="pay">
            <AppHelmet title="Subscribe" />
            <ScrollToTop />
            {loading && <Loader />}
            {data && (
                <div className="pay-card">
                    <span className="plan-badge">{data.plan}</span>
                    <div className="price">
                        <span className="amount">{displaySymbol} {displayPrice.toLocaleString()}</span>
                    </div>
                    <span className="plan-name">{data.plan} Subscription</span>
                    <div className="plan-features">
                        <span className="feature">{data.billing} billing</span>
                        <span className="feature">Premium predictions</span>
                        <span className="feature">Daily VIP tips</span>
                    </div>

                    {awaitingOtp && (
                        <div style={{ width: '100%', marginTop: '12px' }}>
                            <input
                                type="text"
                                placeholder="Enter OTP code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="input-field"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                                maxLength={6}
                            />
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'left' }}>
                                A one-time code was sent to your phone
                            </p>
                            {flutterwaveError && (
                                <p style={{ fontSize: '13px', color: '#dc2626', margin: '-8px 0 4px 0', textAlign: 'left' }}>
                                    ⚠️ {flutterwaveError}
                                </p>
                            )}
                        </div>
                    )}

                    <button 
                        onClick={awaitingOtp ? handleSubmitOtp : handlePayment} 
                        className="btn btn-primary"
                        disabled={processing}
                    >
                        {processing ? "Processing..." : awaitingOtp ? "Submit OTP" : "Pay Now"}
                    </button>
                </div>
            )}
        </div>
    );
}