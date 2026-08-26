//import "./UserCard.scss";
import { useEffect, useState, useMemo } from 'react';
import backgroundImage from '../../assets/3.jpg';
import backgroundImage2 from '../../assets/4.jpg';
import backgroundImage3 from '../../assets/5.jpg';
import backgroundImage4 from '../../assets/10.jpg';
import { MdOutlineEmail, MdLocationPin, MdAndroid } from 'react-icons/md';
import { RiMacbookFill } from "react-icons/ri";
import { FaInternetExplorer } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { FaWindows } from "react-icons/fa";
import { FaLinux } from "react-icons/fa"; 
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

	useEffect(() => {
		//user.subscription && console.log(user.email)
	}, [user]);
  return (
  <NavLink className="card user-card"  to={`/users/${user.username ? "@" + user.username : user.email}`} state={user}>
    <div className="cover-bg"  style={{
      background: `#fff url(${user.isPremium ? backgroundImage3 : backgroundImage4}) center no-repeat`,
    }}></div>
    <div className="user-info-wrap">
      <img src={user.isPremium ? backgroundImage : backgroundImage2} alt="" className="user-photo" />
      <div className="user-info">
        <div className="user-name">{user.subscription ? user.subscription.plan : " Free"} Plan</div>
        <p className="user-title">@{user.username}</p>
		<div className="user-location">
	        {user.locality && <><MdLocationPin className="badge-icon" />{user.locality.city}, {user.locality.region}</>}
			{user.visitedWebsites && (() => {
                    const firstWithDevice = Object.entries(user.visitedWebsites).find(
                        ([key, value]) => value && value.device
                    );

                    const siteData = firstWithDevice ? firstWithDevice[1] : null;
                    
                    // This is the object: e.g., { device: 'iOS' } or similar
                    const deviceObj = siteData ? siteData.device : null; 

                    // Adjust 'deviceObj.type' or 'deviceObj.name' if the string lives under a different key
                    const deviceName = deviceObj && typeof deviceObj === 'object' 
                        ? (deviceObj.device || deviceObj.type || "").toLowerCase() : "";

                    if (deviceName) {
                        switch (deviceName) {
                            case 'ios':
                            case 'mac':
                                return <FaApple className="detail-icon"/>;
                            case 'android':
                                return <MdAndroid className="detail-icon"/>;
                            case 'windows':
                                return <FaWindows className="detail-icon"/>;
                            case 'linux':
                                return <FaLinux />;
                            default:
                                return <FaInternetExplorer className="detail-icon"/>;
                        }
                    }
                    return null; // Return null if no device match is found
                })()}
        </div>
		
      </div>
    </div>
    <div className="user-bio">
        <div className="data"><MdOutlineEmail className="mail" /> {user.email}</div>
        <div className="data">{user.subscription?.plan ? user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1) : " Free"} Plan</div>
        {user.subscription && <div className="data">{formatDate(user.subscription.subDate)}</div>}
      </div>
  </NavLink>
)};

export default UserCard;