import './Pricing.scss';
import { NavLink, useLocation } from 'react-router-dom';
import { pricings } from '../../data';
import { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function Pricing() {
  const [billing, setBilling] = useState("Day");
  const location = useLocation();
  const { symbol, convertPrice } = useCurrency();

  return (
    <div className='pricing' id='pricing'>
      <h1 className='head'>Pricing</h1>
      <div className="pricing-header">
        <div className="plans-switch-container">
          <div className="plans-options">
            <label>
              <input
                type="radio"
                name="billing"
                value="Day"
                checked={billing === "Day"}
                onChange={() => setBilling("Day")}
              />
              Daily
            </label>
            <label>
              <input
                type="radio"
                name="billing"
                value="Week"
                checked={billing === "Week"}
                onChange={() => setBilling("Week")}
              />
              Weekly
            </label>
            <label>
              <input
                type="radio"
                name="billing"
                value="Month"
                checked={billing === "Month"}
                onChange={() => setBilling("Month")}
              />
              Monthly
            </label>
          </div>
        </div>

      </div>
      <div className="wrapper">
        {
          pricings.filter(item => item.billing === billing).map(pricing => {
            const convertedPrice = convertPrice(pricing.price);
            return (
              <div key={pricing.id}>
                <h2><span>{symbol} {convertedPrice}</span>/{pricing.billing}</h2>
                <p>{pricing.title}</p>
                <h3>Features</h3>
                <ul>
                  {
                    pricing.features.map(feature => {
                      return <li key={feature.split(" ").join("_")}>{feature}</li>
                    })
                  }
                </ul>
                <img src="https://i.postimg.cc/2jV99bKc/Vector-1.png" alt="bg" className="table-bg" />
                <NavLink
                  className="btn"
                  style={{ backgroundColor: pricing.color }}
                  state={{
                    from: location,
                    subscription: {
                      ...pricing,
                      price: convertedPrice,
                      currency: symbol
                    }
                  }}
                  to={"/subscribe"}
                >
                  Subscribe now
                </NavLink>
              </div>
            );
          })
        }

      </div>
    </div>
  )
}
