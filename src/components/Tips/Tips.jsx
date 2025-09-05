import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import TipCard from '../TipCard/TipCard';
import './Tips.scss';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { pricings } from '../../data';
import AppHelmet from '../../pages/AppHelmet';
import ScrollToTop from '../../pages/ScrollToTop';
import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/atoms';
import Loader from '../Loader/Loader';
import { getTips } from '../../firebase';

export default function Tips() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [firstIcon, setFirstIcon] = useState("flex");
  const [lastIcon, setLastIcon] = useState("flex");

  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [user, setUser] = useRecoilState(userState);
  const [isAdmin, setAdmin] = useState(false);
	const [gamesType, setGamesType] = useState(true);
	const [tips, setTips] = useState(null);

	const location = useLocation();

	const tabBoxRef = useRef();

	const handleIcons = () => {
		let scrollVal = Math.round(tabBoxRef.current.scrollLeft);
		let maxScrollableWidth =
			tabBoxRef.current.scrollWidth - tabBoxRef.current.clientWidth;
		setFirstIcon(scrollVal >= 1 ? "flex" : "none");
		setLastIcon(maxScrollableWidth > scrollVal + 1 ? "flex" : "none");
	};

	const handleClick = (direction) => {
		const scrollAmount = direction === "left" ? -350 : 350;
		tabBoxRef.current.scrollLeft += scrollAmount;
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US");
	};

	const returnDate = (dateString) => {
		const [year, month, day] = dateString.split("-").map(Number);
		const date = new Date(year, month - 1, day);

		if (isNaN(date.getTime())) {
			console.error("Invalid date:", dateString);
			return "Invalid Date";
		}

		const today = new Date();
		const isToday =
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear();

		const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
		const monthDay = date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});

		return isToday ? `${weekday}, Today` : `${weekday} ${monthDay}`;
	};

	useEffect(() => {
		const tabBox = tabBoxRef.current;

		const mouseDownHandler = (e) => {
			setIsDragging(true);
			setStartX(e.pageX - tabBox.offsetLeft);
			setScrollLeft(tabBox.scrollLeft);
		};

		const mouseMoveHandler = (e) => {
			if (!isDragging) return;
			e.preventDefault();
			const x = e.pageX - tabBox.offsetLeft;
			const walk = (x - startX) * 5;
			tabBox.scrollLeft = scrollLeft - walk;
		};

		const mouseUpHandler = () => {
			setIsDragging(false);
		};

		tabBox.addEventListener("mousedown", mouseDownHandler);
		tabBox.addEventListener("mousemove", mouseMoveHandler);
		tabBox.addEventListener("mouseup", mouseUpHandler);
		tabBox.addEventListener("mouseleave", mouseUpHandler);
		tabBox.addEventListener("scroll", handleIcons);

		return () => {
			tabBox.removeEventListener("mousedown", mouseDownHandler);
			tabBox.removeEventListener("mousemove", mouseMoveHandler);
			tabBox.removeEventListener("mouseup", mouseUpHandler);
			tabBox.removeEventListener("mouseleave", mouseUpHandler);
			tabBox.removeEventListener("scroll", handleIcons);
		};
	}, [isDragging, startX, scrollLeft]);

	useEffect(() => {
		let dates = [];
		const today = new Date();

		for (let i = 0; i < 14; i++) {
			let date = new Date(today);
			date.setDate(date.getDate() - i);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			dates.push(`${year}-${month}-${day}`);
		}
		setDays(dates.reverse());
	}, []);

	useEffect(() => {
		days && setCurrentDate(days[days.length - 1]);
	}, [days]);

	useEffect(() => {
		if (!tabBoxRef.current) return;
		const tabBox = tabBoxRef.current;
		tabBox.scrollLeft = tabBox.scrollWidth - tabBox.clientWidth;
		handleIcons();
	}, [tabBoxRef.current]);

	useEffect(() => {
		getTips(setTips, setLoading, formatDate(currentDate));
	}, [currentDate]);

	useEffect(() => {
		if (
			user &&
			[
				"kkibetkkoir@gmail.com",
				"charleykibet254@gmail.com",
				"coongames8@gmail.com",
			].includes(user.email)
		) {
			setAdmin(true);
		} else {
			setAdmin(false);
		}
	}, [user]);

	return (
		<div className="tips">
			<AppHelmet title={"Tips"} />
			<ScrollToTop />
			<div className="date-wrapper">
				<div className="icon" style={{ display: firstIcon }}>
					<MdArrowBackIos
						className="item"
						onClick={() => handleClick("left")}
					/>
				</div>
				<ul
					className={`tabs-box ${isDragging ? "dragging" : ""}`}
					ref={tabBoxRef}
					style={{
						overflow: "auto",
						whiteSpace: "nowrap",
						cursor: isDragging ? "grabbing" : "grab",
						userSelect: "none",
					}}
				>
					{days &&
						days.map((day) => (
							<li
								className={`tab ${currentDate === day && "active"}`}
								onClick={() => setCurrentDate(day)}
								key={days.indexOf(day)}
								aria-label={day}
							>
								<span>{returnDate(day).split(" ")[0]}</span>
								<span>
									{returnDate(day).split(" ")[1]}{" "}
									{returnDate(day).split(" ")[2]}
								</span>
							</li>
						))}
				</ul>
				<div className="icon" style={{ display: lastIcon }}>
					<MdArrowForwardIos
						className="item"
						onClick={() => handleClick("right")}
					/>
				</div>
			</div>
			<NavLink className={"subscribe-btn"} state={{ from: location, subscription: pricings[0] }} to={"/subscribe"}>
				SUBSCRIBE TO VIEW VIP TIPS
			</NavLink>
			<form className="type">
				<fieldset>
					<input
						name="games-type"
						type="radio"
						value={true}
						id="ALL"
						checked={gamesType === true}
						onChange={(e) => setGamesType(true)}
					/>
					<label htmlFor="ALL">VIP TIPS 👑</label>
				</fieldset>
				<fieldset>
					<input
						name="games-type"
						type="radio"
						value={false}
						id="OV_UN"
						checked={gamesType === false}
						onChange={(e) => setGamesType(false)}
					/>
					<label htmlFor="OV_UN">FREE TIPS 🎁</label>
				</fieldset>
			</form>
			{loading && <Loader />}
			<div className="container">
				<div className="tips-content container">
					{!loading &&
						tips &&
						tips
							.filter((item) => item.premium === gamesType)
							.map((tip, index) => (
								<TipCard
									key={index}
									tip={tip}
									isAdmin={isAdmin}
									today={formatDate(days[days.length - 1])}
								/>
							))}
				</div>
			</div>
		</div>
	);
}
