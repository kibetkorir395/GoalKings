import { IoLogoFacebook, IoLogoInstagram, IoLogoWhatsapp } from "react-icons/io5";
import Image1 from './assets/10.jpg';
import Image2 from './assets/3.jpg';
import Image3 from './assets/4.jpg';
import { FaTelegram } from "react-icons/fa";
import { PiXLogo } from "react-icons/pi";

export const pricings = [
	{
		id: "1",
		plan: "Daily",
		billing: "Day",
		title: "Full access to daily predictions",
		price: 250,
		features: [
			"Access 24 hours VIP predictions.",
			"Expert Football Predictions",
			"Daily unbeatable football predictions!",
		],
		color: "#059212",
	},
	{
		id: "2",
		plan: "Weekly",
		billing: "Week",
		title: "Exclusive weekly access to expert tips",
		price: 850,
		features: [
			"20+ odds daily + Correct Scores",
			"Enjoy a full week of VIP predictions",
			"Get the scoop on this week’s matches",
		],
		color: "#00A36C",
	},
	{
		id: "3",
		plan: "Monthly",
		billing: "Month",
		title: "Comprehensive predictions for dedicated fans",
		price: 2500,
		features: [
			"Plan ahead with our monthly predictions.",
			"Get unlimited VIP access for a month",
			"Your 30 Day winning streak starts here!",
		],
		color: "#0A6847",
	},
];

export const faqs = [
	{
		id: 1,
		question: "What is the accuracy of your football predictions?",
		answer:
			"Our predictions are based on a combination of historical data, expert analysis, and advanced algorithms. While no prediction is 100% guaranteed, we strive to provide highly accurate and data-driven insights to help you make informed decisions.",
	},
	{
		id: 2,
		question: "How can I subscribe to your services?",
		answer:
			"You can easily subscribe through our website. We offer several tiered subscription plans that suit different needs, from basic insights to premium, detailed predictions. Simply choose your plan and proceed with payment through secure method we have provided.",
	},
	{
		id: 3,
		question: "Can I cancel or change my subscription?",
		answer:
			"No, you cannot terminate your subscription. Make sure to be certain about making a subscription so that you will not be charged against your will.",
	},
	{
		id: 4,
		question: "What kind of football matches do you provide predictions for?",
		answer:
			"We provide predictions for major leagues, international tournaments, and high-profile football matches. This includes competitions like the Premier League, La Liga, Serie A, Champions League, World Cup, and more.",
	},
	{
		id: 6,
		question: "How do you calculate your predictions?",
		answer:
			"Our predictions are based on a combination of factors, including team performance, player statistics, historical match data, and even current form. We also incorporate machine learning models to continuously improve the accuracy of our predictions.",
	},
	{
		id: 7,
		question: "Can I trust your predictions for betting?",
		answer:
			"While our predictions are based on solid data and analysis, betting should always be done responsibly, and we cannot be held accountable for any losses.",
	},
	{
		id: 8,
		question: "Do you provide live updates during matches?",
		answer:
			"Yes, we offer live updates during key matches. These updates provide additional insights, such as in-game performance metrics, injury reports, and tactical changes that may affect match outcomes.",
	},
	{
		id: 9,
		question: "What is the best subscription plan for me?",
		answer:
			"It depends on your needs. Our basic plan offers essential predictions, while our premium plans provide more detailed analysis, advanced stats, and expert insights. Review the plans and choose the one that best fits your level of interest.",
	},
	{
		id: 10,
		question: "How secure is my payment information?",
		answer:
			"We take security seriously. All payment transactions are processed through secure, encrypted payment gateway. Your payment information is never stored on our servers.",
	},
];

export const featured = [
	{
		emoji: "🤝",
		title: "100% Guaranteed",
	},
	{
		emoji: "✅",
		title: "Secure Payments",
	},
	{
		emoji: "🏆",
		title: "Expert Analysis",
	},
	{
		emoji: "🚀",
		title: "Live Updates",
	},
];

export const socialUrls = [
	{
		id: 1,
		icon: <IoLogoFacebook />,
		url: "https://www.facebook.com/share/1ETmmWvxHn/",
		title: "Facebook",
	},
	{
		id: 2,
		icon: <FaTelegram />,
		url: "https://t.me/goalkings_ke",
		title: "Telegram",
	},
	{
		id: 3,
		icon: <IoLogoWhatsapp />,
		url: "https://whatsapp.com/channel/0029VbAzC5EA89Mi4nOZRu0n",
		title: "WhatsApp",
	},
	{
		id: 4,
		icon: <PiXLogo />,
		url: "https://x.com/goalkings_ke",
		title: "X(Twitter)",
	},
	{
		id: 5,
		icon: <IoLogoInstagram />,
		url: "https://instagram.com/goalkings_ke",
		title: "Instagram",
	},
];

export const slides = [
  {
    id: 1,
    img: Image1,
    title: "Expert Football Predictions for Major Leagues",
    link: "/tips"
  },
  {
    id: 2,
    img: Image2,
    title: "Subscribe To Detailed and Real-Time Match Predictions and Insights",
    link: "/pricing"
  },
  {
    id: 3,
    img: Image3,
    title: "Stay Updated with the Latest Football News and Trends",
    link: "/news"
  },
]

export const testimonials = [
  {
    id: 1,
    name: "James Kariuki",
    title: "Daily Plan",
    description: "The predictions helped me make smarter decisions. Great for casual bettors like me!"
  },
  {
    id: 2,
    name: "Jonny_john",
    title: "Monthly Plan",
    description: "The expert analysis and detailed stats are game-changers. Highly recommend the Premium plan!"
  },
  {
    id: 3,
    name: "Alicia Chepkoech",
    title: "Weekly Plan",
    description: "As a serious football fan, the Platinum plan provides unmatched predictions!"
  },
  {
    id: 4,
    name: "Johnson Nekesa",
    title: "Daily Plan",
    description: "The real-time updates and in-depth stats are fantastic. Helped me stay ahead of the game!"
  },
  {
    id: 5,
    name: "sarah-nduku",
    title: "Monthly Plan",
    description: "Worth every penny! The predictions are accurate, and the insights are top-notch."
  }
]
