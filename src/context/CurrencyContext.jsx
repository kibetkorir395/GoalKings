import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const EXCHANGE_RATES = {
  KES: { NGN: 12.5 },
  NGN: { KES: 0.08 },
};

const CURRENCY_CONFIG = {
  KE: { currency: 'KES', symbol: 'KSH', name: 'Kenyan Shilling' },
  NG: { currency: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  default: { currency: 'KES', symbol: 'KSH', name: 'Kenyan Shilling' },
};

export function CurrencyProvider({ children }) {
  const [country, setCountry] = useState(null);
  const [currencyInfo, setCurrencyInfo] = useState(CURRENCY_CONFIG.default);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;

        setCountry(countryCode);
        const config = CURRENCY_CONFIG[countryCode] || CURRENCY_CONFIG.default;
        setCurrencyInfo(config);
      } catch (error) {
        console.error('Failed to detect country:', error);
        setCurrencyInfo(CURRENCY_CONFIG.default);
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  const convertPrice = (kesPrice) => {
    if (currencyInfo.currency === 'KES') {
      return kesPrice;
    }

    const rate = EXCHANGE_RATES.KES[currencyInfo.currency];
    if (rate) {
      return Math.round(kesPrice * rate);
    }

    return kesPrice;
  };

  const value = {
    country,
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    name: currencyInfo.name,
    loading,
    convertPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
