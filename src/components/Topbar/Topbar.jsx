import './Topbar.scss';
import { Link } from 'react-router-dom';
import { socialUrls } from '../../data';

export default function Topbar() {
  return (
    <div className='topbar'>
      {
          socialUrls.map(social => {
              return (
                  <Link 
                      to={social.url} 
                      title={social.title} 
                      target='_blank' 
                      key={social.id}
                  >
                      {social.icon}
                  </Link>
              );
          })
          
      }
    </div>
  )
}