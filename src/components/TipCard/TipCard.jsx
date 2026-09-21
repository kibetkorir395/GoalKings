import './TipCard.scss';
import { truncateTitle } from '../../utils/textUtils';
import { tipDateTimeToDate, formatInUserLocale } from '../../utils/dateUtils';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BiEdit } from 'react-icons/bi';
import { userNameSelector } from '../../recoil/selectors';
import { useRecoilValue } from 'recoil';

const SUBSCRIPTION_ACCESS = {
	Daily: 0,
	Weekly: 6,
	Monthly: 29,
  };
  
  // Parse "M/D/YYYY" safely into a Date at midnight local time
  function parseTipDate(str) {
	if (!str) return null;
	const [m, d, y] = str.split('/').map(Number);
	if (!m || !d || !y) return null;
	return new Date(y, m - 1, d);
  }
  
  // Whole-day difference (b - a) ignoring time
  function daysBetween(a, b) {
	const MS = 1000 * 60 * 60 * 24;
	const aMid = new Date(a.getFullYear(), a.getMonth(), a.getDate());
	const bMid = new Date(b.getFullYear(), b.getMonth(), b.getDate());
	return Math.round((bMid - aMid) / MS);
  }



export default function TipCard({ tip, isAdmin, today, user }) {
  const [hidden, setHidden] = useState(true);
  const isPremiumUser = useRecoilValue(userNameSelector);

  /*useEffect(() => {
    if (isAdmin || isPremiumUser) {
      setHidden(false);
    } else if (tip.date === today && tip.premium) {
      setHidden(tip.status !== 'finished');
    } else {
      setHidden(false);
    }
  }, [isPremiumUser, isAdmin, tip]);*/

  useEffect(() => {
    // Admins see everything
    if (isAdmin) {
      setHidden(false);
      return;
    }

    // Non-premium users: only past tips + today's finished tips
    if (!user?.isPremium) {
      if (tip.premium) {
        // Free user + premium tip
        const tipDate = parseTipDate(tip.date);
        const now = new Date();
        const diff = tipDate ? daysBetween(now, tipDate) : 0;

        if (diff > 0) {
          // Future premium tip → hidden
          setHidden(true);
        } else if (diff === 0) {
          // Today's premium tip → hidden until finished
          setHidden(tip.status !== 'finished');
        } else {
          // Past premium tip → reveal (results known)
          setHidden(false);
        }
      } else {
        // Free tip → always visible
        setHidden(false);
      }
      return;
    }

    // Premium user: use subscription plan to limit future visibility
    const plan = user.subscription?.plan || 'Daily';
    const allowedAhead = SUBSCRIPTION_ACCESS[plan] ?? 0;

    // Which date does the user's subscription start from?
    // Use subDate if present, otherwise today.
    const subStart = user.subscription?.subDate
      ? new Date(user.subscription.subDate)
      : new Date();

    // The furthest future date this user may see
    const maxFutureDate = new Date(subStart);
    maxFutureDate.setDate(maxFutureDate.getDate() + allowedAhead);

    const tipDate = parseTipDate(tip.date);
    if (!tipDate) {
      setHidden(false);
      return;
    }

    // Hide anything beyond the allowed future window
    if (tipDate > maxFutureDate) {
      setHidden(true);
      return;
    }

    // Also hide today's/future premium tips until finished (same as free rule)
    const diff = daysBetween(new Date(), tipDate);
    if (tip.premium && diff >= 0 && tip.status !== 'finished') {
      setHidden(true);
      return;
    }

    setHidden(false);
  }, [isAdmin, user, tip]);

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

  const tipDate = tipDateTimeToDate(tip.date, tip.time);

  const localTime = tipDate
    ? new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(tipDate)
    : tip.time;

  const localDate = tipDate
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
      }).format(tipDate)
    : tip.date;

  return (
    <div className={`tip-card ${tip.premium ? 'vip' : 'free'}`}>
      <div className="tip-header">
        <span className="badge time">{localTime}</span>
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
