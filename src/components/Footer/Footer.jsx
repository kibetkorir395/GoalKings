import './Footer.scss';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { socialUrls } from '../../data';
import { userState } from '../../recoil/atoms';
import { useRecoilValue } from 'recoil';
import { useEffect, useState } from 'react';

const Footer = () => {
    const user = useRecoilValue(userState);
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (user && ['kkibetkkoir@gmail.com', 'charleykibet254@gmail.com', 'coongames8@gmail.com'].includes(user.email)) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, [user]);
    return (
			<div className="footer theme">
				<div className="social">
					<h2>Follow us</h2>
					<div className="wrapper">
						{socialUrls.map((social) => {
							return (
								<Link
									to={social.url}
									title={social.title}
									target="_blank"
									key={social.id}
								>
									{social.icon}
								</Link>
							);
						})}
					</div>
				</div>

				<div className="section-wrapper theme">
					<section>
						<h2>Goal Kings</h2>
						<div className="items-container theme">
							<NavLink to="/" title="Goal Kings" state={{ from: location }}>
								Home
							</NavLink>
							<NavLink to="/login" title="login" state={{ from: location }}>
								Sign In
							</NavLink>
							<NavLink
								to="/register"
								title="register"
								state={{ from: location }}
							>
								Get Started
							</NavLink>
							<NavLink to="/about" title="about us" state={{ from: location }}>
								About Us
							</NavLink>
						</div>
					</section>
					{isAdmin && (
						<section>
							<h2>Admin</h2>
							<div className="items-container theme">
								<NavLink to="/add-tip" title="help" state={{ from: location }}>
									Add Tip
								</NavLink>
								<NavLink
									to="/add-post"
									title="services"
									state={{ from: location }}
								>
									Add Post
								</NavLink>
								<NavLink to="/users" title="store" state={{ from: location }}>
									All Users
								</NavLink>
							</div>
						</section>
					)}
				</div>
				<hr />
				<div className="footer-bottom theme">
					<p>&copy; Goal Kings {new Date().getFullYear()}</p>
					<NavLink to="/about/#faq" title="help" state={{ from: location }}>
						FAQ
					</NavLink>
				</div>
			</div>
		);
}

export default Footer;
