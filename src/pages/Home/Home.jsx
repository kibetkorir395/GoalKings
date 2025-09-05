import Featured from '../../components/Featured/Featured';
import './Home.scss';
import Pricing from "../../components/Pricing/Pricing";
import ScrollToTop from "../ScrollToTop";
import AppHelmet from "../AppHelmet";
import Tips from "../../components/Tips/Tips";

export default function Home() {
	return (
		<div className="Home">
			<ScrollToTop />
			<AppHelmet title={""} />
			<Tips />
			<Featured />
			<Pricing />
		</div>
	);
}
