import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import './NotFound.scss';

export default function NotFound() {
  return (
    <div className='not-found'>
      <AppHelmet title={"404 Error"}/>
      <ScrollToTop />
      <span className="error-code">404</span>
      <h1>Page Not Found</h1>
      <h2>The page you are looking for does not exist</h2>
      <button onClick={() => window.history.back()} className='btn'>Go Back</button>
    </div>
  )
}
