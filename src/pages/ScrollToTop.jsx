import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    // Scroll to top with smooth behavior on route change
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // If the URL has a hash, scroll to that element
    const hash = location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]); // Run the effect whenever the location changes

  return null; // This component doesn't render anything
};

export default ScrollToTop;
