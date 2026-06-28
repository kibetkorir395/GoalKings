import { NavLink } from 'react-router-dom';
import './About.scss';
import Faq from '../../components/Faq/Faq';
import Newsletter from '../../components/Newsletter/Newsletter';
import Testimonials from '../../components/Testimonials/Testimonials';
import ScrollToTop from '../ScrollToTop';
import AppHelmet from '../AppHelmet';

const About = () => {
    return (
        <div className="about">
            <ScrollToTop />
            <AppHelmet title={"About"} />
            <div className="about-hero">
                <h1>About Us</h1>
                <p>Your ultimate destination for accurate football predictions, insightful analysis, and real-time updates.</p>
            </div>
            <div className="about-content">
                <div className="about-section">
                    <h2>For Football Fans</h2>
                    <p>Dive into a world of football predictions and analysis. From the Premier League to international tournaments, we provide forecasts backed by data and expert insights. Stay ahead of the game with our curated content, tailored to keep you informed and engaged throughout the season.</p>
                </div>
                <div className="about-section">
                    <h2>For Bettors and Analysts</h2>
                    <p>Gain access to detailed match predictions, player stats, and historical data to make informed decisions. Our platform is designed to empower you with the tools and insights you need to succeed, whether you are betting for fun or professionally analyzing the sport.</p>
                </div>
                <div className="about-section">
                    <h2>Stay Updated with Real-Time Insights</h2>
                    <p>Our platform delivers live updates, ensuring you are always informed about the latest match developments, team news, and performance metrics. Subscribe to our alerts and never miss a critical update during the season.</p>
                </div>
                <div className="about-section">
                    <h2>Our Mission</h2>
                    <p>We aim to revolutionize football predictions by combining cutting-edge technology, expert knowledge, and community-driven engagement. Join us today and become part of a thriving community that shares your passion for football and the excitement of the game. Let us predict, analyze, and celebrate football together!</p>
                </div>
                <div className="about-cta">
                    <NavLink to="/" className="btn">Get Started</NavLink>
                    <NavLink to="/#pricing" className="btn">View Pricing</NavLink>
                </div>
            </div>
            <div className="about-faq-wrapper">
                <Faq />
            </div>
            <div className="about-testimonials">
                <h2>Testimonials</h2>
                <h3>What our clients say</h3>
                <Testimonials />
            </div>
            <div className="about-newsletter">
                <Newsletter />
            </div>
        </div>
    );
}

export default About;
