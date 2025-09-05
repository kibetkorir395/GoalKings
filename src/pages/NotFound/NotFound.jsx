import AppHelmet from '../AppHelmet';
import ScrollToTop from '../ScrollToTop';
import './NotFound.scss';

export default function NotFound() {
  return (
    <div className='not-found'>
        <AppHelmet title={"404 Error"}/>
        <ScrollToTop />
        <h1>404 Error</h1>
        <h2 className='sub-heading'>PAGE NOT FOUND</h2>
        <button onClick={() => {
          window.history.back();
        }} className='btn'>Go Back &raquo;</button>
    </div>
  )
}
