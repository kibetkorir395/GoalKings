import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export default function AppHelmet({ title, description }) {
  const location = useLocation();
  const canonicalUrl = `https://goalkings.com${location.pathname}`;
  const siteName = 'Goal Kings';
  const defaultDescription = 'Get expert football predictions, VIP tips, live scores, and the latest betting odds. Premium predictions for top leagues worldwide.';

  const pageTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} - Expert Football Predictions & VIP Tips`;

  const pageDescription = description || defaultDescription;

  return (
    <Helmet>
      <html lang="en" />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />

      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content="football tips, football predictions, VIP tips, live scores, betting odds, Premier League, La Liga, Serie A, Bundesliga, Champions League, football betting, match predictions" />
      <meta name="author" content="Goal Kings" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Theme Colors */}
      <meta name="theme-color" content="#059212" />
      <meta name="msapplication-navbutton-color" content="#059212" />
      <meta name="msapplication-TileColor" content="#059212" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content="https://goalkings.com/logo512.png" />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:alt" content={`${siteName} Logo`} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@goalkings_ke" />
      <meta name="twitter:creator" content="@goalkings_ke" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content="https://goalkings.com/logo512.png" />
      <meta name="twitter:image:alt" content={`${siteName} Logo`} />

      {/* PWA / Native App */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/logo192.png" />
    </Helmet>
  );
}
