//import "./UserCard.scss";
import backgroundImage from '../../assets/3.jpg';
import backgroundImage2 from '../../assets/4.jpg';
import backgroundImage3 from '../../assets/5.jpg';
import backgroundImage4 from '../../assets/10.jpg';
import { MdOutlineEmail } from 'react-icons/md';
import { NavLink } from "react-router-dom";

const UserCard = ({user}) => {

	function formatDate(dateString) {
		const date = new Date(dateString);
		let day = date.getDate();

		// Append the suffix for the day (st, nd, rd, th)
		const suffix = (day) => {
			if (day > 3 && day < 21) return "th"; // 11th to 13th are special
			switch (day % 10) {
				case 1:
					return "st";
				case 2:
					return "nd";
				case 3:
					return "rd";
				default:
					return "th";
			}
		};

		const formattedDate = `${day}${suffix(day)} ${date.toLocaleString("en-GB", {
			month: "long",
			year: "numeric",
		})}`;
		return formattedDate;
	}
  return (
  <NavLink className="card user-card"  to={`/users/${user.username ? "@" + user.username : user.email}`} state={user}>
    <div className="cover-bg"  style={{
      background: `#fff url(${user.isPremium ? backgroundImage3 : backgroundImage4}) center no-repeat`,
    }}></div>
    <div className="user-info-wrap">
      <img src={user.isPremium ? backgroundImage : backgroundImage2} alt="" className="user-photo" />
      <div className="user-info">
        <div className="user-name">{user.subscription ? user.subscription : " Free"} Plan</div>
        <p className="user-title">@{user.username}</p>
      </div>
    </div>
    <div className="user-bio">
        <div className="data"><MdOutlineEmail className="mail" /> {user.email}</div>
        <div className="data">{user.subscription ? user.subscription : " Free"} Plan</div>
      {user.subscription && <>
        <div className="data">{formatDate(user.subDate)}</div>
      </>}
      </div>
  </NavLink>
)};

export default UserCard;