import { useState } from 'react';
import './Faq.scss';
import { faqs } from '../../data';

export default function Faq() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleAccordion = (id) => {
    setActiveFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="container" id='faq'>
      <h1>FAQ's</h1>
      <h2>People ask for:</h2>
      <div className="accordion">
        {faqs.map((faq) => (
          <div
            className="accordion-item"
            key={faq.id}
            onClick={() => toggleAccordion(faq.id)}
            aria-expanded={activeFaq === faq.id}
          >
            <button id={`accordion-button-${faq.id}`}>
              <span className="accordion-title">{faq.question}</span>
              <span className="icon" aria-hidden="true"></span>
            </button>
            {activeFaq === faq.id && (
              <div className="accordion-content">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
