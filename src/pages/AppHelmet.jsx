import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export default function AppHelmet({ title }) {
  const location = useLocation();
  const canonicalUrl = `${window.location.origin}${location.pathname}`;

  return (
    <Helmet>
      {/* Existing meta tags */}
      <meta charSet="UTF-8" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/logo32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/logo16.png" />
      <link rel="apple-touch-icon" href="/logo192.png" />
      <link rel="manifest" href="/manifest.json" crossorigin="anonymous" />
      <link rel="shortcut icon" type="image/x-icon" href="/logo512.png" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no"
      />
      <meta name="theme-color" content="#00BFFF" />
      <meta
        name="description"
        content="Get all the latest ✓Fixed VIP Tips ✓Football Predictions, ✓Latest Football Betting Odds and livescores, results & fixtures for all leagues and competitions, including the Premier League, Championship and across the world."
      />
      <meta
        name="keywords"
        content="Football Predictions, Betting Odds, Live Scores, Live Sports, Football Results, Football Fixtures, Football Today, Premier League, Championship, Super Sports, Laliga, Bundesliga, Serie A"
      />
      <meta name="author" content="Goal Kings" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph tags for social media */}
      <meta property="og:title" content={title} />
      <meta
        property="og:description"
        content="Get all the latest ✓Fixed VIP Tips ✓Football Predictions, ✓Latest Football Betting Odds and livescores, results & fixtures for all leagues and competitions."
      />
      <meta
        property="og:image"
        content={`${window.location.origin}/logo512.png`}
      />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta
        name="twitter:description"
        content="Get all the latest ✓Fixed VIP Tips ✓Football Predictions, ✓Latest Football Betting Odds and livescores, results & fixtures for all leagues and competitions."
      />
      <meta
        name="twitter:image"
        content={`${window.location.origin}/logo512.png`}
      />

      {/* X (Twitter) Base Pixel */}
      <script>
        {`
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config','ql57w');
        `}
      </script>

      <title>{title} | Welcome to the Home for Football Predictions!</title>
    </Helmet>
  );
}
