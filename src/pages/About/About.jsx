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
            <div className="about-us">
                <div className="info">
                    <h1>About Us</h1>
                    <p>Welcome to our football prediction platform, your ultimate destination for accurate match forecasts, insightful analysis, and real-time updates! Whether you're a football enthusiast, a seasoned bettor, or just curious about the beautiful game, our website offers something special for everyone.</p>
                    <h1>For Football Fans</h1>
                    <p>Dive into a world of football predictions and analysis. From the Premier League to international tournaments, we provide forecasts backed by data and expert insights. Stay ahead of the game with our curated content, tailored to keep you informed and engaged throughout the season.</p>
                    <h1>For Bettors and Analysts</h1>
                    <p>Gain access to detailed match predictions, player stats, and historical data to make informed decisions. Our platform is designed to empower you with the tools and insights you need to succeed, whether you're betting for fun or professionally analyzing the sport.</p>
                    <h1>Stay Updated with Real-Time Insights</h1>
                    <p>Our platform delivers live updates, ensuring you're always informed about the latest match developments, team news, and performance metrics. Subscribe to our alerts and never miss a critical update during the season.</p>
                    <h1>Our Mission</h1>
                    <p>We aim to revolutionize football predictions by combining cutting-edge technology, expert knowledge, and community-driven engagement. Join us today and become part of a thriving community that shares your passion for football and the excitement of the game. Let's predict, analyze, and celebrate football together!</p>

                    <div className="links">
                        <NavLink to="/contact" title='contact' className="btn">Contact Us</NavLink>
                        <NavLink to="#subscribe" title='newsletter' className='btn'>Newsletter</NavLink>
                    </div>
                </div>
            </div>
            <Faq />
            <h1>Testimonials</h1>
            <h2>What clients say</h2>
            <Testimonials />
            <Newsletter />
        </div>
    );
}

export default About;