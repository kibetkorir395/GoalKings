import { useState } from 'react'
import AppHelmet from '../../pages/AppHelmet';
import Loader from '../../components/Loader/Loader';
import '../AdminAdd.scss';
import { addTip } from '../../firebase';
import ScrollToTop from '../../pages/ScrollToTop';
import { notificationState } from '../../recoil/atoms';
import { useSetRecoilState } from 'recoil';

export default function AddTip() {
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [odd, setOdd] = useState('');
  const [pick, setPick] = useState('');
  const [status, setStatus] = useState('');
  const [time, setTime] = useState('');
  const [won, setWon] = useState('');
  const [premium, setPremium] = useState(false);
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const setNotification = useSetRecoilState(notificationState);

  const handleSubmit = (e) => {
    e.preventDefault();
    const d = new Date(time);
    const date = new Intl.DateTimeFormat('en-US').format(d);
    const timeOnly = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    addTip({
      home, away, date, odd, pick, status,
      time: timeOnly, won, premium, results
    }, setNotification, setLoading);
  };

  return (
    <div className='admin-tips'>
      <AppHelmet title={"Add Tip"} />
      <ScrollToTop />
      <div className="admin-card">
        <h1>Add Tip</h1>
        {!loading && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="home">Home Team</label>
              <input type="text" placeholder='e.g. Manchester United' id='home' value={home} onChange={(e) => setHome(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="away">Away Team</label>
              <input type="text" placeholder='e.g. Liverpool' id='away' value={away} onChange={(e) => setAway(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="odds">Odds</label>
              <input type="text" placeholder='e.g. 1.5' id='odds' value={odd} onChange={(e) => setOdd(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="pick">Pick</label>
              <input type="text" placeholder='e.g. Home Win' id='pick' value={pick} onChange={(e) => setPick(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <input type="text" placeholder='Finish / Pending / Live' id='status' value={status} onChange={(e) => setStatus(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="time">Date / Time</label>
              <input type="datetime-local" id='time' value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="results">Results</label>
              <input type="text" placeholder='e.g. 2-1' id='results' value={results} onChange={(e) => setResults(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="won">Is Won</label>
              <input type="text" placeholder='won / pending / lost' id='won' value={won} onChange={(e) => setWon(e.target.value)} required />
            </div>
            <div className="form-group checkbox">
              <input type="checkbox" id='premium' onChange={(e) => setPremium(e.target.checked)} checked={premium} />
              <label htmlFor="premium">Is VIP</label>
            </div>
            <div className="form-actions">
              <button type="submit" className='btn btn-primary' aria-label="add">Add Tip</button>
            </div>
          </form>
        )}
        {loading && <Loader />}
      </div>
    </div>
  )
}
