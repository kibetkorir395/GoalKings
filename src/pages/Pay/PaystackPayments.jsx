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

// Paystack API Configuration
const PAYMENT_API_BASE = "https://payment-api-production-ea97.up.railway.app/api";

export default function PaystackPayments() {
    const [user, setUser] = useRecoilState(userState);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const location = useLocation();
    const [data, setData] = useState(null);
    const setNotification = useSetRecoilState(notificationState);
    const [subscription, setSubscription] = useRecoilState(subscriptionState);
    const navigate = useNavigate();
    const { symbol, currency, convertPrice } = useCurrency();
    
    // Paystack states
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [awaitingOtp, setAwaitingOtp] = useState(false);
    const [step, setStep] = useState(0);
    const [paystackError, setPaystackError] = useState(null);
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

    const handlePaystackError = (data, response, fallback) => {
        const message =
            data?.message ||
            data?.error ||
            data?.paystack_error?.message ||
            data?.error_type ||
            `${fallback}: ${response.status}`;
        return new Error(message);
    };

    const formatPhone = (p) => {
        let clean = p.replace(/\D/g, '');
        
        // If empty, return empty
        if (!clean) return '';
        
        // If it starts with 0 (07XXXXXXXX or 01XXXXXXXX)
        if (clean.startsWith('0')) {
            return clean;
        }
        
        // If it starts with 254 (2547XXXXXXXX or 2541XXXXXXXX)
        if (clean.startsWith('254')) {
            return '0' + clean.slice(3);
        }
        
        // If it starts with 7 or 1 (7XXXXXXXX or 1XXXXXXXX)
        if (clean.startsWith('7') || clean.startsWith('1')) {
            return '0' + clean;
        }
        
        // If it starts with + (international format)
        if (clean.startsWith('+')) {
            return clean;
        }
        
        // Default - return as is
        return clean;
    };

    const isValidPhoneNumber = (phone) => {
        const digits = phone.replace(/\D/g, "");
        
        // Remove leading + if present
        const cleanDigits = digits.replace(/^\+/, '');
        
        // Check if it's a valid Kenyan number
        // 07XXXXXXXX (10 digits starting with 07)
        // 01XXXXXXXX (10 digits starting with 01)
        // 2547XXXXXXXX (12 digits starting with 2547)
        // 2541XXXXXXXX (12 digits starting with 2541)
        // 7XXXXXXXX (9 digits starting with 7)
        // 1XXXXXXXX (9 digits starting with 1)
        // +2547XXXXXXXX (13 characters)
        // +2541XXXXXXXX (13 characters)
        
        const isValid = 
            (digits.length === 10 && (digits.startsWith('07') || digits.startsWith('01'))) ||
            (digits.length === 12 && (digits.startsWith('2547') || digits.startsWith('2541'))) ||
            (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) ||
            (digits.length === 13 && digits.startsWith('2547')) ||
            (digits.length === 13 && digits.startsWith('2541'));
        
        return isValid;
    };


    // Helper function to normalize phone number to a standard format
    const normalizePhoneNumber = (phone) => {
        let clean = phone.replace(/\D/g, '');
        
        // If it starts with 0 (07 or 01)
        if (clean.startsWith('0')) {
            return clean;
        }
        
        // If it starts with 254
        if (clean.startsWith('254')) {
            return '0' + clean.slice(3);
        }
        
        // If it starts with 7 or 1 (without 0)
        if (clean.startsWith('7') || clean.startsWith('1')) {
            return '0' + clean;
        }
        
        // If it starts with +254
        if (clean.startsWith('254')) {
            return '0' + clean.slice(3);
        }
    
        return clean;
    };

    // Get display version of phone number
    const getDisplayPhoneNumber = (phone) => {
      const normalized = normalizePhoneNumber(phone);
      if (normalized.startsWith('0')) {
            return normalized;
      }
      return '0' + normalized;
    };

    const initializePaystackPayment = async ({ email, amount, phone, userId, activation_type }) => {
        const response = await fetch(`${PAYMENT_API_BASE}/initialize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                amount: amount.toString(),
                phone,
                userId: userId || "anonymous",
                activation_type: activation_type || "account_activation",
            }),
        });
        const data = await safeJson(response);
        if (!response.ok || !data.success) {
            throw handlePaystackError(data, response, "Payment initialization failed");
        }
        return data;
    };

    const checkPaystackStatus = async (reference) => {
        const response = await fetch(`${PAYMENT_API_BASE}/status/${encodeURIComponent(reference)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await safeJson(response);
        if (!response.ok || !data.success) {
            throw handlePaystackError(data, response, "Status check failed");
        }
        return data;
    };

    const verifyPaystackPayment = async (reference) => {
        const response = await fetch(`${PAYMENT_API_BASE}/verify/${encodeURIComponent(reference)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await safeJson(response);
        if (!response.ok || !data.success) {
            throw handlePaystackError(data, response, "Verification failed");
        }
        return data;
    };

    const submitPaystackOtp = async (reference, otpCode) => {
        const response = await fetch(`${PAYMENT_API_BASE}/submit-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp: otpCode.toString(), reference }),
        });
        const data = await safeJson(response);
        if (!response.ok || !data.success) {
            throw handlePaystackError(data, response, "OTP submission failed");
        }
        return data;
    };

    const pollPaystackTransaction = (reference, onSuccess, onFailure, onRequireOtp, maxAttempts = 36) => {
        let attempts = 0;
        let suspended = false;
        let cancelled = false;
        let timer = null;

        const tick = async () => {
            if (cancelled || suspended) return;
            attempts++;
            try {
                const data = await checkPaystackStatus(reference);
                if (cancelled) return;

                if (data.paid) {
                    const verified = await verifyPaystackPayment(reference).catch(() => null);
                    onSuccess(verified || data);
                    return;
                }
                if (data.requires_action && data.status === "send_otp" && onRequireOtp) {
                    suspended = true;
                    onRequireOtp(reference);
                    return;
                }
                if (data.can_retry) {
                    onFailure({ message: data.message || "Payment failed. Please try again." });
                    return;
                }
                if (attempts >= maxAttempts) {
                    onFailure({ timeout: true });
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
        setPaystackError(null);
    
        Swal.fire({
            title: "Initiating Payment",
            html: "Connecting to M-Pesa...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    
        try {
            // Format the phone number - this will handle all formats
            const formattedPhone = formatPhone(phoneNumber);
            
            // Validate the formatted phone
            if (!isValidPhoneNumber(formattedPhone)) {
                throw new Error("Invalid phone number format. Please use a valid Kenyan number.");
            }
    
            const email = user?.email;
            const amount = data != null ? data.price : convertPrice(subscription.price);
    
            if (!email) {
                throw new Error("User email not found. Please login again.");
            }
    
            const response = await initializePaystackPayment({
                email: email,
                amount: amount,
                phone: formattedPhone, // Send the formatted version
                userId: user?.email || "anonymous",
                activation_type: "vip_subscription",
            });
    
            if (!response.reference) {
                throw new Error('No reference returned from payment gateway');
            }
    
            Swal.close();
            referenceRef.current = response.reference;
            setStep(1);
    
            pollRef.current = pollPaystackTransaction(
                response.reference,
                async () => {
                    setProcessing(false);
                    setLoading(true);
                    Swal.fire({
                        title: "Payment Successful! 🎉",
                        html: `
                            <div style="text-align: center;">
                                <i class="fas fa-check-circle" style="font-size: 48px; color: #10b981;"></i>
                                <h3 style="margin: 15px 0;">${displaySymbol} ${data.price.toLocaleString()} Paid</h3>
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
                    setPaystackError(errorMsg);
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
            setPaystackError(errorMsg);
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
            setPaystackError('Please enter the OTP sent to your phone');
            return;
        }
        setPaystackError(null);
        setProcessing(true);
        try {
            await submitPaystackOtp(referenceRef.current, otp);
            setAwaitingOtp(false);
            setProcessing(true);
            setStep(1);
            if (pollRef.current) {
                await pollRef.current.resume();
            }
        } catch (e) {
            setProcessing(false);
            const errorMsg = e.message || "Invalid OTP. Please try again.";
            setPaystackError(errorMsg);
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
    
        // Show phone number input modal with updated validation message
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
                            {paystackError && (
                                <p style={{ fontSize: '13px', color: '#dc2626', margin: '-8px 0 4px 0', textAlign: 'left' }}>
                                    ⚠️ {paystackError}
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