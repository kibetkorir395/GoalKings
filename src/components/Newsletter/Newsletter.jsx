import {useState } from 'react';
import './Newsletter.scss';
import { addMailList } from '../../firebase';
import { useRecoilState, useSetRecoilState} from 'recoil';
import { notificationState } from '../../recoil/atoms';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const setNotification = useSetRecoilState(notificationState);
  
    const handleSubmit = (event) => {
      event.preventDefault();
      addMailList({ email },  setNotification, setEmail);
    };
    return (
        <div className='newsletter theme'  id='subscribe'>
            <h3>
                Subscribe to our newsletter
            </h3>
            <p>
                Kindly fill the form below.
            </p>
            <form onSubmit={handleSubmit}>
                <input type='email' placeholder="example@company.com" value={email} onChange={(e) => setEmail(e.target.value)} pattern='/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/'/>
                <button type='submit'>
                    SUBMIT
                </button>
            </form>
        </div>
    );
}

export default Newsletter;
