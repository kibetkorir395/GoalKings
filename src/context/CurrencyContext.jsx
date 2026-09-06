import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const CURRENCY_CONFIG = {
  KE: { currency: 'KES', symbol: 'KSH', name: 'Kenyan Shilling', rate: 1 },
  NG: { currency: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 11.63 },
  GH: { currency: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 0.11 },
  ZA: { currency: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 0.14 },
  UG: { currency: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', rate: 28.5 },
  TZ: { currency: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', rate: 20.2 },
  RW: { currency: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', rate: 10.1 },
  ZM: { currency: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', rate: 0.21 },
  MW: { currency: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', rate: 13.2 },
  BF: { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', rate: 4.6 },
  CI: { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', rate: 4.6 },
  SN: { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', rate: 4.6 },
  CM: { currency: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', rate: 4.6 },
  US: { currency: 'USD', symbol: '$', name: 'United States Dollar', rate: 0.0076 },
  GB: { currency: 'GBP', symbol: '£', name: 'British Pound', rate: 0.006 },
  EU: { currency: 'EUR', symbol: '€', name: 'Euro', rate: 0.007 },
  default: { currency: 'KES', symbol: 'KSH', name: 'Kenyan Shilling', rate: 1 },
};

export function CurrencyProvider({ children }) {
  const [country, setCountry] = useState(null);
  const [currencyInfo, setCurrencyInfo] = useState(CURRENCY_CONFIG.default);
  const [locality, setLocality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        await setLocality(data);
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
  
    // Dynamically finds the correct country object matching the current currency selection
    const matchingConfig = Object.values(CURRENCY_CONFIG).find(
      (config) => config.currency === currencyInfo.currency
    );
  
    if (matchingConfig && matchingConfig.rate) {
      return Math.round(kesPrice * matchingConfig.rate);
    }
  
    return kesPrice;
  };

  const value = {
    country,
    currency: currencyInfo.currency,
    locality,
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
