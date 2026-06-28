import './TipCard.scss';
import { truncateTitle } from '../../utils/textUtils';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BiEdit } from 'react-icons/bi';
import { userNameSelector } from '../../recoil/selectors';
import { useRecoilValue } from 'recoil';

export default function TipCard({ tip, isAdmin, today }) {
  const [hidden, setHidden] = useState(true);
  const isPremiumUser = useRecoilValue(userNameSelector);

  useEffect(() => {
    if (isAdmin || isPremiumUser) {
      setHidden(false);
    } else if (tip.date === today && tip.premium) {
      setHidden(tip.status !== 'finished');
    } else {
      setHidden(false);
    }
  }, [isPremiumUser, isAdmin, tip]);

  function getTipStatus(tip) {
    if (tip.status === 'pending') {
      return (
        <span className="pending">{tip.results ? tip.results : '?-?'} 🔄</span>
      );
    } else if (tip.won === 'won') {
      return (
        <span className="won">{tip.results ? tip.results : '?-?'} ✅</span>
      );
    } else {
      return (
        <span className="lost">{tip.results ? tip.results : '?-?'} ❌</span>
      );
    }
  }

  return (
    <div className={`tip-card ${tip.premium ? 'vip' : 'free'}`}>
      <div className="tip-header">
        <span className="badge time">{tip.time}</span>
        {isAdmin && (
          <NavLink className="edit-btn" to={'/edit-tip'} state={tip}>
            <BiEdit />
          </NavLink>
        )}
        <span className="badge status">{getTipStatus(tip)}</span>
        <span className="badge odd">ODD {tip.odd}</span>
      </div>

      <div className="tip-body">
        <p className={`team home ${hidden && 'hidden'}`}>
          {!hidden ? truncateTitle(tip.home, 45) : 'CLOSED'}
        </p>
        <div className="pick">{tip.pick}</div>
        <p className={`team away ${hidden && 'hidden'}`}>
          {!hidden ? truncateTitle(tip.away, 45) : 'CLOSED'}
        </p>
      </div>
    </div>
  );
}
